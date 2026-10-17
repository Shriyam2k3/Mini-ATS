"use client";

import React, { useState } from "react";
import { ICandidate } from "@/types/candidate";
import { HIRING_STAGES, STAGE_CONFIG, HiringStage } from "@/constants/stages";
import { formatDate } from "@/lib/utils";
import { Mail, Briefcase, ExternalLink, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CandidateCardProps {
  candidate: ICandidate;
  onStageChange: (candidateId: string, newStage: HiringStage) => void;
}

export function CandidateCard({
  candidate,
  onStageChange,
}: CandidateCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStageSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value as HiringStage;
    if (newStage === candidate.stage) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/candidates/${candidate._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update stage");

      toast.success(`Moved ${candidate.name} to ${newStage}`);
      onStageChange(candidate._id, newStage);
    } catch (err: any) {
      toast.error(err.message || "Failed to update stage");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/candidates/${candidate._id}`}
            className="font-semibold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1"
          >
            {candidate.name}
          </Link>
          <Link
            href={`/candidates/${candidate._id}`}
            title="View Details"
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-0.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-800 line-clamp-1">
          <Briefcase className="w-3 h-3 text-emerald-600 flex-shrink-0" />
          <span>{candidate.jobRole}</span>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 line-clamp-1">
          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span>{candidate.email}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>{formatDate(candidate.createdAt)}</span>

        <div className="relative inline-flex items-center">
          <select
            value={candidate.stage}
            disabled={isUpdating}
            onChange={handleStageSelect}
            className="appearance-none text-[11px] font-semibold py-0.5 pl-2 pr-5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            {HIRING_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-1 text-slate-400">
            {isUpdating ? (
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
            ) : (
              <ChevronDown className="w-2.5 h-2.5" />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
