import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  subtext?: string;
  badgeBg?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  subtext,
  badgeBg = "bg-emerald-50 text-emerald-800",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", badgeBg)}>
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          {value.toLocaleString()}
        </h3>
        {subtext && (
          <p className="mt-1 text-xs text-slate-500">{subtext}</p>
        )}
      </div>
    </div>
  );
}
