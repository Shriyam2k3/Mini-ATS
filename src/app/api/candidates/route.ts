import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import { candidateSchema, candidateQuerySchema } from "@/lib/validators";
import { requireAuth } from "@/lib/permissions";
import { recordActivity } from "@/lib/activity";
import mongoose, { FilterQuery } from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/candidates - List candidates with search, filter, sort, and pagination
export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const queryValidation = candidateQuerySchema.safeParse({
      search: searchParams.get("search") || undefined,
      stage: searchParams.get("stage") || undefined,
      jobId: searchParams.get("jobId") || undefined,
      skill: searchParams.get("skill") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      sort: searchParams.get("sort") || "createdAt",
      order: searchParams.get("order") || "desc",
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const {
      search,
      stage,
      jobId,
      skill,
      startDate,
      endDate,
      sort,
      order,
      page,
      limit,
    } = queryValidation.data;

    const filter: FilterQuery<any> = {};

    if (stage && stage !== "ALL") {
      filter.stage = stage;
    }

    if (jobId && jobId !== "ALL") {
      filter.jobId = jobId;
    }

    if (skill && skill.trim()) {
      filter.skills = { $regex: new RegExp(skill.trim(), "i") };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search && search.trim() !== "") {
      const sanitized = search.trim();
      const regex = new RegExp(sanitized, "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { jobRole: regex },
        { currentCompany: regex },
        { skills: regex },
      ];
    }

    const skip = (page - 1) * limit;
    const sortField = sort || "createdAt";
    const sortDirection = order === "asc" ? 1 : -1;

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email image")
        .populate("jobId", "title department status")
        .lean(),
      Candidate.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: candidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("GET /api/candidates error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}

// POST /api/candidates - Create a new candidate
export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { user } = authCheck;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid JSON body" },
        { status: 400 }
      );
    }

    const validation = candidateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || "Validation failed",
          details: validation.error.flatten(),
        },
        { status: 422 }
      );
    }

    const candidateData = validation.data;
    await connectToDatabase();

    // Sanitize jobId: if empty string or invalid, treat as undefined
    const validJobId =
      candidateData.jobId && mongoose.Types.ObjectId.isValid(candidateData.jobId)
        ? candidateData.jobId
        : undefined;

    // Check if target job is closed (Requirement 6)
    if (validJobId) {
      const job = await Job.findById(validJobId);
      if (job && job.status === "Closed") {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot assign candidate to job "${job.title}" because this job is closed.`,
          },
          { status: 400 }
        );
      }
    }

    // Check for existing candidate with same normalized email
    const existing = await Candidate.findOne({ email: candidateData.email });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `A candidate with email ${candidateData.email} is already registered in the system.`,
        },
        { status: 409 }
      );
    }

    // Ensure valid MongoDB ObjectId for createdBy
    let creatorId = user.id;
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId.toString())) {
      const dbUser = await User.findOne({ email: user.email.toLowerCase() });
      if (dbUser) {
        creatorId = dbUser._id.toString();
      }
    }

    const newCandidate = await Candidate.create({
      ...candidateData,
      jobId: validJobId ? new mongoose.Types.ObjectId(validJobId) : undefined,
      createdBy: new mongoose.Types.ObjectId(creatorId),
    });

    // Record initial activity in timeline
    await recordActivity({
      candidateId: newCandidate._id,
      type: "CREATED",
      title: "Candidate Profile Created",
      description: `Candidate profile created in "${newCandidate.stage}" stage for ${newCandidate.jobRole}.`,
      newValue: newCandidate.stage,
      actorId: creatorId,
      actorName: user.name || "Recruiter",
    });

    const populatedCandidate = await Candidate.findById(newCandidate._id)
      .populate("createdBy", "name email image")
      .populate("jobId", "title department status")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Candidate created successfully",
        data: populatedCandidate,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/candidates error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "A candidate with this email address already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create candidate" },
      { status: 500 }
    );
  }
}
