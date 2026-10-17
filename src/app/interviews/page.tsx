"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ScheduleInterviewModal } from "@/components/interviews/ScheduleInterviewModal";
import { InterviewStatusModal } from "@/components/interviews/InterviewStatusModal";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { IInterview } from "@/types/interview";
import { formatDateTime } from "@/lib/utils";
import {
  Calendar,
  Plus,
  Video,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  User,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function InterviewsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [interviews, setInterviews] = useState<IInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"upcoming" | "past" | "all">("upcoming");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInterviewForStatus, setSelectedInterviewForStatus] = useState<IInterview | null>(null);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/interviews?timeframe=${timeframe}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load interviews");
      setInterviews(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  }, [timeframe, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchInterviews();
    }
  }, [status, router, fetchInterviews]);

  const handleDeleteInterview = async (id: string) => {
    if (!confirm("Are you sure you want to remove this interview record?")) return;
    try {
      const res = await fetch(`/api/interviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete interview");
      toast.success("Interview removed successfully");
      fetchInterviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove interview");
    }
  };

  const getStatusBadge = (ivStatus: string) => {
    switch (ivStatus) {
      case "Scheduled":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "Rescheduled":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="w-3.5 h-3.5" />;
      case "Phone":
        return <Phone className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Interview Schedule
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Coordinate technical rounds, HR evaluations, and record interviewer feedback
            </p>
          </div>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1"
          >
            <Plus className="w-4 h-4" />
            Schedule Interview
          </button>
        </div>

        {/* Timeframe Switcher Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { label: "Upcoming Interviews", value: "upcoming" },
            { label: "Past / Completed", value: "past" },
            { label: "All Interviews", value: "all" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTimeframe(tab.value as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                timeframe === tab.value
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interviews List */}
        {loading && interviews.length === 0 ? (
          <LoadingState message="Loading interviews..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchInterviews} />
        ) : interviews.length === 0 ? (
          <EmptyState
            title={`No ${timeframe} interviews found`}
            description="Schedule an interview to evaluate your candidates and record feedback."
            actionLabel="Schedule Interview"
            onAction={() => setShowScheduleModal(true)}
            icon={<Calendar className="w-6 h-6 text-slate-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.map((iv) => {
              const candidate =
                typeof iv.candidateId === "object" ? iv.candidateId : null;
              const job = typeof iv.jobId === "object" ? iv.jobId : null;

              return (
                <div
                  key={iv._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Candidate Name & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/candidates/${candidate?._id}`}
                          className="font-bold text-sm text-slate-900 hover:text-emerald-800 transition-colors"
                        >
                          {candidate?.name || "Candidate"}
                        </Link>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {candidate?.jobRole || job?.title || "Applicant"}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          iv.status
                        )}`}
                      >
                        {iv.status}
                      </span>
                    </div>

                    {/* Interview Details */}
                    <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {getInterviewTypeIcon(iv.interviewType)}
                          {iv.interviewType} Interview ({iv.durationMinutes} mins)
                        </span>
                        <span className="font-semibold text-emerald-800">
                          {formatDateTime(iv.scheduledAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Interviewer: <strong>{iv.interviewerName}</strong></span>
                      </div>

                      {iv.meetingLink && (
                        <div>
                          <a
                            href={iv.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline"
                          >
                            <span>Join Meeting / Location</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Notes if available */}
                    {iv.notes && (
                      <div className="mt-3 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Notes:</span> {iv.notes}
                      </div>
                    )}

                    {/* Feedback & Rating if completed */}
                    {iv.feedback && (
                      <div className="mt-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900">Feedback:</span>
                          {iv.rating && (
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              {iv.rating} / 5
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed">{iv.feedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setSelectedInterviewForStatus(iv)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Update Outcome
                    </button>

                    <button
                      onClick={() => handleDeleteInterview(iv._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Interview"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={() => fetchInterviews()}
      />

      {/* Outcome / Feedback Modal */}
      <InterviewStatusModal
        isOpen={Boolean(selectedInterviewForStatus)}
        interview={selectedInterviewForStatus}
        onClose={() => setSelectedInterviewForStatus(null)}
        onSuccess={() => fetchInterviews()}
      />
    </MainLayout>
  );
}
