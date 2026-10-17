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
});

export const stageUpdateSchema = z.object({
  stage: z.enum(HIRING_STAGES, {
    errorMap: () => ({ message: "Please select a valid hiring stage." }),
  }),
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
  sort: z.enum(["createdAt", "name", "jobRole", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
