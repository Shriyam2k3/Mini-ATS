import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { Candidate } from "@/models/Candidate";
import { jobSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/permissions";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/jobs/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 });
    }

    await connectToDatabase();
    const job = await Job.findById(id).populate("createdBy", "name email").lean();

    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    const candidateCount = await Candidate.countDocuments({ jobId: id });

    return NextResponse.json({
      success: true,
      data: {
        ...job,
        candidateCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job details" },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const validation = jobSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || "Validation failed",
        },
        { status: 422 }
      );
    }

    await connectToDatabase();
    const updated = await Job.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/jobs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid job ID" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if there are associated candidates
    const activeCandidates = await Candidate.countDocuments({ jobId: id });
    if (activeCandidates > 0) {
      // Disassociate candidates or prevent delete
      await Candidate.updateMany({ jobId: id }, { $unset: { jobId: 1 } });
    }

    const deleted = await Job.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Job "${deleted.title}" deleted successfully. Any linked candidates have been disassociated safely.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
