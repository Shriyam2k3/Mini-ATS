"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { IJob } from "@/types/job";
import {
  Briefcase,
  Plus,
  MapPin,
  Users,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function JobsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      if (departmentFilter && departmentFilter !== "ALL") params.set("department", departmentFilter);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load jobs");
      setJobs(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, departmentFilter, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchJobs();
    }
  }, [status, router, fetchJobs]);

  const getStatusBadge = (jobStatus: string) => {
    switch (jobStatus) {
      case "Open":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Draft":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "On Hold":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Closed":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Job Openings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create and manage open recruitment positions and associated applicants
            </p>
          </div>

          <Link
            href="/jobs/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1"
          >
            <Plus className="w-4 h-4" />
            Create Job Opening
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, department, or location..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none cursor-pointer text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Draft">Draft</option>
              <option value="On Hold">On Hold</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none cursor-pointer text-slate-700"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>
        </div>

        {/* Jobs List Grid */}
        {loading && jobs.length === 0 ? (
          <LoadingState message="Loading job listings..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchJobs} />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No job openings found"
            description="Create your first job listing to associate applicants and streamline hiring."
            actionLabel="Create Job"
            onAction={() => router.push("/jobs/create")}
            icon={<Briefcase className="w-6 h-6 text-slate-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {job.department}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <Link
                    href={`/jobs/${job._id}`}
                    className="font-bold text-base text-slate-900 group-hover:text-emerald-800 transition-colors block mt-1.5"
                  >
                    {job.title}
                  </Link>

                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span>{job.employmentType}</span>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.requiredSkills.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {job.requiredSkills.length > 3 && (
                        <span className="text-[10px] text-slate-400">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {job.candidateCount || 0}{" "}
                      {job.candidateCount === 1 ? "Applicant" : "Applicants"}
                    </span>
                  </div>

                  <Link
                    href={`/jobs/${job._id}`}
                    className="font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
                  >
                    Manage
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
