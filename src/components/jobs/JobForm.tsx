"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema } from "@/lib/validators";
import { IJob, JobFormData } from "@/types/job";
import { Briefcase, Building, MapPin, Tag, Users, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface JobFormProps {
  initialData?: IJob;
  onSuccess?: (job: IJob) => void;
  onCancel?: () => void;
}

export function JobForm({ initialData, onSuccess, onCancel }: JobFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || "",
      department: initialData?.department || "Engineering",
      location: initialData?.location || "Remote",
      employmentType: initialData?.employmentType || "Full-time",
      description: initialData?.description || "",
      requiredSkills: Array.isArray(initialData?.requiredSkills)
        ? initialData.requiredSkills.join(", ")
        : "",
      experienceRequirements: initialData?.experienceRequirements || "2-4 years",
      openings: initialData?.openings ?? 1,
      status: initialData?.status || "Open",
    },
  });

  const onSubmit = async (values: JobFormData) => {
    setServerError(null);
    try {
      const url = isEditing ? `/api/jobs/${initialData?._id}` : "/api/jobs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save job");

      toast.success(isEditing ? "Job updated successfully" : "Job created successfully");
      if (onSuccess) {
        onSuccess(data.data);
      } else {
        router.push("/jobs");
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
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {serverError}
        </div>
      )}

      {/* Title & Department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Job Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Engineer"
              {...register("title")}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
            />
          </div>
          {errors.title && (
            <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Department <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("department")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
          >
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      {/* Location, Employment Type & Openings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Location <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. Remote / New York / Bangalore"
              {...register("location")}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Employment Type <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("employmentType")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Number of Openings
          </label>
          <input
            type="number"
            min={1}
            max={100}
            {...register("openings")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
        </div>
      </div>

      {/* Status & Experience */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Job Status
          </label>
          <select
            {...register("status")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
          >
            <option value="Open">Open (Accepting Candidates)</option>
            <option value="Draft">Draft</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Experience Requirements
          </label>
          <input
            type="text"
            placeholder="e.g. 3-5 years"
            {...register("experienceRequirements")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
        </div>
      </div>

      {/* Required Skills */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Required Skills <span className="text-slate-400 font-normal">(Comma separated)</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Tag className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="e.g. Next.js, React, Node.js, TypeScript, Tailwind CSS"
            {...register("requiredSkills")}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Job Description &amp; Responsibilities <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={5}
          placeholder="Detailed role expectations, responsibilities, team structure, and qualifications..."
          {...register("description")}
          className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
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
          <span>{isSubmitting ? "Saving..." : isEditing ? "Update Job" : "Publish Job"}</span>
        </button>
      </div>
    </form>
  );
}
