"use client";

import React from "react";
import { ICandidate } from "@/types/candidate";
import { HiringStage, STAGE_CONFIG } from "@/constants/stages";
import { CandidateCard } from "./CandidateCard";
import { cn } from "@/lib/utils";

interface PipelineColumnProps {
  stage: HiringStage;
  candidates: ICandidate[];
  onStageChange: (candidateId: string, newStage: HiringStage) => void;
}

export function PipelineColumn({
  stage,
  candidates,
  onStageChange,
}: PipelineColumnProps) {
  const config = STAGE_CONFIG[stage];

  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-[340px] bg-slate-50/80 rounded-2xl border border-slate-200 p-3.5 shadow-sm">
      {/* Column Header */}
      <div className={cn("pb-3 border-t-4 pt-1 flex items-center justify-between", config.borderTop)}>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <h3 className="font-semibold text-sm text-slate-800">
            {config.label}
          </h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shadow-xs">
          {candidates.length}
        </span>
      </div>

      {/* Cards list */}
      <div className="flex-1 flex flex-col gap-3 mt-2 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
        {candidates.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
            No candidates in {config.label}
          </div>
        ) : (
          candidates.map((c) => (
            <CandidateCard
              key={c._id}
              candidate={c}
              onStageChange={onStageChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
