import mongoose, { Schema, Model, Document, Types } from "mongoose";

export type JobStatus = "Draft" | "Open" | "On Hold" | "Closed";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship";

export interface IJobDocument extends Document {
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  requiredSkills: string[];
  experienceRequirements: string;
  openings: number;
  status: JobStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJobDocument>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
      required: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    experienceRequirements: {
      type: String,
      default: "Not specified",
      trim: true,
    },
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["Draft", "Open", "On Hold", "Closed"],
      default: "Open",
      required: true,
      index: true,
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

JobSchema.index({ title: "text", department: "text", description: "text" });

export const Job: Model<IJobDocument> =
  mongoose.models.Job || mongoose.model<IJobDocument>("Job", JobSchema);
