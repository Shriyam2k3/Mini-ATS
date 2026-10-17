import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import { Job } from "@/models/Job";
import { Interview } from "@/models/Interview";
import { requireAuth } from "@/lib/permissions";
import { recordActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

const SAMPLE_JOBS = [
  {
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Remote",
    employmentType: "Full-time" as const,
    description: "Looking for an experienced engineer with Next.js, Node.js, and MongoDB expertise to lead core ATS platform development.",
    requiredSkills: ["Next.js", "React", "Node.js", "TypeScript", "MongoDB", "Tailwind CSS"],
    experienceRequirements: "4-7 years",
    openings: 2,
    status: "Open" as const,
  },
  {
    title: "Frontend Developer (Next.js/React)",
    department: "Engineering",
    location: "Bangalore, India",
    employmentType: "Full-time" as const,
    description: "Build delightful recruitment user interfaces, interactive charts, and drag-and-drop workflow dashboards.",
    requiredSkills: ["React", "Next.js", "Tailwind CSS", "JavaScript", "HTML5"],
    experienceRequirements: "2-4 years",
    openings: 3,
    status: "Open" as const,
  },
  {
    title: "Product Designer (UI/UX)",
    department: "Design",
    location: "Hybrid (New York)",
    employmentType: "Full-time" as const,
    description: "Design intuitive recruiter SaaS interfaces, candidate pipelines, and dashboard telemetry.",
    requiredSkills: ["Figma", "UI/UX", "User Research", "Design Systems", "Prototyping"],
    experienceRequirements: "3-5 years",
    openings: 1,
    status: "Open" as const,
  },
];

const SAMPLE_CANDIDATES = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    jobRole: "Senior Full Stack Engineer",
    stage: "Interview" as const,
    resumeUrl: "https://example.com/resumes/aarav-sharma.pdf",
    portfolioUrl: "https://aaravsharma.dev",
    linkedInUrl: "https://linkedin.com/in/aarav-sharma-dev",
    currentCompany: "Infosys Labs",
    currentDesignation: "Lead Engineer",
    yearsOfExperience: 5,
    skills: ["Next.js", "TypeScript", "Node.js", "MongoDB", "AWS"],
    source: "LinkedIn",
    noticePeriod: "30 Days",
    expectedSalary: "$110,000 / ₹22 LPA",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 98123 45678",
    jobRole: "Frontend Developer (Next.js/React)",
    stage: "Offer" as const,
    resumeUrl: "https://example.com/resumes/priya-patel.pdf",
    portfolioUrl: "https://priyapatel.design",
    linkedInUrl: "https://linkedin.com/in/priya-patel-fe",
    currentCompany: "Swiggy",
    currentDesignation: "Software Engineer II",
    yearsOfExperience: 3.5,
    skills: ["React", "Next.js", "Tailwind CSS", "Redux", "Jest"],
    source: "Referral",
    noticePeriod: "15 Days",
    expectedSalary: "$95,000 / ₹18 LPA",
  },
  {
    name: "Rohan Verma",
    email: "rohan.verma@example.com",
    phone: "+91 97234 56789",
    jobRole: "Senior Full Stack Engineer",
    stage: "Screening" as const,
    resumeUrl: "https://example.com/resumes/rohan-verma.pdf",
    currentCompany: "Wipro Digital",
    currentDesignation: "Full Stack Developer",
    yearsOfExperience: 4,
    skills: ["Node.js", "Express", "MongoDB", "React", "Docker"],
    source: "EarlyJobs.ai Portal",
    noticePeriod: "Immediate",
    expectedSalary: "$100,000 / ₹20 LPA",
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+91 96345 67890",
    jobRole: "Product Designer (UI/UX)",
    stage: "Hired" as const,
    resumeUrl: "https://example.com/resumes/ananya-iyer.pdf",
    portfolioUrl: "https://ananyaiyer.com",
    linkedInUrl: "https://linkedin.com/in/ananya-iyer-design",
    currentCompany: "Zomato",
    currentDesignation: "Senior UI/UX Designer",
    yearsOfExperience: 4.5,
    skills: ["Figma", "Design Systems", "User Testing", "Prototyping"],
    source: "Direct Application",
    noticePeriod: "Immediate",
    expectedSalary: "$105,000 / ₹21 LPA",
  },
  {
    name: "Vikram Malhotra",
    email: "vikram.malhotra@example.com",
    phone: "+91 95456 78901",
    jobRole: "Senior Full Stack Engineer",
    stage: "Applied" as const,
    resumeUrl: "https://example.com/resumes/vikram-malhotra.pdf",
    currentCompany: "Cognizant",
    currentDesignation: "Associate Consultant",
    yearsOfExperience: 2,
    skills: ["JavaScript", "React", "SQL", "Git"],
    source: "LinkedIn",
    noticePeriod: "60 Days",
    expectedSalary: "$80,000 / ₹14 LPA",
  },
  {
    name: "Neha Gupta",
    email: "neha.gupta@example.com",
    phone: "+91 94567 89012",
    jobRole: "Frontend Developer (Next.js/React)",
    stage: "Rejected" as const,
    resumeUrl: "https://example.com/resumes/neha-gupta.pdf",
    currentCompany: "TCS",
    currentDesignation: "Developer",
    yearsOfExperience: 1.5,
    skills: ["HTML", "CSS", "jQuery"],
    source: "Agency",
    noticePeriod: "30 Days",
    expectedSalary: "$65,000 / ₹10 LPA",
  },
];

