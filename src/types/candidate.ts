import { HiringStage } from "@/constants/stages";

export interface ICandidate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  jobRole: string;
  stage: HiringStage;
  resumeUrl?: string;
  jobId?: {
    _id: string;
    title: string;
    department?: string;
    status?: string;
  } | string;
  skills?: string[];
  yearsOfExperience?: number;
  currentCompany?: string;
  currentDesignation?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  notes?: string;
  tags?: string[];
  source?: string;
  noticePeriod?: string;
  expectedSalary?: string;
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
  jobId?: string;
  skills?: string[] | string;
  yearsOfExperience?: number;
  currentCompany?: string;
  currentDesignation?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  notes?: string;
  tags?: string[] | string;
  source?: string;
  noticePeriod?: string;
  expectedSalary?: string;
}

export interface CandidateStats {
  total: number;
  openJobsCount: number;
  upcomingInterviewsCount: number;
  conversionRate: number;
  stages: Record<HiringStage, number>;
  stageDistribution: {
    stage: HiringStage;
    count: number;
    color: string;
    label: string;
    percentage: number;
  }[];
  funnelStages: {
    stage: HiringStage;
    label: string;
    count: number;
    color: string;
    conversionRate: number;
  }[];
  trendData: {
    date: string;
    applications: number;
  }[];
  recentCandidates: ICandidate[];
  recentlyUpdated: ICandidate[];
  upcomingInterviewsList: any[];
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
