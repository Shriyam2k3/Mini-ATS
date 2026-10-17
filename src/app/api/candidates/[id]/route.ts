import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { candidateSchema, stageUpdateSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/permissions";
import mongoose from "mongoose";

interface RouteParams {
  params: {
    id: string;
  };
}

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

    // Check if this is only a stage update or a full candidate edit
    const isStageOnly = Object.keys(body).length === 1 && "stage" in body;

    if (isStageOnly) {
      const stageValidation = stageUpdateSchema.safeParse(body);
      if (!stageValidation.success) {
        return NextResponse.json(
          { success: false, error: stageValidation.error.errors[0]?.message || "Invalid stage" },
          { status: 422 }
        );
      }

      existing.stage = stageValidation.data.stage;
      await existing.save();

      const updated = await Candidate.findById(id)
        .populate("createdBy", "name email image")
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

    existing.name = updateData.name;
    existing.email = updateData.email;
    existing.phone = updateData.phone;
    existing.jobRole = updateData.jobRole;
    existing.stage = updateData.stage;
    existing.resumeUrl = updateData.resumeUrl;

    await existing.save();

    const populated = await Candidate.findById(id)
      .populate("createdBy", "name email image")
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
