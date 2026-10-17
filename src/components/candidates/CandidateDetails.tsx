"use client";

import React, { useState, useEffect } from "react";
import { ICandidate } from "@/types/candidate";
import { StageBadge } from "./StageBadge";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { CandidateForm } from "./CandidateForm";
import { ActivityTimeline } from "./ActivityTimeline";
import { ScheduleInterviewModal } from "@/components/interviews/ScheduleInterviewModal";
import { InterviewStatusModal } from "@/components/interviews/InterviewStatusModal";
import { formatDate, formatDateTime, isValidUrl } from "@/lib/utils";
import { IInterview } from "@/types/interview";
import {
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ExternalLink,
  Edit3,
  Trash2,
  ArrowLeft,
  UserCheck,
  Clock,
  ShieldCheck,
  Building,
  Tag,
  DollarSign,
  Globe,
  Plus,
  Video,
  CheckCircle,
  XCircle,
  Layers,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CandidateDetailsProps {
  candidate: ICandidate;
  onRefresh?: () => void;
}

export function CandidateDetails({
  candidate: initialCandidate,
  onRefresh,
}: CandidateDetailsProps) {
  const router = useRouter();
  const [candidate, setCandidate] = useState<ICandidate>(initialCandidate);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "interviews" | "edit">("overview");
  const [showDelete, setShowDelete] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviews, setInterviews] = useState<IInterview[]>([]);
  const [selectedInterviewForStatus, setSelectedInterviewForStatus] = useState<IInterview | null>(null);

  const fetchInterviews = async () => {
    try {
      const res = await fetch(`/api/interviews?candidateId=${candidate._id}`);
      const data = await res.json();
      if (res.ok) {
        setInterviews(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [candidate._id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/candidates/${candidate._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete candidate");

      toast.success("Candidate deleted successfully");
      router.push("/candidates");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
      throw err;
    }
  };

  const handleEditSuccess = (updated: ICandidate) => {
    setCandidate(updated);
    setActiveTab("overview");
    if (onRefresh) onRefresh();
  };

  const createdByUser =
    typeof candidate.createdBy === "object" && candidate.createdBy !== null
      ? candidate.createdBy
      : null;

  const assignedJob =
    typeof candidate.jobId === "object" && candidate.jobId !== null
      ? candidate.jobId
      : null;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/candidates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidates Directory
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            Schedule Interview
          </button>
          <button
            onClick={() => setActiveTab(activeTab === "edit" ? "overview" : "edit")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {activeTab === "edit" ? "View Overview" : "Edit Details"}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100/70 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl border border-emerald-200 shadow-sm flex-shrink-0">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">
                  {candidate.name}
                </h1>
                {assignedJob && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Job: {assignedJob.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                <span className="font-medium text-emerald-800">
                  {candidate.jobRole}
                </span>
                {candidate.currentCompany && (
                  <span>• {candidate.currentCompany}</span>
                )}
                {candidate.yearsOfExperience !== undefined && (
                  <span>• {candidate.yearsOfExperience} Years Exp</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-[11px] text-slate-400 mb-1">Current Stage</span>
            <StageBadge
              stage={candidate.stage}
              candidateId={candidate._id}
              isEditable={true}
              onStageChange={(newStage) =>
                setCandidate({ ...candidate, stage: newStage })
              }
            />
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Overview &amp; Experience
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "timeline"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Activity Timeline &amp; Notes
          </button>
          <button
            onClick={() => setActiveTab("interviews")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "interviews"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Interviews ({interviews.length})
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "edit"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Core Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Contact &amp; Professional Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Email Address</span>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${candidate.email}`} className="hover:underline">
                      {candidate.email}
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Phone Number</span>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{candidate.phone || "Not provided"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Current Company &amp; Designation</span>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {candidate.currentDesignation || "Role"} at{" "}
                      {candidate.currentCompany || "N/A"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Experience &amp; Notice</span>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {candidate.yearsOfExperience || 0} Years • Notice:{" "}
                      {candidate.noticePeriod || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Tag Cloud */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700 block mb-2">
                    Skills &amp; Technologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resume & Portfolio Links */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Documents &amp; External Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 font-semibold block mb-1">Resume</span>
                  {candidate.resumeUrl && isValidUrl(candidate.resumeUrl) ? (
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline"
                    >
                      <span>View Resume Document</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">Not provided</span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 font-semibold block mb-1">Portfolio</span>
                  {candidate.portfolioUrl && isValidUrl(candidate.portfolioUrl) ? (
                    <a
                      href={candidate.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline"
                    >
                      <span>Portfolio Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">Not provided</span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 font-semibold block mb-1">LinkedIn</span>
                  {candidate.linkedInUrl && isValidUrl(candidate.linkedInUrl) ? (
                    <a
                      href={candidate.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline"
                    >
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">Not provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Audit &amp; Assignment
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Recruiter</span>
                  <span className="font-semibold text-slate-800">
                    {createdByUser?.name || "ATS Recruiter"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Application Source</span>
                  <span className="font-medium text-slate-700">
                    {candidate.source || "Direct"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Created At</span>
                  <span className="font-medium text-slate-700">
                    {formatDateTime(candidate.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Last Updated</span>
                  <span className="font-medium text-slate-700">
                    {formatDateTime(candidate.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Activity Timeline & Recruiter Notes */}
      {activeTab === "timeline" && (
        <ActivityTimeline candidateId={candidate._id} />
      )}

      {/* Tab 3: Interviews */}
      {activeTab === "interviews" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Scheduled &amp; Past Interviews
              </h3>
              <p className="text-xs text-slate-500">
                Assessment meetings and evaluation outcomes
              </p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Interview
            </button>
          </div>

          {interviews.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No interviews scheduled for {candidate.name} yet.
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((iv) => (
                <div
                  key={iv._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        {iv.interviewType} Interview
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          iv.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : iv.status === "Cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {iv.status}
                      </span>
                    </div>
                    <div className="mt-1 text-slate-500">
                      <span>Date: {formatDateTime(iv.scheduledAt)}</span> •{" "}
                      <span>Interviewer: {iv.interviewerName}</span>
                    </div>
                    {iv.meetingLink && (
                      <div className="mt-1">
                        <a
                          href={iv.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-800 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{iv.meetingLink}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {iv.feedback && (
                      <div className="mt-2 p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <strong>Feedback:</strong> {iv.feedback}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedInterviewForStatus(iv)}
                    className="self-start sm:self-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Update Outcome
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Edit Profile */}
      {activeTab === "edit" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
            Edit Candidate Profile
          </h2>
          <CandidateForm
            initialData={candidate}
            onSuccess={handleEditSuccess}
            onCancel={() => setActiveTab("overview")}
          />
        </div>
      )}

      {/* Modals */}
      <DeleteConfirmation
        isOpen={showDelete}
        candidateName={candidate.name}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />

      <ScheduleInterviewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        defaultCandidateId={candidate._id}
        defaultCandidateName={candidate.name}
        onSuccess={() => {
          fetchInterviews();
          setActiveTab("interviews");
        }}
      />

      <InterviewStatusModal
        isOpen={Boolean(selectedInterviewForStatus)}
        interview={selectedInterviewForStatus}
        onClose={() => setSelectedInterviewForStatus(null)}
        onSuccess={() => fetchInterviews()}
      />
    </div>
  );
}
