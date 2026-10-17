"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { interviewSchema } from "@/lib/validators";
import { InterviewFormData } from "@/types/interview";
import { X, Calendar, Clock, Video, User, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCandidateId?: string;
  defaultCandidateName?: string;
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  onSuccess,
  defaultCandidateId,
  defaultCandidateName,
}: ScheduleInterviewModalProps) {
  const [candidates, setCandidates] = useState<{ _id: string; name: string; jobRole: string }[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      candidateId: defaultCandidateId || "",
      interviewType: "Video",
      durationMinutes: 45,
      interviewerName: "",
      meetingLink: "",
      notes: "",
      scheduledAt: "",
    },
  });

  useEffect(() => {
    if (defaultCandidateId) {
      setValue("candidateId", defaultCandidateId);
    } else if (isOpen) {
      setLoadingCandidates(true);
      fetch("/api/candidates?limit=100")
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setCandidates(
              data.data.map((c: any) => ({
                _id: c._id,
                name: c.name,
                jobRole: c.jobRole,
              }))
            );
          }
        })
        .catch(console.error)
        .finally(() => setLoadingCandidates(false));
    }
  }, [isOpen, defaultCandidateId, setValue]);

  if (!isOpen) return null;

  const onSubmit = async (values: InterviewFormData) => {
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule interview");

      toast.success("Interview scheduled successfully!");
      reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule interview");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Schedule Interview
              </h3>
              <p className="text-xs text-slate-500">
                Plan recruitment assessment or interview meeting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Candidate Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Candidate <span className="text-rose-500">*</span>
            </label>
            {defaultCandidateName ? (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                {defaultCandidateName}
              </div>
            ) : (
              <select
                {...register("candidateId")}
                disabled={loadingCandidates}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
              >
                <option value="">Select Candidate...</option>
                {candidates.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} — ({c.jobRole})
                  </option>
                ))}
              </select>
            )}
            {errors.candidateId && (
              <p className="mt-1 text-xs text-rose-600">{errors.candidateId.message}</p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date &amp; Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register("scheduledAt")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
              />
              {errors.scheduledAt && (
                <p className="mt-1 text-xs text-rose-600">{errors.scheduledAt.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Duration (Minutes)
              </label>
              <select
                {...register("durationMinutes")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>
          </div>

          {/* Interview Type & Interviewer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Interview Type <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("interviewType")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none bg-white"
              >
                <option value="Video">Video Call</option>
                <option value="Phone">Phone Call</option>
                <option value="In Person">In Person</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Interviewer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins (Tech Lead)"
                {...register("interviewerName")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
              />
              {errors.interviewerName && (
                <p className="mt-1 text-xs text-rose-600">{errors.interviewerName.message}</p>
              )}
            </div>
          </div>

          {/* Meeting Link / Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Meeting URL or Location (Optional)
            </label>
            <input
              type="text"
              placeholder="https://meet.google.com/xyz-abc or Conference Room 3"
              {...register("meetingLink")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preparation Notes / Topics (Optional)
            </label>
            <textarea
              placeholder="e.g. System design discussion, React internals, and problem solving."
              rows={2}
              {...register("notes")}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Calendar className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? "Scheduling..." : "Confirm Schedule"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
