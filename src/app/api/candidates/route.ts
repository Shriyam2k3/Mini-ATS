import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { candidateSchema, candidateQuerySchema } from "@/lib/validators";
import { requireAuth } from "@/lib/permissions";
import { FilterQuery } from "mongoose";

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

    const { search, stage, sort, order, page, limit } = queryValidation.data;

    const filter: FilterQuery<any> = {};

    if (stage && stage !== "ALL") {
      filter.stage = stage;
    }

    if (search && search.trim() !== "") {
      const sanitized = search.trim();
      const regex = new RegExp(sanitized, "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { jobRole: regex },
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

    const newCandidate = await Candidate.create({
      ...candidateData,
      createdBy: user.id,
    });

    const populatedCandidate = await Candidate.findById(newCandidate._id)
      .populate("createdBy", "name email image")
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
      { success: false, error: "Failed to create candidate" },
      { status: 500 }
    );
  }
}
