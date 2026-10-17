import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CandidateActivity } from "@/models/CandidateActivity";
import { requireAuth } from "@/lib/permissions";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid candidate ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const activities = await CandidateActivity.find({ candidateId: id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    console.error("GET candidate activity error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load candidate activity timeline" },
      { status: 500 }
    );
  }
}
