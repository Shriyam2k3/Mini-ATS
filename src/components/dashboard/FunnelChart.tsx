"use client";

import React from "react";
import { HiringStage } from "@/constants/stages";
import { ArrowRight, TrendingUp } from "lucide-react";

interface FunnelChartProps {
  data: {
    stage: HiringStage;
    label: string;
    count: number;
    color: string;
    conversionRate: number;
  }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const hasData = data && data.some((d) => d.count > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            Hiring Funnel &amp; Conversions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage progression and applicant retention through recruitment funnel
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
          No candidate funnel data available
        </div>
      ) : (
        <div className="space-y-3.5 pt-2">
          {data.map((item, index) => {
            const nextItem = data[index + 1];
            const stepConversion =
              item.count > 0 && nextItem
                ? Math.round((nextItem.count / item.count) * 100)
                : null;

            return (
              <div key={item.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-800">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      {item.count} Candidates
                    </span>
                    <span className="text-slate-400 font-medium">
                      ({item.conversionRate}% overall)
                    </span>
                  </div>
                </div>

                {/* Funnel Progress Bar */}
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(item.conversionRate, 4)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                {stepConversion !== null && (
                  <div className="flex items-center justify-end text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-emerald-800">
                      <ArrowRight className="w-2.5 h-2.5" />
                      {stepConversion}% step conversion to next stage
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
