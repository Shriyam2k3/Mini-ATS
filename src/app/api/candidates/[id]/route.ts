import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { Job } from "@/models/Job";
import { candidateSchema, stageUpdateSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/permissions";
import { recordActivity } from "@/lib/activity";
import mongoose from "mongoose";

interface RouteParams {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

// GET /api/candidates/[id] - Fetch single candidate
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid candidate ID format" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const candidate = await Candidate.findById(id)
      .populate("createdBy", "name email image")
      .populate("jobId", "title department location status employmentType")
      .lean();

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: candidate,
    });
  } catch (error: any) {
    console.error(`GET /api/candidates/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch candidate details" },
      { status: 500 }
    );
  }
}

// PUT /api/candidates/[id] - Update candidate (full edit or stage update)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { user } = authCheck;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid candidate ID format" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid JSON body" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await Candidate.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Check if this is only a stage update
    const isStageOnly = Object.keys(body).length === 1 && "stage" in body;

    if (isStageOnly) {
      const stageValidation = stageUpdateSchema.safeParse(body);
      if (!stageValidation.success) {
        return NextResponse.json(
          { success: false, error: stageValidation.error.errors[0]?.message || "Invalid stage" },
          { status: 422 }
        );
      }

      const prevStage = existing.stage;
      const nextStage = stageValidation.data.stage;

      if (prevStage !== nextStage) {
        existing.stage = nextStage;
        await existing.save();

        let activityType: any = "STAGE_CHANGED";
        let title = `Stage updated to ${nextStage}`;
        if (nextStage === "Hired") {
          activityType = "HIRED";
          title = "Candidate Hired! 🎉";
        } else if (nextStage === "Rejected") {
          activityType = "REJECTED";
          title = "Candidate Rejected";
        }

        await recordActivity({
          candidateId: existing._id,
          type: activityType,
          title,
          description: `Stage moved from "${prevStage}" to "${nextStage}".`,
          previousValue: prevStage,
          newValue: nextStage,
          actorId: user.id,
          actorName: user.name || "Recruiter",
        });
      }

      const updated = await Candidate.findById(id)
        .populate("createdBy", "name email image")
        .populate("jobId", "title department status")
        .lean();

      return NextResponse.json({
        success: true,
        message: `Candidate stage updated to ${existing.stage}`,
        data: updated,
      });
    }

    // Full candidate update validation
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

    const updateData = validation.data;

    // Check if email changed and if another candidate already has it
    if (updateData.email !== existing.email) {
      const emailConflict = await Candidate.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (emailConflict) {
        return NextResponse.json(
          {
            success: false,
            error: `Email ${updateData.email} is already in use by another candidate.`,
          },
          { status: 409 }
        );
      }
    }

    // Check closed job assignment
    if (updateData.jobId && updateData.jobId !== existing.jobId?.toString()) {
      const job = await Job.findById(updateData.jobId);
      if (job && job.status === "Closed") {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot reassign candidate to job "${job.title}" because this job is closed.`,
          },
          { status: 400 }
        );
      }
    }

    const prevStage = existing.stage;
    const stageChanged = updateData.stage !== prevStage;

    existing.name = updateData.name;
    existing.email = updateData.email;
    existing.phone = updateData.phone;
    existing.jobRole = updateData.jobRole;
    existing.stage = updateData.stage;
    existing.resumeUrl = updateData.resumeUrl;
    existing.jobId = updateData.jobId ? (new mongoose.Types.ObjectId(updateData.jobId) as any) : undefined;
    existing.skills = (updateData.skills as string[]) || [];
    existing.yearsOfExperience = updateData.yearsOfExperience ?? 0;
    existing.currentCompany = updateData.currentCompany;
    existing.currentDesignation = updateData.currentDesignation;
    existing.portfolioUrl = updateData.portfolioUrl;
    existing.linkedInUrl = updateData.linkedInUrl;
    existing.notes = updateData.notes;
    existing.tags = (updateData.tags as string[]) || [];
    existing.source = updateData.source;
    existing.noticePeriod = updateData.noticePeriod;
    existing.expectedSalary = updateData.expectedSalary;

    await existing.save();

    if (stageChanged) {
      await recordActivity({
        candidateId: existing._id,
        type: updateData.stage === "Hired" ? "HIRED" : updateData.stage === "Rejected" ? "REJECTED" : "STAGE_CHANGED",
        title: `Stage updated to ${updateData.stage}`,
        description: `Stage moved from "${prevStage}" to "${updateData.stage}".`,
        previousValue: prevStage,
        newValue: updateData.stage,
        actorId: user.id,
        actorName: user.name || "Recruiter",
      });
    } else {
      await recordActivity({
        candidateId: existing._id,
        type: "UPDATED",
        title: "Candidate Profile Updated",
        description: "Candidate details and information were updated.",
        actorId: user.id,
        actorName: user.name || "Recruiter",
      });
    }

    const populated = await Candidate.findById(id)
      .populate("createdBy", "name email image")
      .populate("jobId", "title department status")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Candidate updated successfully",
      data: populated,
    });
  } catch (error: any) {
    console.error(`PUT /api/candidates/${params.id} error:`, error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "A candidate with this email address already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update candidate" },
      { status: 500 }
    );
  }
}

// DELETE /api/candidates/[id] - Remove candidate record
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid candidate ID format" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deletedCandidate = await Candidate.findByIdAndDelete(id);

    if (!deletedCandidate) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Candidate ${deletedCandidate.name} has been successfully deleted.`,
    });
  } catch (error: any) {
    console.error(`DELETE /api/candidates/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete candidate" },
      { status: 500 }
    );
  }
}
