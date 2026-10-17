import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { requireAuth } from "@/lib/permissions";
import { noteSchema } from "@/lib/validators";
import { recordActivity } from "@/lib/activity";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { user } = authCheck;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid candidate ID" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    const validation = noteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Invalid note" },
        { status: 422 }
      );
    }

    const { note } = validation.data;
    await connectToDatabase();

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Append to existing notes with timestamp and recruiter attribution
    const timestamp = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const formattedNote = `[${timestamp} - ${user.name || "Recruiter"}]: ${note}`;

    candidate.notes = candidate.notes
      ? `${formattedNote}\n\n${candidate.notes}`
      : formattedNote;

    await candidate.save();

    // Record activity event
    await recordActivity({
      candidateId: candidate._id,
      type: "NOTE_ADDED",
      title: "Recruiter Note Added",
      description: note.length > 120 ? `${note.slice(0, 120)}...` : note,
      actorId: user.id,
      actorName: user.name || "Recruiter",
    });

    return NextResponse.json({
      success: true,
      message: "Note added successfully",
      notes: candidate.notes,
    });
  } catch (error: any) {
    console.error("POST candidate note error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add recruiter note" },
      { status: 500 }
    );
  }
}
