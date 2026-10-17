import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Job } from "@/models/Job";
import { Candidate } from "@/models/Candidate";
import { jobSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/permissions";
import { FilterQuery } from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/jobs - List all jobs with candidate counts
export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const department = searchParams.get("department");

    const filter: FilterQuery<any> = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (department && department !== "ALL") {
      filter.department = department;
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: regex },
        { department: regex },
        { location: regex },
      ];
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    // Get candidate count for each job
    const jobIds = jobs.map((j) => j._id);
    const candidateCounts = await Candidate.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    candidateCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const jobsWithCounts = jobs.map((job) => ({
      ...job,
      candidateCount: countMap[job._id.toString()] || 0,
    }));

    return NextResponse.json({
      success: true,
      data: jobsWithCounts,
    });
  } catch (error: any) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job listing
export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { user } = authCheck;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Missing JSON body" },
        { status: 400 }
      );
    }

    const validation = jobSchema.safeParse(body);
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

    await connectToDatabase();

    const newJob = await Job.create({
      ...validation.data,
      createdBy: user.id,
    });

    const populated = await Job.findById(newJob._id)
      .populate("createdBy", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Job created successfully",
        data: populated,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create job" },
      { status: 500 }
    );
  }
}
