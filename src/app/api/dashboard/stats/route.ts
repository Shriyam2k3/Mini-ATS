import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { Job } from "@/models/Job";
import { Interview } from "@/models/Interview";
import { requireAuth } from "@/lib/permissions";
import { HIRING_STAGES, STAGE_CONFIG, HiringStage } from "@/constants/stages";
import { FilterQuery } from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/dashboard/stats - Advanced aggregation with date filtering, open jobs, upcoming interviews, trends, and funnel
export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get("dateRange") || "all"; // "7d" | "30d" | "90d" | "all"

    const candidateFilter: FilterQuery<any> = {};

    if (dateRange !== "all") {
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      cutoff.setHours(0, 0, 0, 0);
      candidateFilter.createdAt = { $gte: cutoff };
    }

    // 1. Candidate Counts
    const total = await Candidate.countDocuments(candidateFilter);

    // 2. Stage counts via MongoDB Aggregation
    const stageAggregation = await Candidate.aggregate([
      { $match: candidateFilter },
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
        },
      },
    ]);

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

    // 3. Stage Distribution with real percentages
    const stageDistribution = HIRING_STAGES.map((stage) => {
      const count = stageCounts[stage];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        stage,
        label: STAGE_CONFIG[stage].label,
        count,
        color: STAGE_CONFIG[stage].color,
        percentage,
      };
    });

    // 4. Hiring Funnel: Progressive conversion calculation
    // Progression pipeline: Applied -> Screening -> Interview -> Offer -> Hired
    const funnelPipeline = [
      {
        stage: "Applied" as HiringStage,
        label: "Applied",
        color: STAGE_CONFIG["Applied"].color,
        count: total,
        conversionRate: 100,
      },
      {
        stage: "Screening" as HiringStage,
        label: "Screening & Beyond",
        color: STAGE_CONFIG["Screening"].color,
        count:
          stageCounts["Screening"] +
          stageCounts["Interview"] +
          stageCounts["Offer"] +
          stageCounts["Hired"],
        conversionRate:
          total > 0
            ? Math.round(
                ((stageCounts["Screening"] +
                  stageCounts["Interview"] +
                  stageCounts["Offer"] +
                  stageCounts["Hired"]) /
                  total) *
                  100
              )
            : 0,
      },
      {
        stage: "Interview" as HiringStage,
        label: "Interview & Beyond",
        color: STAGE_CONFIG["Interview"].color,
        count:
          stageCounts["Interview"] +
          stageCounts["Offer"] +
          stageCounts["Hired"],
        conversionRate:
          total > 0
            ? Math.round(
                ((stageCounts["Interview"] +
                  stageCounts["Offer"] +
                  stageCounts["Hired"]) /
                  total) *
                  100
              )
            : 0,
      },
      {
        stage: "Offer" as HiringStage,
        label: "Offers & Hired",
        color: STAGE_CONFIG["Offer"].color,
        count: stageCounts["Offer"] + stageCounts["Hired"],
        conversionRate:
          total > 0
            ? Math.round(
                ((stageCounts["Offer"] + stageCounts["Hired"]) / total) * 100
              )
            : 0,
      },
      {
        stage: "Hired" as HiringStage,
        label: "Hired",
        color: STAGE_CONFIG["Hired"].color,
        count: stageCounts["Hired"],
        conversionRate:
          total > 0 ? Math.round((stageCounts["Hired"] / total) * 100) : 0,
      },
    ];

    // 5. Total Open Jobs
    const openJobsCount = await Job.countDocuments({ status: "Open" });

    // 6. Upcoming Interviews
    const now = new Date();
    const upcomingInterviewsCount = await Interview.countDocuments({
      scheduledAt: { $gte: now },
      status: "Scheduled",
    });

    const upcomingInterviewsList = await Interview.find({
      scheduledAt: { $gte: now },
      status: "Scheduled",
    })
      .sort({ scheduledAt: 1 })
      .limit(4)
      .populate("candidateId", "name email jobRole stage")
      .populate("jobId", "title")
      .lean();

    // 7. Overall Conversion Rate (Hired / Total)
    const conversionRate = total > 0 ? Math.round((stageCounts.Hired / total) * 100) : 0;

    // 8. Application Trends (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const trendAggregation = await Candidate.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build complete 14-day map so days with 0 applicants aren't missing
    const trendMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      trendMap[key] = 0;
    }
    trendAggregation.forEach((item: { _id: string; count: number }) => {
      if (item._id in trendMap) {
        trendMap[item._id] = item.count;
      }
    });

    const trendData = Object.entries(trendMap).map(([date, applications]) => {
      const d = new Date(date);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        date: label,
        applications,
      };
    });

    // 9. Recent & Recently Updated candidates
    const recentCandidates = await Candidate.find(candidateFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name email image")
      .populate("jobId", "title")
      .lean();

    const recentlyUpdated = await Candidate.find(candidateFilter)
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("createdBy", "name email image")
      .populate("jobId", "title")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        total,
        openJobsCount,
        upcomingInterviewsCount,
        conversionRate,
        stages: stageCounts,
        stageDistribution,
        funnelStages: funnelPipeline,
        trendData,
        recentCandidates,
        recentlyUpdated,
        upcomingInterviewsList,
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
