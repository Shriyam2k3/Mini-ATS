import { HiringStage } from "@/constants/stages";

export interface ICandidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  jobRole: string;
  stage: HiringStage;
  resumeUrl?: string;
  createdBy: {
    _id: string;
    name?: string;
    email: string;
    image?: string;
  } | string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CandidateFormData {
  name: string;
  email: string;
  phone?: string;
  jobRole: string;
  stage: HiringStage;
  resumeUrl?: string;
}

export interface CandidateStats {
  total: number;
  stages: Record<HiringStage, number>;
  stageDistribution: {
    stage: HiringStage;
    count: number;
    color: string;
    label: string;
  }[];
  recentCandidates: ICandidate[];
  recentlyUpdated: ICandidate[];
}

export interface CandidatesResponse {
  success: boolean;
  data: ICandidate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
