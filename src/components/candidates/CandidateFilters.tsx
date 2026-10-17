"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, ArrowUpDown, X, Briefcase, Calendar, Tag } from "lucide-react";
import { HIRING_STAGES } from "@/constants/stages";

interface CandidateFiltersProps {
  search: string;
  stage: string;
  jobId: string;
  skill: string;
  startDate: string;
  endDate: string;
  sort: string;
  order: string;
  onSearchChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onJobChange: (value: string) => void;
  onSkillChange: (value: string) => void;
  onDateChange: (start: string, end: string) => void;
  onSortChange: (sort: string, order: string) => void;
  onClearFilters: () => void;
}

export function CandidateFilters({
  search,
  stage,
  jobId,
  skill,
  startDate,
  endDate,
  sort,
  order,
  onSearchChange,
  onStageChange,
  onJobChange,
  onSkillChange,
  onDateChange,
  onSortChange,
  onClearFilters,
}: CandidateFiltersProps) {
  const [jobs, setJobs] = useState<{ _id: string; title: string }[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setJobs(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const hasActiveFilters =
    Boolean(search) ||
    (stage && stage !== "ALL") ||
    (jobId && jobId !== "ALL") ||
    Boolean(skill) ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      {/* Primary Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by candidate name, email, role, or company..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Stage Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
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

          {/* Job Filter */}
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={jobId}
              onChange={(e) => onJobChange(e.target.value)}
              className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none cursor-pointer text-slate-700 max-w-[140px] truncate"
            >
              <option value="ALL">All Jobs</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
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
              <option value="yearsOfExperience-desc">Experience (High - Low)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold px-2.5 py-2 text-slate-600 hover:text-emerald-800 transition-colors"
          >
            {showAdvanced ? "Less Filters" : "More Filters"}
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              title="Clear all active filters"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Expandable Row (Skill & Date Range) */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Skill:</span>
            <input
              type="text"
              value={skill}
              onChange={(e) => onSkillChange(e.target.value)}
              placeholder="e.g. React, Python"
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Applied From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onDateChange(e.target.value, endDate)}
              className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
            />
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onDateChange(startDate, e.target.value)}
              className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}
