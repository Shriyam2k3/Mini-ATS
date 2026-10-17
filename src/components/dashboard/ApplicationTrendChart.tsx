"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity } from "lucide-react";

interface ApplicationTrendChartProps {
  data: {
    date: string;
    applications: number;
  }[];
}

export function ApplicationTrendChart({ data }: ApplicationTrendChartProps) {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            Application Velocity Trend
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily inbound candidate applications over the last 14 days
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
          No application activity recorded
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="appTrendColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
                tick={{ fill: "#64748B", fontSize: 11 }}
                interval={1}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
                tick={{ fill: "#64748B", fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg">
                        <span className="font-semibold block">{item.date}</span>
                        <span className="text-emerald-300">
                          {item.applications}{" "}
                          {item.applications === 1
                            ? "New Candidate"
                            : "New Candidates"}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#appTrendColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
