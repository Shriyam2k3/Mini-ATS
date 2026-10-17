"use client";

import React, { useState } from "react";
import { ICandidate } from "@/types/candidate";
import { StageBadge } from "./StageBadge";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { CandidateForm } from "./CandidateForm";
import { formatDate, formatDateTime, isValidUrl } from "@/lib/utils";
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
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

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
    setIsEditing(false);
    if (onRefresh) onRefresh();
  };

  const createdByUser =
    typeof candidate.createdBy === "object" && candidate.createdBy !== null
      ? candidate.createdBy
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
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? "Close Form" : "Edit Details"}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100/70 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
            Edit Candidate Profile
          </h2>
          <CandidateForm
            initialData={candidate}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl border border-emerald-200 shadow-sm">
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {candidate.name}
                  </h1>
                  <p className="text-sm font-medium text-emerald-800 mt-0.5">
                    {candidate.jobRole}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Current Stage</span>
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

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address
                </span>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a
                    href={`mailto:${candidate.email}`}
                    className="hover:underline hover:text-emerald-800"
                  >
                    {candidate.email}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Phone Number
                </span>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{candidate.phone || "Not provided"}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Job Position
                </span>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{candidate.jobRole}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Resume / Portfolio Link
                </span>
                {candidate.resumeUrl && isValidUrl(candidate.resumeUrl) ? (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open External Resume</span>
                  </a>
                ) : (
                  <span className="text-sm text-slate-400">No resume URL linked</span>
                )}
              </div>
            </div>

            {/* Resume preview card if available */}
            {candidate.resumeUrl && isValidUrl(candidate.resumeUrl) && (
              <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700">
                    Candidate Resume Link
                  </h4>
                  <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                    {candidate.resumeUrl}
                  </p>
                </div>
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition-colors"
                >
                  View Document
                </a>
              </div>
            )}
          </div>

          {/* Audit & Recruiter Metadata Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Audit & Recruiter Info
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Added By Recruiter</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {createdByUser?.name || "ATS Recruiter"}
                      </span>
                      <span className="text-slate-500">
                        {createdByUser?.email || "recruiter@earlyjobs.ai"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block mb-1">Created At</span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateTime(candidate.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Last Updated</span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateTime(candidate.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDelete}
        candidateName={candidate.name}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
