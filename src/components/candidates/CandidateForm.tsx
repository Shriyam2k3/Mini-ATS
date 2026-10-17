"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateSchema } from "@/lib/validators";
import { HIRING_STAGES, HiringStage } from "@/constants/stages";
import { CandidateFormData, ICandidate } from "@/types/candidate";
import { Loader2, User, Mail, Phone, Briefcase, FileText, CheckCircle2 } from "lucide-react";
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
  const isEditing = Boolean(initialData);

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
          ? "Candidate updated successfully"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {serverError}
        </div>
      )}

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
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
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
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
        )}
      </div>

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
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>
        )}
      </div>

      {/* Job Role */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Job Role / Position <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Briefcase className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="e.g. Senior Full Stack Engineer"
            {...register("jobRole")}
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
          />
        </div>
        {errors.jobRole && (
          <p className="mt-1 text-xs text-rose-600">{errors.jobRole.message}</p>
        )}
      </div>

      {/* Hiring Stage */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Hiring Stage <span className="text-rose-500">*</span>
        </label>
        <select
          {...register("stage")}
          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all bg-white"
        >
          {HIRING_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        {errors.stage && (
          <p className="mt-1 text-xs text-rose-600">{errors.stage.message}</p>
        )}
      </div>

      {/* Resume URL */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Resume Link / Portfolio URL <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FileText className="w-4 h-4" />
          </span>
          <input
            type="url"
            placeholder="https://example.com/resume.pdf"
            {...register("resumeUrl")}
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
          />
        </div>
        {errors.resumeUrl && (
          <p className="mt-1 text-xs text-rose-600">{errors.resumeUrl.message}</p>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {isSubmitting
            ? "Saving..."
            : isEditing
            ? "Update Candidate"
            : "Save Candidate"}
        </button>
      </div>
    </form>
  );
}
