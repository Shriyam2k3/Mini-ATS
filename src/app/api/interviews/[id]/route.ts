import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Interview } from "@/models/Interview";
import { interviewUpdateSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/permissions";
import { recordActivity } from "@/lib/activity";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/interviews/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid interview ID" }, { status: 400 });
    }

    await connectToDatabase();
    const interview = await Interview.findById(id)
      .populate("candidateId", "name email jobRole stage")
      .populate("jobId", "title department")
      .populate("createdBy", "name email")
      .lean();

    if (!interview) {
      return NextResponse.json({ success: false, error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: interview });
  } catch (error: any) {
    console.error("GET /api/interviews/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch interview details" },
      { status: 500 }
    );
  }
}

// PUT /api/interviews/[id] - Update status, feedback, notes, reschedule
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { user } = authCheck;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid interview ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const validation = interviewUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 422 }
      );
    }

    await connectToDatabase();
    const existing = await Interview.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Interview not found" }, { status: 404 });
    }

    const prevStatus = existing.status;
    const { status, feedback, notes, rating, scheduledAt } = validation.data;

    if (status) existing.status = status;
    if (feedback !== undefined) existing.feedback = feedback;
    if (notes !== undefined) existing.notes = notes;
    if (rating !== undefined) existing.rating = rating;
    if (scheduledAt) existing.scheduledAt = new Date(scheduledAt);

    await existing.save();

    // Record activity in candidate timeline if status changed
    if (status && status !== prevStatus) {
      await recordActivity({
        candidateId: existing.candidateId,
        type: "INTERVIEW_STATUS",
        title: `Interview Status: ${status}`,
        description: `Interview status updated from "${prevStatus}" to "${status}"${
          feedback ? ` with feedback: "${feedback}"` : ""
        }.`,
        previousValue: prevStatus,
        newValue: status,
        actorId: user.id,
        actorName: user.name || "Recruiter",
      });
    }

    const populated = await Interview.findById(id)
      .populate("candidateId", "name email jobRole stage")
      .populate("jobId", "title department")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Interview updated successfully",
      data: populated,
    });
  } catch (error: any) {
    console.error("PUT /api/interviews/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update interview" },
      { status: 500 }
    );
  }
}

// DELETE /api/interviews/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid interview ID" }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Interview.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Interview removed successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/interviews/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete interview" },
      { status: 500 }
    );
  }
}
