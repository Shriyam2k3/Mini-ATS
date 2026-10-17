import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { requireAuth } from "@/lib/permissions";

const SAMPLE_CANDIDATES = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    jobRole: "Senior Full Stack Engineer",
    stage: "Interview",
    resumeUrl: "https://example.com/resumes/aarav-sharma.pdf",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 98123 45678",
    jobRole: "Frontend Developer (React/Next.js)",
    stage: "Offer",
    resumeUrl: "https://example.com/resumes/priya-patel.pdf",
  },
  {
    name: "Rohan Verma",
    email: "rohan.verma@example.com",
    phone: "+91 97234 56789",
    jobRole: "Backend Engineer (Node/MongoDB)",
    stage: "Screening",
    resumeUrl: "https://example.com/resumes/rohan-verma.pdf",
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+91 96345 67890",
    jobRole: "Product Designer (UI/UX)",
    stage: "Hired",
    resumeUrl: "https://example.com/resumes/ananya-iyer.pdf",
  },
  {
    name: "Vikram Malhotra",
    email: "vikram.malhotra@example.com",
    phone: "+91 95456 78901",
    jobRole: "DevOps Engineer",
    stage: "Applied",
    resumeUrl: "https://example.com/resumes/vikram-malhotra.pdf",
  },
  {
    name: "Neha Gupta",
    email: "neha.gupta@example.com",
    phone: "+91 94567 89012",
    jobRole: "QA Automation Engineer",
    stage: "Rejected",
    resumeUrl: "https://example.com/resumes/neha-gupta.pdf",
  },
  {
    name: "Kabir Mehta",
    email: "kabir.mehta@example.com",
    phone: "+91 93678 90123",
    jobRole: "AI / ML Intern",
    stage: "Applied",
    resumeUrl: "https://example.com/resumes/kabir-mehta.pdf",
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+91 92789 01234",
    jobRole: "Data Engineer",
    stage: "Screening",
    resumeUrl: "https://example.com/resumes/sneha-reddy.pdf",
  },
];

export async function POST() {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { user } = authCheck;

    await connectToDatabase();

    let createdCount = 0;
    for (const sample of SAMPLE_CANDIDATES) {
      const exists = await Candidate.findOne({ email: sample.email });
      if (!exists) {
        await Candidate.create({
          ...sample,
          createdBy: user.id,
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${createdCount} new sample candidates across stages.`,
      createdCount,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed sample candidates" },
      { status: 500 }
    );
  }
}
