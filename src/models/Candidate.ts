import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { HIRING_STAGES, HiringStage } from "@/constants/stages";

export interface ICandidateDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  jobRole: string;
  stage: HiringStage;
  resumeUrl?: string;
  jobId?: Types.ObjectId;
  skills: string[];
  yearsOfExperience: number;
  currentCompany?: string;
  currentDesignation?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  notes?: string;
  tags: string[];
  source?: string;
  noticePeriod?: string;
  expectedSalary?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema = new Schema<ICandidateDocument>(
  {
    name: {
      type: String,
      required: [true, "Candidate full name is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    jobRole: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
      index: true,
    },
    stage: {
      type: String,
      enum: {
        values: HIRING_STAGES,
        message: "{VALUE} is not a valid hiring stage",
      },
      default: "Applied",
      required: true,
      index: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      index: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentCompany: {
      type: String,
      trim: true,
    },
    currentDesignation: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    linkedInUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      trim: true,
      default: "Direct Application",
    },
    noticePeriod: {
      type: String,
      trim: true,
    },
    expectedSalary: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for robust full-text search across name, email, jobRole, currentCompany
CandidateSchema.index({ name: "text", email: "text", jobRole: "text", currentCompany: "text" });

export const Candidate: Model<ICandidateDocument> =
  mongoose.models.Candidate ||
  mongoose.model<ICandidateDocument>("Candidate", CandidateSchema);
