import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { requireAuth } from "@/lib/permissions";
import { FilterQuery } from "mongoose";

export const dynamic = "force-dynamic";

// Function to prevent CSV Formula Injection (DDE attacks in Excel/Sheets)
function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // If starts with potential formula characters, prepend with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(req: NextRequest) {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const stage = searchParams.get("stage");
    const jobId = searchParams.get("jobId");
    const skill = searchParams.get("skill");

    const filter: FilterQuery<any> = {};

    if (stage && stage !== "ALL") {
      filter.stage = stage;
    }
    if (jobId && jobId !== "ALL") {
      filter.jobId = jobId;
    }
    if (skill && skill.trim()) {
      filter.skills = { $regex: new RegExp(skill.trim(), "i") };
    }
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { jobRole: regex },
        { currentCompany: regex },
      ];
    }

    const candidates = await Candidate.find(filter)
      .sort({ createdAt: -1 })
      .populate("jobId", "title department")
      .lean();

    const headers = [
      "Candidate ID",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Job Role",
      "Hiring Stage",
      "Assigned Job",
      "Current Company",
      "Current Designation",
      "Years Experience",
      "Skills",
      "Notice Period",
      "Source",
      "Resume URL",
      "Portfolio URL",
      "LinkedIn URL",
      "Created Date",
    ];

    const rows = candidates.map((c: any) => {
      const assignedJob =
        c.jobId && typeof c.jobId === "object" ? c.jobId.title : "";
      const skillsStr = Array.isArray(c.skills) ? c.skills.join(", ") : "";

      return [
        sanitizeCsvCell(c._id.toString()),
        sanitizeCsvCell(c.name),
        sanitizeCsvCell(c.email),
        sanitizeCsvCell(c.phone || ""),
        sanitizeCsvCell(c.jobRole),
        sanitizeCsvCell(c.stage),
        sanitizeCsvCell(assignedJob),
        sanitizeCsvCell(c.currentCompany || ""),
        sanitizeCsvCell(c.currentDesignation || ""),
        sanitizeCsvCell(c.yearsOfExperience ?? 0),
        sanitizeCsvCell(skillsStr),
        sanitizeCsvCell(c.noticePeriod || ""),
        sanitizeCsvCell(c.source || ""),
        sanitizeCsvCell(c.resumeUrl || ""),
        sanitizeCsvCell(c.portfolioUrl || ""),
        sanitizeCsvCell(c.linkedInUrl || ""),
        sanitizeCsvCell(new Date(c.createdAt).toISOString().split("T")[0]),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const filename = `candidates-export-${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("CSV Export error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export candidates to CSV" },
      { status: 500 }
    );
  }
}