export async function POST() {
  try {
    const authCheck = await requireAuth();
    if (authCheck.errorResponse) return authCheck.errorResponse;
    const { user } = authCheck;

    await connectToDatabase();

    // 1. Seed Jobs
    const jobMap: Record<string, any> = {};
    for (const jobData of SAMPLE_JOBS) {
      let job = await Job.findOne({ title: jobData.title });
      if (!job) {
        job = await Job.create({
          ...jobData,
          createdBy: user.id,
        });
      }
      jobMap[job.title] = job;
    }

    // 2. Seed Candidates
    let createdCount = 0;
    const createdCandidateIds: any[] = [];
    for (const sample of SAMPLE_CANDIDATES) {
      const exists = await Candidate.findOne({ email: sample.email });
      if (!exists) {
        const matchingJob = jobMap[sample.jobRole];
        const newCandidate = await Candidate.create({
          ...sample,
          jobId: matchingJob ? matchingJob._id : undefined,
          createdBy: user.id,
        });
        createdCandidateIds.push(newCandidate);
        createdCount++;

        // Add initial activity
        await recordActivity({
          candidateId: newCandidate._id,
          type: "CREATED",
          title: "Candidate Profile Created",
          description: `Initial registration in "${newCandidate.stage}" stage for ${newCandidate.jobRole}.`,
          newValue: newCandidate.stage,
          actorId: user.id,
          actorName: user.name || "Recruiter",
        });
      }
    }

    // 3. Seed an Interview for Aarav Sharma if created
    const aarav = await Candidate.findOne({ email: "aarav.sharma@example.com" });
    if (aarav) {
      const existingIv = await Interview.findOne({ candidateId: aarav._id });
      if (!existingIv) {
        const interviewDate = new Date();
        interviewDate.setDate(interviewDate.getDate() + 2);
        interviewDate.setHours(15, 0, 0, 0);

        await Interview.create({
          candidateId: aarav._id,
          jobId: aarav.jobId,
          scheduledAt: interviewDate,
          durationMinutes: 60,
          interviewType: "Video",
          interviewerName: "Sarah Jenkins (Staff Architect)",
          meetingLink: "https://meet.google.com/ej-ats-demo",
          status: "Scheduled",
          notes: "System architecture and Next.js full-stack evaluation round.",
          createdBy: user.id,
        });

        await recordActivity({
          candidateId: aarav._id,
          type: "INTERVIEW_SCHEDULED",
          title: "Technical Architecture Interview Scheduled",
          description: "Video interview scheduled with Sarah Jenkins.",
          newValue: "Video",
          actorId: user.id,
          actorName: user.name || "Recruiter",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${SAMPLE_JOBS.length} jobs, ${createdCount} candidates, and sample interview schedule.`,
      createdCount,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed sample ATS records" },
      { status: 500 }
    );
  }
}
