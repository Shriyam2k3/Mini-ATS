const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const targetUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mini_ats";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    image: { type: String },
    role: { type: String, enum: ["ADMIN", "RECRUITER"], default: "RECRUITER" },
  },
  { timestamps: true }
);

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    employmentType: { type: String, default: "Full-time" },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    experienceRequirements: { type: String },
    openings: { type: Number, default: 1 },
    status: { type: String, default: "Open" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const CandidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    jobRole: { type: String, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    stage: {
      type: String,
      enum: ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"],
      default: "Applied",
    },
    resumeUrl: { type: String },
    portfolioUrl: { type: String },
    linkedInUrl: { type: String },
    currentCompany: { type: String },
    currentDesignation: { type: String },
    yearsOfExperience: { type: Number, default: 0 },
    skills: [{ type: String }],
    source: { type: String, default: "Direct" },
    notes: [
      {
        content: String,
        author: String,
        authorRole: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const InterviewSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 45 },
    interviewType: { type: String, default: "Video" },
    interviewerName: { type: String, required: true },
    meetingLink: { type: String },
    status: { type: String, default: "Scheduled" },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ActivitySchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
    actorId: { type: String },
    actorName: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);
const Candidate = mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);
const Interview = mongoose.models.Interview || mongoose.model("Interview", InterviewSchema);
const CandidateActivity = mongoose.models.CandidateActivity || mongoose.model("CandidateActivity", ActivitySchema);

async function seed() {
  console.log(`Connecting to MongoDB at: ${targetUri.replace(/:\/\/.*@/, "://***:***@")}...`);
  await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected successfully!");

  // 1. Seed Users
  const adminHashedPassword = await bcrypt.hash("AdminPassword123!", 12);
  const recruiterHashedPassword = await bcrypt.hash("Recruiter123!", 12);

  let adminUser = await User.findOne({ email: "admin@earlyjobs.ai" });
  if (!adminUser) {
    adminUser = await User.create({
      name: "ATS Administrator",
      email: "admin@earlyjobs.ai",
      password: adminHashedPassword,
      role: "ADMIN",
    });
    console.log("Created Admin: admin@earlyjobs.ai");
  } else {
    adminUser.role = "ADMIN";
    adminUser.password = adminHashedPassword;
    await adminUser.save();
    console.log("Updated Admin credentials & role: admin@earlyjobs.ai");
  }

  let recruiterUser = await User.findOne({ email: "recruiter@earlyjobs.ai" });
  if (!recruiterUser) {
    recruiterUser = await User.create({
      name: "Demo Recruiter",
      email: "recruiter@earlyjobs.ai",
      password: recruiterHashedPassword,
      role: "RECRUITER",
    });
    console.log("Created Recruiter: recruiter@earlyjobs.ai");
  } else {
    recruiterUser.password = recruiterHashedPassword;
    await recruiterUser.save();
    console.log("Updated Recruiter credentials: recruiter@earlyjobs.ai");
  }

  // 2. Seed Jobs
  const jobsData = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote",
      employmentType: "Full-time",
      description: "Lead core ATS platform development with Next.js, Node.js, and MongoDB.",
      requiredSkills: ["Next.js", "React", "Node.js", "TypeScript", "MongoDB", "Tailwind CSS"],
      experienceRequirements: "4-7 years",
      openings: 2,
      status: "Open",
      createdBy: adminUser._id,
    },
    {
      title: "Frontend Developer (Next.js/React)",
      department: "Engineering",
      location: "Bangalore, India",
      employmentType: "Full-time",
      description: "Build delightful recruitment user interfaces and workflow dashboards.",
      requiredSkills: ["React", "Next.js", "Tailwind CSS", "JavaScript", "HTML5"],
      experienceRequirements: "2-4 years",
      openings: 3,
      status: "Open",
      createdBy: adminUser._id,
    },
    {
      title: "Product Designer (UI/UX)",
      department: "Design",
      location: "Hybrid (New York)",
      employmentType: "Full-time",
      description: "Design intuitive recruiter SaaS interfaces, candidate pipelines, and dashboards.",
      requiredSkills: ["Figma", "UI/UX", "User Research", "Design Systems"],
      experienceRequirements: "3-5 years",
      openings: 1,
      status: "Open",
      createdBy: adminUser._id,
    },
  ];

  const jobMap = {};
  for (const j of jobsData) {
    let job = await Job.findOne({ title: j.title });
    if (!job) {
      job = await Job.create(j);
      console.log(`Created Job: ${job.title}`);
    }
    jobMap[job.title] = job;
  }

  // 3. Seed Candidates
  const candidatesData = [
    {
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "+91 98765 43210",
      jobRole: "Senior Full Stack Engineer",
      stage: "Interview",
      resumeUrl: "https://example.com/resumes/aarav-sharma.pdf",
      portfolioUrl: "https://aaravsharma.dev",
      linkedInUrl: "https://linkedin.com/in/aarav-sharma-dev",
      currentCompany: "Infosys Labs",
      currentDesignation: "Lead Engineer",
      yearsOfExperience: 5,
      skills: ["Next.js", "TypeScript", "Node.js", "MongoDB", "AWS"],
      source: "LinkedIn",
      createdBy: adminUser._id,
    },
    {
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91 98123 45678",
      jobRole: "Frontend Developer (Next.js/React)",
      stage: "Offer",
      resumeUrl: "https://example.com/resumes/priya-patel.pdf",
      portfolioUrl: "https://priyapatel.design",
      linkedInUrl: "https://linkedin.com/in/priya-patel-fe",
      currentCompany: "Swiggy",
      currentDesignation: "Software Engineer II",
      yearsOfExperience: 3.5,
      skills: ["React", "Next.js", "Tailwind CSS", "Redux"],
      source: "Referral",
      createdBy: adminUser._id,
    },
    {
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      phone: "+91 97234 56789",
      jobRole: "Senior Full Stack Engineer",
      stage: "Screening",
      resumeUrl: "https://example.com/resumes/rohan-verma.pdf",
      currentCompany: "Wipro Digital",
      currentDesignation: "Full Stack Developer",
      yearsOfExperience: 4,
      skills: ["Node.js", "Express", "MongoDB", "React", "Docker"],
      source: "Portal",
      createdBy: adminUser._id,
    },
    {
      name: "Ananya Iyer",
      email: "ananya.iyer@example.com",
      phone: "+91 96345 67890",
      jobRole: "Product Designer (UI/UX)",
      stage: "Hired",
      resumeUrl: "https://example.com/resumes/ananya-iyer.pdf",
      portfolioUrl: "https://ananyaiyer.com",
      linkedInUrl: "https://linkedin.com/in/ananya-iyer-design",
      currentCompany: "Zomato",
      currentDesignation: "Senior UI/UX Designer",
      yearsOfExperience: 4.5,
      skills: ["Figma", "Design Systems", "User Testing"],
      source: "Direct",
      createdBy: adminUser._id,
    },
    {
      name: "Vikram Malhotra",
      email: "vikram.malhotra@example.com",
      phone: "+91 95456 78901",
      jobRole: "Senior Full Stack Engineer",
      stage: "Applied",
      resumeUrl: "https://example.com/resumes/vikram-malhotra.pdf",
      currentCompany: "Cognizant",
      currentDesignation: "Associate Consultant",
      yearsOfExperience: 2,
      skills: ["JavaScript", "React", "SQL", "Git"],
      source: "LinkedIn",
      createdBy: adminUser._id,
    },
  ];

  for (const c of candidatesData) {
    let candidate = await Candidate.findOne({ email: c.email });
    if (!candidate) {
      const matchingJob = jobMap[c.jobRole];
      candidate = await Candidate.create({
        ...c,
        jobId: matchingJob ? matchingJob._id : undefined,
      });
      console.log(`Created Candidate: ${candidate.name} (${candidate.stage})`);

      await CandidateActivity.create({
        candidateId: candidate._id,
        type: "CREATED",
        title: "Candidate Profile Created",
        description: `Initial candidate profile registered in "${candidate.stage}" stage.`,
        newValue: candidate.stage,
        actorId: adminUser._id.toString(),
        actorName: "ATS Administrator",
      });
    }
  }

  // 4. Seed Interview for Aarav Sharma
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
        createdBy: adminUser._id,
      });
      console.log("Created Interview for Aarav Sharma");
    }
  }

  console.log("\n Database successfully seeded with admin, recruiter, jobs, and candidates!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
