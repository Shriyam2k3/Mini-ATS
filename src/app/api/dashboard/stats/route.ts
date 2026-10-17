import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { requireAuth } from "@/lib/permissions";
import { HIRING_STAGES, STAGE_CONFIG, HiringStage } from "@/constants/stages";

export const dynamic = "force-dynamic";

// GET /api/dashboard/stats
export async function GET() {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    await connectToDatabase();

    // 1. Fetch total count
    const total = await Candidate.countDocuments();

    // 2. Fetch stage counts using MongoDB aggregation
    const stageAggregation = await Candidate.aggregate([
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
        },
      },
    ]);

    // Build stage map ensuring all enum stages are present
    const stageCounts: Record<HiringStage, number> = {
      Applied: 0,
      Screening: 0,
      Interview: 0,
      Offer: 0,
      Hired: 0,
      Rejected: 0,
    };

    stageAggregation.forEach((item: { _id: string; count: number }) => {
      if (item._id in stageCounts) {
        stageCounts[item._id as HiringStage] = item.count;
      }
    });

    // Format for Recharts
    const stageDistribution = HIRING_STAGES.map((stage) => ({
      stage,
      label: STAGE_CONFIG[stage].label,
      count: stageCounts[stage],
      color: STAGE_CONFIG[stage].color,
    }));

    // 3. Fetch 5 most recent candidates
    const recentCandidates = await Candidate.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name email image")
      .lean();

    // 4. Fetch 5 recently updated candidates
    const recentlyUpdated = await Candidate.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("createdBy", "name email image")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        total,
        stages: stageCounts,
        stageDistribution,
        recentCandidates,
        recentlyUpdated,
      },
    });
  } catch (error: any) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
