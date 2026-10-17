"use client";

import React, { useState } from "react";
import { IInterview } from "@/types/interview";
import { InterviewStatus } from "@/models/Interview";
import { X, CheckCircle, XCircle, RefreshCw, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InterviewStatusModalProps {
  isOpen: boolean;
  interview: IInterview | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function InterviewStatusModal({
  isOpen,
  interview,
  onClose,
  onSuccess,
}: InterviewStatusModalProps) {
  const [status, setStatus] = useState<InterviewStatus>(interview?.status || "Completed");
  const [feedback, setFeedback] = useState(interview?.feedback || "");
  const [rating, setRating] = useState<number>(interview?.rating || 4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !interview) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/interviews/${interview._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          feedback,
          rating,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update interview");

      toast.success(`Interview marked as ${status}`);
      onClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Update Interview Status &amp; Feedback
            </h3>
            <p className="text-xs text-slate-500">
              Candidate:{" "}
              <span className="font-semibold text-slate-800">
                {typeof interview.candidateId === "object"
                  ? interview.candidateId.name
                  : "Candidate"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Outcome Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus("Completed")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  status === "Completed"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-600/20"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Completed
              </button>
              <button
                type="button"
                onClick={() => setStatus("Cancelled")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  status === "Cancelled"
                    ? "bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-600/20"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Cancelled
              </button>
              <button
                type="button"
                onClick={() => setStatus("Rescheduled")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  status === "Rescheduled"
                    ? "bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-600/20"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                Reschedule
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Candidate Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-slate-600 ml-1">
                {rating} / 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Interviewer Feedback / Evaluation Notes
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Record candidate strengths, technical proficiency, communication score, and next step recommendation..."
              rows={3}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
            />
          </div>

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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? "Saving..." : "Save Feedback"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
