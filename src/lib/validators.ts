import { z } from "zod";
import { HIRING_STAGES } from "@/constants/stages";

export const candidateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Candidate name must be at least 2 characters." })
    .max(100, { message: "Candidate name cannot exceed 100 characters." }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .trim()
    .max(25, { message: "Phone number is too long." })
    .optional()
    .or(z.literal("")),
  jobRole: z
    .string()
    .trim()
    .min(2, { message: "Job role must be at least 2 characters." })
    .max(100, { message: "Job role cannot exceed 100 characters." }),
  stage: z.enum(HIRING_STAGES, {
    errorMap: () => ({ message: "Please select a valid hiring stage." }),
  }),
  resumeUrl: z
    .string()
    .trim()
    .url({ message: "Please enter a valid URL (e.g. https://example.com/resume.pdf)" })
    .optional()
    .or(z.literal("")),
  jobId: z.string().optional().or(z.literal("")),
  skills: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    }),
  yearsOfExperience: z.coerce.number().min(0).max(50).optional().default(0),
  currentCompany: z.string().trim().max(100).optional().or(z.literal("")),
  currentDesignation: z.string().trim().max(100).optional().or(z.literal("")),
  portfolioUrl: z
    .string()
    .trim()
    .url({ message: "Please enter a valid portfolio URL" })
    .optional()
    .or(z.literal("")),
  linkedInUrl: z
    .string()
    .trim()
    .url({ message: "Please enter a valid LinkedIn URL" })
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  tags: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    }),
  source: z.string().trim().max(100).optional().or(z.literal("Direct Application")),
  noticePeriod: z.string().trim().max(50).optional().or(z.literal("")),
  expectedSalary: z.string().trim().max(50).optional().or(z.literal("")),
});

export const stageUpdateSchema = z.object({
  stage: z.enum(HIRING_STAGES, {
    errorMap: () => ({ message: "Please select a valid hiring stage." }),
  }),
});

export const noteSchema = z.object({
  note: z.string().trim().min(2, "Note cannot be empty").max(2000, "Note is too long"),
});

export const jobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Job title must be at least 2 characters")
    .max(120, "Job title too long"),
  department: z
    .string()
    .trim()
    .min(2, "Department is required")
    .max(80),
  location: z
    .string()
    .trim()
    .min(2, "Location is required")
    .max(100),
  employmentType: z.enum(["Full-time", "Part-time", "Contract", "Internship"], {
    errorMap: () => ({ message: "Select a valid employment type" }),
  }),
  description: z
    .string()
    .trim()
    .min(10, "Job description must be at least 10 characters"),
  requiredSkills: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    }),
  experienceRequirements: z.string().trim().max(50).optional().default("Not specified"),
  openings: z.coerce.number().int().min(1, "Openings must be at least 1").default(1),
  status: z.enum(["Draft", "Open", "On Hold", "Closed"]).default("Open"),
});

export const interviewSchema = z.object({
  candidateId: z.string().min(1, "Candidate is required"),
  jobId: z.string().optional().or(z.literal("")),
  scheduledAt: z.string().min(1, "Interview date and time are required"),
  durationMinutes: z.coerce.number().int().min(15).max(240).default(45),
  interviewType: z.enum(["Phone", "Video", "In Person"]).default("Video"),
  interviewerName: z
    .string()
    .trim()
    .min(2, "Interviewer name is required")
    .max(100),
  meetingLink: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const interviewUpdateSchema = z.object({
  status: z.enum(["Scheduled", "Completed", "Cancelled", "Rescheduled"]).optional(),
  feedback: z.string().trim().max(3000).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  rating: z.coerce.number().min(1).max(5).optional(),
  scheduledAt: z.string().optional(),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export const candidateQuerySchema = z.object({
  search: z.string().optional(),
  stage: z.string().optional(),
  jobId: z.string().optional(),
  skill: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sort: z.enum(["createdAt", "name", "jobRole", "updatedAt", "yearsOfExperience"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
