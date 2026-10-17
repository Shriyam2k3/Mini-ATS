"use client";

import React, { useState } from "react";
import { HIRING_STAGES, STAGE_CONFIG, HiringStage } from "@/constants/stages";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StageBadgeProps {
  stage: HiringStage;
  candidateId?: string;
  isEditable?: boolean;
  onStageChange?: (newStage: HiringStage) => void;
  className?: string;
}

export function StageBadge({
  stage,
  candidateId,
  isEditable = false,
  onStageChange,
  className,
}: StageBadgeProps) {
  const [currentStage, setCurrentStage] = useState<HiringStage>(stage);
  const [isUpdating, setIsUpdating] = useState(false);

  const config = STAGE_CONFIG[currentStage] || STAGE_CONFIG["Applied"];

  const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value as HiringStage;
    if (newStage === currentStage) return;

    if (candidateId) {
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/candidates/${candidateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update stage");
        }

        setCurrentStage(newStage);
        toast.success(`Stage updated to ${newStage}`);
        if (onStageChange) onStageChange(newStage);
      } catch (err: any) {
        toast.error(err.message || "Failed to update stage");
      } finally {
        setIsUpdating(false);
      }
    } else if (onStageChange) {
      setCurrentStage(newStage);
      onStageChange(newStage);
    }
  };

  if (isEditable) {
    return (
      <div className={cn("relative inline-flex items-center", className)}>
        <select
          value={currentStage}
          disabled={isUpdating}
          onChange={handleSelect}
          className={cn(
            "appearance-none text-xs font-semibold py-1 pl-2.5 pr-7 rounded-full border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600/30",
            config.badgeBg,
            config.badgeText,
            config.badgeBorder,
            isUpdating && "opacity-60 cursor-not-allowed"
          )}
        >
          {HIRING_STAGES.map((s) => (
            <option key={s} value={s} className="bg-white text-slate-800">
              {s}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 text-slate-400">
          {isUpdating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.badgeBg,
        config.badgeText,
        config.badgeBorder,
        className
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
