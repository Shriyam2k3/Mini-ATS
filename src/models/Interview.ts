import mongoose, { Schema, Model, Document, Types } from "mongoose";

export type InterviewType = "Phone" | "Video" | "In Person";
export type InterviewStatus = "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";

export interface IInterviewDocument extends Document {
  candidateId: Types.ObjectId;
  jobId?: Types.ObjectId;
  scheduledAt: Date;
  durationMinutes: number;
  interviewType: InterviewType;
  interviewerName: string;
  meetingLink?: string;
  status: InterviewStatus;
  notes?: string;
  feedback?: string;
  rating?: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterviewDocument>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: [true, "Candidate reference is required"],
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, "Interview date and time are required"],
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
      min: 15,
      max: 240,
    },
    interviewType: {
      type: String,
      enum: ["Phone", "Video", "In Person"],
      default: "Video",
      required: true,
    },
    interviewerName: {
      type: String,
      required: [true, "Interviewer name is required"],
      trim: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "Rescheduled"],
      default: "Scheduled",
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Interview: Model<IInterviewDocument> =
  mongoose.models.Interview ||
  mongoose.model<IInterviewDocument>("Interview", InterviewSchema);
