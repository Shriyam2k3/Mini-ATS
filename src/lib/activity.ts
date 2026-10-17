import { CandidateActivity, ActivityType } from "@/models/CandidateActivity";
import mongoose from "mongoose";

interface RecordActivityParams {
  candidateId: string | mongoose.Types.ObjectId;
  type: ActivityType;
  title: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  actorId?: string | mongoose.Types.ObjectId;
  actorName?: string;
}

export async function recordActivity({
  candidateId,
  type,
  title,
  description,
  previousValue,
  newValue,
  actorId,
  actorName = "System",
}: RecordActivityParams) {
  try {
    await CandidateActivity.create({
      candidateId,
      type,
      title,
      description,
      previousValue,
      newValue,
      actorId: actorId ? new mongoose.Types.ObjectId(actorId.toString()) : undefined,
      actorName,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to record activity log:", error);
    // Non-fatal, do not throw to caller
  }
}
