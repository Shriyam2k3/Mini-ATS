import mongoose, { Schema, Model, Document, Types } from "mongoose";

export type ActivityType =
  | "CREATED"
  | "STAGE_CHANGED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_STATUS"
  | "NOTE_ADDED"
  | "UPDATED"
  | "HIRED"
  | "REJECTED";

export interface ICandidateActivityDocument extends Document {
  candidateId: Types.ObjectId;
  type: ActivityType;
  title: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  actorId?: Types.ObjectId;
  actorName: string;
  createdAt: Date;
}

const CandidateActivitySchema = new Schema<ICandidateActivityDocument>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "CREATED",
        "STAGE_CHANGED",
        "INTERVIEW_SCHEDULED",
        "INTERVIEW_STATUS",
        "NOTE_ADDED",
        "UPDATED",
        "HIRED",
        "REJECTED",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    previousValue: {
      type: String,
    },
    newValue: {
      type: String,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    actorName: {
      type: String,
      default: "System",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const CandidateActivity: Model<ICandidateActivityDocument> =
  mongoose.models.CandidateActivity ||
  mongoose.model<ICandidateActivityDocument>(
    "CandidateActivity",
    CandidateActivitySchema
  );
