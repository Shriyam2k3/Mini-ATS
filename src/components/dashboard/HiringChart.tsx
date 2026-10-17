"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { HiringStage } from "@/constants/stages";

interface HiringChartProps {
  data: {
    stage: HiringStage;
    label: string;
    count: number;
    color: string;
  }[];
}

export function HiringChart({ data }: HiringChartProps) {
  const hasData = data && data.some((d) => d.count > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Hiring Pipeline Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time candidate count across every ATS recruitment stage
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
          No candidates in pipeline to display
        </div>
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
                tick={{ fill: "#64748B", fontSize: 12 }}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
                tick={{ fill: "#64748B", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg">
                        <span className="font-semibold block">{item.label}</span>
                        <span className="text-slate-300">
                          {item.count} {item.count === 1 ? "Candidate" : "Candidates"}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
