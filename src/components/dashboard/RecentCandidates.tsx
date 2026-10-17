"use client";

import React, { useState } from "react";
import { ICandidate } from "@/types/candidate";
import { StageBadge } from "../candidates/StageBadge";
import { formatDate } from "@/lib/utils";
import { Clock, UserPlus, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

interface RecentCandidatesProps {
  recent: ICandidate[];
  recentlyUpdated: ICandidate[];
}

export function RecentCandidates({
  recent,
  recentlyUpdated,
}: RecentCandidatesProps) {
  const [tab, setTab] = useState<"newest" | "updated">("newest");

  const candidates = tab === "newest" ? recent : recentlyUpdated;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTab("newest")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === "newest"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Recent Applicants
            </button>
            <button
              onClick={() => setTab("updated")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === "updated"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Recently Updated
            </button>
          </div>

          <Link
            href="/candidates"
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {candidates.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No candidate activity yet
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {candidates.map((c) => (
              <div
                key={c._id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/candidates/${c._id}`}
                      className="font-semibold text-xs text-slate-800 hover:text-emerald-800 transition-colors block"
                    >
                      {c.name}
                    </Link>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{c.jobRole}</span>
                      <span>•</span>
                      <span>{formatDate(tab === "newest" ? c.createdAt : c.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <StageBadge stage={c.stage} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
