"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateSchema } from "@/lib/validators";
import { HIRING_STAGES } from "@/constants/stages";
import { CandidateFormData, ICandidate } from "@/types/candidate";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  CheckCircle2,
  Building,
  Calendar,
  Globe,
  Tag,
  DollarSign,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CandidateFormProps {
  initialData?: ICandidate;
  onSuccess?: (candidate: ICandidate) => void;
  onCancel?: () => void;
}

export function CandidateForm({
  initialData,
  onSuccess,
  onCancel,
}: CandidateFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [availableJobs, setAvailableJobs] = useState<{ _id: string; title: string; status: string }[]>([]);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setAvailableJobs(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      jobRole: initialData?.jobRole || "",
      stage: initialData?.stage || "Applied",
      resumeUrl: initialData?.resumeUrl || "",
      jobId:
        typeof initialData?.jobId === "object"
          ? initialData?.jobId?._id
          : initialData?.jobId || "",
      skills: Array.isArray(initialData?.skills) ? initialData.skills.join(", ") : "",
      yearsOfExperience: initialData?.yearsOfExperience ?? 0,
      currentCompany: initialData?.currentCompany || "",
      currentDesignation: initialData?.currentDesignation || "",
      portfolioUrl: initialData?.portfolioUrl || "",
      linkedInUrl: initialData?.linkedInUrl || "",
      notes: initialData?.notes || "",
      source: initialData?.source || "Direct Application",
      noticePeriod: initialData?.noticePeriod || "",
      expectedSalary: initialData?.expectedSalary || "",
    },
  });

  const onSubmit = async (values: CandidateFormData) => {
    setServerError(null);
    try {
      const url = isEditing
        ? `/api/candidates/${initialData?._id}`
        : "/api/candidates";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save candidate");
      }

      toast.success(
        isEditing
          ? "Candidate profile updated successfully"
          : "Candidate added to pipeline successfully"
      );

      if (onSuccess) {
        onSuccess(data.data);
      } else {
        router.push("/candidates");
        router.refresh();
      }
    } catch (err: any) {
      setServerError(err.message || "An error occurred");
      toast.error(err.message || "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {serverError}
        </div>
      )}

      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. Aarav Sharma"
              {...register("name")}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              placeholder="e.g. candidate@example.com"
              {...register("email")}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </span>
            <input
              type="tel"
              placeholder="e.g. +91 98765 43210"
              {...register("phone")}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Job Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Job Role / Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. Senior Full Stack Engineer"
              {...register("jobRole")}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
            />
          </div>
          {errors.jobRole && (
            <p className="mt-1 text-xs text-rose-600">{errors.jobRole.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Associate with Job Opening */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Assign to Job Opening (Optional)
          </label>
          <select
            {...register("jobId")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
          >
            <option value="">No specific job assigned</option>
            {availableJobs.map((job) => (
              <option
                key={job._id}
                value={job._id}
                disabled={job.status === "Closed"}
              >
                {job.title} {job.status === "Closed" ? "(Closed)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Hiring Stage */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Hiring Stage <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("stage")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
          >
            {HIRING_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Experience & Current Company */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Years of Experience
          </label>
          <input
            type="number"
            min={0}
            max={50}
            step="0.5"
            placeholder="e.g. 4"
            {...register("yearsOfExperience")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Current Company
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="e.g. Microsoft"
              {...register("currentCompany")}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Current Designation
          </label>
          <input
            type="text"
            placeholder="e.g. SDE II"
            {...register("currentDesignation")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Key Skills <span className="text-slate-400 font-normal">(Comma separated)</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Tag className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="e.g. React, Next.js, Node.js, MongoDB, TypeScript, Tailwind"
            {...register("skills")}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Resume URL
          </label>
          <input
            type="url"
            placeholder="https://..."
            {...register("resumeUrl")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
          {errors.resumeUrl && (
            <p className="mt-1 text-xs text-rose-600">{errors.resumeUrl.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Portfolio URL
          </label>
          <input
            type="url"
            placeholder="https://..."
            {...register("portfolioUrl")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            LinkedIn URL
          </label>
          <input
            type="url"
            placeholder="https://linkedin.com/in/..."
            {...register("linkedInUrl")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
        </div>
      </div>

      {/* Logistics: Notice Period & Expected Salary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Notice Period
          </label>
          <select
            {...register("noticePeriod")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
          >
            <option value="">Select Notice Period...</option>
            <option value="Immediate">Immediate</option>
            <option value="15 Days">15 Days</option>
            <option value="30 Days">30 Days</option>
            <option value="60 Days">60 Days</option>
            <option value="90 Days">90 Days</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Expected Salary
          </label>
          <input
            type="text"
            placeholder="e.g. $120,000 / ₹18 LPA"
            {...register("expectedSalary")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Application Source
          </label>
          <select
            {...register("source")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
          >
            <option value="Direct Application">Direct Application</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Referral">Employee Referral</option>
            <option value="EarlyJobs.ai Portal">EarlyJobs.ai Portal</option>
            <option value="Agency">Recruitment Agency</option>
          </select>
        </div>
      </div>

      {/* Initial Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Initial Recruiter Notes
        </label>
        <textarea
          placeholder="Screening remarks, evaluation summary, or recruiter observations..."
          rows={2}
          {...register("notes")}
          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
        />
      </div>

      {/* Form Action Buttons */}
      <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update Profile"
              : "Create Candidate Profile"}
          </span>
        </button>
      </div>
    </form>
  );
}
