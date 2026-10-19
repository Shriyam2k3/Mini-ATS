import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { User } from "@/models/User";
import { requireAuth } from "@/lib/permissions";
import { candidateSchema } from "@/lib/validators";
import { recordActivity } from "@/lib/activity";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { user } = authCheck;

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.candidates)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload. 'candidates' array is required." },
        { status: 400 }
      );
    }

    const { candidates, dryRun = true } = body;
    await connectToDatabase();

    let creatorId = user.id;
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId.toString())) {
      const dbUser = await User.findOne({ email: user.email.toLowerCase() });
      if (dbUser) {
        creatorId = dbUser._id.toString();
      }
    }

    const validationErrors: { row: number; email: string; error: string }[] = [];
    const validCandidates: any[] = [];
    const seenEmailsInBatch = new Set<string>();

    for (let i = 0; i < candidates.length; i++) {
      const rowNum = i + 1;
      const raw = candidates[i];

      const validation = candidateSchema.safeParse(raw);
      if (!validation.success) {
        validationErrors.push({
          row: rowNum,
          email: raw.email || "N/A",
          error: validation.error.errors[0]?.message || "Validation failed",
        });
        continue;
      }

      const email = validation.data.email.toLowerCase();

      // Check duplicates inside the batch
      if (seenEmailsInBatch.has(email)) {
        validationErrors.push({
          row: rowNum,
          email,
          error: `Duplicate email "${email}" found multiple times in the import file.`,
        });
        continue;
      }
      seenEmailsInBatch.add(email);

      // Check duplicate in database
      const existingInDb = await Candidate.findOne({ email });
      if (existingInDb) {
        validationErrors.push({
          row: rowNum,
          email,
          error: `Candidate with email "${email}" already exists in the database.`,
        });
        continue;
      }

      const validJobId =
        validation.data.jobId && mongoose.Types.ObjectId.isValid(validation.data.jobId)
          ? new mongoose.Types.ObjectId(validation.data.jobId)
          : undefined;

      validCandidates.push({
        ...validation.data,
        jobId: validJobId,
        createdBy: new mongoose.Types.ObjectId(creatorId),
      });
    }

    // If dry run, just return the preview result
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        totalRows: candidates.length,
        validCount: validCandidates.length,
        errorCount: validationErrors.length,
        errors: validationErrors,
        preview: validCandidates.slice(0, 5),
      });
    }

    // Commit mode: only write valid candidates
    if (validCandidates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid candidate records to import.",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    const createdRecords = await Candidate.insertMany(validCandidates);

    // Record activity for each imported candidate
    for (const record of createdRecords) {
      await recordActivity({
        candidateId: record._id,
        type: "CREATED",
        title: "Candidate Imported from CSV",
        description: `Imported by ${user.name || "Recruiter"} via bulk CSV import tool.`,
        newValue: record.stage,
        actorId: user.id,
        actorName: user.name || "Recruiter",
      });
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      message: `Successfully imported ${createdRecords.length} candidate(s).`,
      importedCount: createdRecords.length,
      skippedCount: validationErrors.length,
      errors: validationErrors,
    });
  } catch (error: any) {
    console.error("CSV Import error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process candidate import" },
      { status: 500 }
    );
  }
}
