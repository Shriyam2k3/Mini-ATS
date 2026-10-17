import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Interview } from "@/models/Interview";
import { Candidate } from "@/models/Candidate";
import { interviewSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/permissions";
import { recordActivity } from "@/lib/activity";
import { FilterQuery } from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/interviews - List scheduled interviews
export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get("candidateId");
    const status = searchParams.get("status");
    const timeframe = searchParams.get("timeframe"); // "upcoming" | "past" | "all"

    const filter: FilterQuery<any> = {};

    if (candidateId) {
      filter.candidateId = candidateId;
    }

    if (status && status !== "ALL") {
      filter.status = status;
    }

    const now = new Date();
    if (timeframe === "upcoming") {
      filter.scheduledAt = { $gte: now };
      filter.status = "Scheduled";
    } else if (timeframe === "past") {
      filter.$or = [
        { scheduledAt: { $lt: now } },
        { status: { $in: ["Completed", "Cancelled"] } },
      ];
    }

    const interviews = await Interview.find(filter)
      .sort({ scheduledAt: timeframe === "past" ? -1 : 1 })
      .populate("candidateId", "name email jobRole stage phone resumeUrl")
      .populate("jobId", "title department")
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json({
      success: true,
      data: interviews,
    });
  } catch (error: any) {
    console.error("GET /api/interviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

// POST /api/interviews - Schedule a new interview
export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { user } = authCheck;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Missing JSON body" }, { status: 400 });
    }

    const validation = interviewSchema.safeParse(body);
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

    const { candidateId, jobId, scheduledAt, durationMinutes, interviewType, interviewerName, meetingLink, notes } = validation.data;

    await connectToDatabase();

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });
    }

    const interviewDate = new Date(scheduledAt);
    if (isNaN(interviewDate.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid interview date" }, { status: 400 });
    }

    const newInterview = await Interview.create({
      candidateId,
      jobId: jobId || candidate.jobId,
      scheduledAt: interviewDate,
      durationMinutes,
      interviewType,
      interviewerName,
      meetingLink,
      notes,
      status: "Scheduled",
      createdBy: user.id,
    });

    // Record activity in candidate timeline
    const formattedDate = interviewDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    await recordActivity({
      candidateId,
      type: "INTERVIEW_SCHEDULED",
      title: `${interviewType} Interview Scheduled`,
      description: `Scheduled for ${formattedDate} with interviewer ${interviewerName}.`,
      newValue: interviewType,
      actorId: user.id,
      actorName: user.name || "Recruiter",
    });

    const populated = await Interview.findById(newInterview._id)
      .populate("candidateId", "name email jobRole stage")
      .populate("jobId", "title department")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Interview scheduled successfully",
        data: populated,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/interviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to schedule interview" },
      { status: 500 }
    );
  }
}
