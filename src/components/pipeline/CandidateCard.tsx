"use client";

import React, { useState } from "react";
import { ICandidate } from "@/types/candidate";
import { HIRING_STAGES, STAGE_CONFIG, HiringStage } from "@/constants/stages";
import { formatDate } from "@/lib/utils";
import { Mail, Briefcase, ExternalLink, ChevronDown, Loader2, GripVertical, Building } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("candidateId", candidate._id);
    e.dataTransfer.setData("fromStage", candidate.stage);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40 scale-95 border-emerald-500 shadow-lg" : ""
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-300 group-hover:text-slate-400">
              <GripVertical className="w-3.5 h-3.5" />
            </span>
            <Link
              href={`/candidates/${candidate._id}`}
              className="font-semibold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors truncate"
            >
              {candidate.name}
            </Link>
          </div>
          <Link
            href={`/candidates/${candidate._id}`}
            title="View Details"
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-0.5 flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 truncate">
          <Briefcase className="w-3 h-3 text-emerald-600 flex-shrink-0" />
          <span className="truncate">{candidate.jobRole}</span>
        </div>

        {candidate.currentCompany && (
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 truncate">
            <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{candidate.currentCompany}</span>
          </div>
        )}

        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="truncate">{candidate.email}</span>
        </div>

        {/* Skills Pills if present */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {candidate.skills.slice(0, 2).map((skill, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-medium"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 2 && (
              <span className="text-[9px] text-slate-400">
                +{candidate.skills.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span>{formatDate(candidate.createdAt)}</span>

        {/* Keyboard-accessible stage selector fallback */}
        <div className="relative inline-flex items-center">
          <select
            value={candidate.stage}
            disabled={isUpdating}
            onChange={handleStageSelect}
            className="appearance-none text-[10px] font-semibold py-0.5 pl-1.5 pr-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-700"
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
