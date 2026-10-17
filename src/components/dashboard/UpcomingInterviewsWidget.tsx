"use client";

import React from "react";
import { formatDateTime } from "@/lib/utils";
import { Calendar, Video, ArrowRight, User } from "lucide-react";
import Link from "next/link";

interface UpcomingInterviewsWidgetProps {
  interviews: any[];
}

export function UpcomingInterviewsWidget({
  interviews,
}: UpcomingInterviewsWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-700" />
              Upcoming Interviews
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled candidate assessments and interviews
            </p>
          </div>

          <Link
            href="/interviews"
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {interviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No upcoming interviews scheduled
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {interviews.map((iv) => {
              const candidate = iv.candidateId;
              return (
                <div
                  key={iv._id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        href={`/candidates/${candidate?._id}`}
                        className="font-semibold text-slate-800 hover:text-emerald-800 transition-colors block"
                      >
                        {candidate?.name || "Candidate"}
                      </Link>
                      <div className="text-[11px] text-slate-500">
                        <span>{iv.interviewType} Interview</span> •{" "}
                        <span>{iv.interviewerName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-semibold text-slate-800 block">
                      {formatDateTime(iv.scheduledAt)}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-medium">
                      {candidate?.jobRole}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
