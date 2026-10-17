"use client";

import React, { useState } from "react";
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
  const [isDragOver, setIsDragOver] = useState(false);
  const config = STAGE_CONFIG[stage];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set dragOver false if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const candidateId = e.dataTransfer.getData("candidateId");
    const fromStage = e.dataTransfer.getData("fromStage");

    if (candidateId && fromStage !== stage) {
      onStageChange(candidateId, stage);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col flex-1 min-w-[280px] max-w-[340px] rounded-2xl border p-3.5 shadow-sm transition-all duration-150",
        isDragOver
          ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 scale-[1.01]"
          : "bg-slate-50/80 border-slate-200"
      )}
    >
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
      <div className="flex-1 flex flex-col gap-2.5 mt-2 overflow-y-auto max-h-[calc(100vh-230px)] pr-1 min-h-[150px]">
        {candidates.length === 0 ? (
          <div
            className={cn(
              "py-10 text-center text-xs border border-dashed rounded-xl transition-colors flex flex-col items-center justify-center",
              isDragOver
                ? "border-emerald-400 bg-white/80 text-emerald-700 font-semibold"
                : "border-slate-200 bg-white/50 text-slate-400"
            )}
          >
            {isDragOver ? "Drop candidate here" : `No candidates in ${config.label}`}
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
