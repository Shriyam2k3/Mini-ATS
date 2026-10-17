"use client";

import React from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { HIRING_STAGES } from "@/constants/stages";

interface CandidateFiltersProps {
  search: string;
  stage: string;
  sort: string;
  order: string;
  onSearchChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onSortChange: (sort: string, order: string) => void;
}

export function CandidateFilters({
  search,
  stage,
  sort,
  order,
  onSearchChange,
  onStageChange,
  onSortChange,
}: CandidateFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Bar */}
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by candidate name, email, or job role..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Stage Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={stage}
            onChange={(e) => onStageChange(e.target.value)}
            className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none cursor-pointer text-slate-700"
          >
            <option value="ALL">All Stages</option>
            {HIRING_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={`${sort}-${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split("-");
              onSortChange(s, o);
            }}
            className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none cursor-pointer text-slate-700"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A - Z)</option>
            <option value="name-desc">Name (Z - A)</option>
            <option value="jobRole-asc">Job Role (A - Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
