import { JobStatus, EmploymentType } from "@/models/Job";

export interface IJob {
  _id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  requiredSkills: string[];
  experienceRequirements: string;
  openings: number;
  status: JobStatus;
  candidateCount?: number;
  createdBy: {
    _id: string;
    name?: string;
    email: string;
  } | string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface JobFormData {
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  requiredSkills: string[] | string;
  experienceRequirements: string;
  openings: number;
  status: JobStatus;
}
