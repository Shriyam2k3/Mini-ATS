"use client";

import React, { useState } from "react";
import { ICandidate } from "@/types/candidate";
import { StageBadge } from "./StageBadge";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { formatDate, isValidUrl } from "@/lib/utils";
import {
  ExternalLink,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Briefcase,
  User,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { HiringStage } from "@/constants/stages";

interface CandidateTableProps {
  candidates: ICandidate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  onRefresh: () => void;
  onEdit?: (candidate: ICandidate) => void;
}

export function CandidateTable({
  candidates,
  pagination,
  onPageChange,
  onRefresh,
  onEdit,
}: CandidateTableProps) {
  const [candidateToDelete, setCandidateToDelete] = useState<ICandidate | null>(
    null
  );

  const handleDelete = async () => {
    if (!candidateToDelete) return;
    try {
      const res = await fetch(`/api/candidates/${candidateToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete candidate");

      toast.success(data.message || "Candidate deleted successfully");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete candidate");
      throw err;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Candidate</th>
              <th className="py-3.5 px-5">Job Role</th>
              <th className="py-3.5 px-5">Stage</th>
              <th className="py-3.5 px-5">Resume</th>
              <th className="py-3.5 px-5">Applied Date</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {candidates.map((candidate) => (
              <tr
                key={candidate._id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                {/* Candidate Info */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-200">
                      {candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Link
                        href={`/candidates/${candidate._id}`}
                        className="font-semibold text-slate-900 hover:text-emerald-800 transition-colors"
                      >
                        {candidate.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {candidate.email}
                        </span>
                        {candidate.phone && (
                          <span className="flex items-center gap-1">
                            • <Phone className="w-3 h-3 text-slate-400" />
                            {candidate.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Job Role */}
                <td className="py-4 px-5">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{candidate.jobRole}</span>
                  </div>
                </td>

                {/* Stage (with quick dropdown inline) */}
                <td className="py-4 px-5">
                  <StageBadge
                    stage={candidate.stage}
                    candidateId={candidate._id}
                    isEditable={true}
                    onStageChange={() => onRefresh()}
                  />
                </td>

                {/* Resume Link */}
                <td className="py-4 px-5">
                  {candidate.resumeUrl && isValidUrl(candidate.resumeUrl) ? (
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 transition-colors"
                    >
                      <span>View Resume</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Not provided</span>
                  )}
                </td>

                {/* Applied Date */}
                <td className="py-4 px-5 text-xs text-slate-500">
                  {formatDate(candidate.createdAt)}
                </td>

                {/* Actions */}
                <td className="py-4 px-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/candidates/${candidate._id}`}
                      title="View Details"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(candidate)}
                        title="Edit Candidate"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setCandidateToDelete(candidate)}
                      title="Delete Candidate"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div>
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {candidates.length > 0
              ? (pagination.page - 1) * pagination.limit + 1
              : 0}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-800">
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{" "}
          of <span className="font-semibold text-slate-800">{pagination.total}</span>{" "}
          candidates
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <span className="px-2 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={Boolean(candidateToDelete)}
        candidateName={candidateToDelete?.name || ""}
        onClose={() => setCandidateToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
