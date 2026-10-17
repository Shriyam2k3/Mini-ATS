import { InterviewType, InterviewStatus } from "@/models/Interview";

export interface IInterview {
  _id: string;
  candidateId: {
    _id: string;
    name: string;
    email: string;
    jobRole: string;
    stage?: string;
  } | string;
  jobId?: {
    _id: string;
    title: string;
  } | string;
  scheduledAt: string | Date;
  durationMinutes: number;
  interviewType: InterviewType;
  interviewerName: string;
  meetingLink?: string;
  status: InterviewStatus;
  notes?: string;
  feedback?: string;
  rating?: number;
  createdBy: {
    _id: string;
    name?: string;
    email: string;
  } | string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface InterviewFormData {
  candidateId: string;
  jobId?: string;
  scheduledAt: string;
  durationMinutes?: number;
  interviewType: InterviewType;
  interviewerName: string;
  meetingLink?: string;
  notes?: string;
}
