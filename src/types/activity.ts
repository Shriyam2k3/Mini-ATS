import { ActivityType } from "@/models/CandidateActivity";

export interface ICandidateActivity {
  _id: string;
  candidateId: string;
  type: ActivityType;
  title: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  actorId?: string;
  actorName: string;
  createdAt: string | Date;
}
