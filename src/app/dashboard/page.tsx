"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { HiringChart } from "@/components/dashboard/HiringChart";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { ApplicationTrendChart } from "@/components/dashboard/ApplicationTrendChart";
import { RecentCandidates } from "@/components/dashboard/RecentCandidates";
import { UpcomingInterviewsWidget } from "@/components/dashboard/UpcomingInterviewsWidget";
import { QuickAddModal } from "@/components/dashboard/QuickAddModal";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { CandidateStats } from "@/types/candidate";
import {
  Users,
  Inbox,
  UserCheck,
  CalendarCheck,
  Award,
  CheckCircle,
  XCircle,
  Plus,
  Briefcase,
  Calendar,
  Percent,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dateRange, setDateRange] = useState("all"); // "7d" | "30d" | "90d" | "all"

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/dashboard/stats?dateRange=${dateRange}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load dashboard statistics");
      }
      setStats(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [dateRange, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchStats();
    }
  }, [status, router, fetchStats]);

  useEffect(() => {
    const handleRefresh = () => fetchStats();
    window.addEventListener("refresh-ats-data", handleRefresh);
    return () => window.removeEventListener("refresh-ats-data", handleRefresh);
  }, [fetchStats]);

  if (status === "loading" || (loading && !stats)) {
    return (
      <MainLayout>
        <LoadingState fullPage message="Loading recruitment metrics..." />
      </MainLayout>
    );
  }

  if (error && !stats) {
    return (
      <MainLayout>
        <ErrorState
          title="Dashboard Unavailable"
          message={error}
          onRetry={fetchStats}
        />
      </MainLayout>
    );
  }

  const stages = stats?.stages || {
    Applied: 0,
    Screening: 0,
    Interview: 0,
    Offer: 0,
    Hired: 0,
    Rejected: 0,
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Top Header & Date Range Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Recruitment Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Welcome back, {session?.user?.name || "Recruiter"}! Live overview of pipeline velocity and hiring funnel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
              <span className="text-[11px] font-semibold text-slate-400 pl-2">Period:</span>
              {[
                { label: "All Time", value: "all" },
                { label: "30 Days", value: "30d" },
                { label: "7 Days", value: "7d" },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setDateRange(p.value)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    dateRange === p.value
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1"
            >
              <Plus className="w-4 h-4" />
              Add Candidate
            </button>
          </div>
        </div>

        {/* Top Primary Metrics Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Candidates"
            value={stats?.total || 0}
            icon={<Users className="w-4 h-4 text-emerald-800" />}
            badgeBg="bg-emerald-100/70"
            subtext="Registered applicants in pipeline"
          />
          <StatCard
            label="Open Job Positions"
            value={stats?.openJobsCount || 0}
            icon={<Briefcase className="w-4 h-4 text-blue-700" />}
            badgeBg="bg-blue-50"
            subtext="Active listings accepting applications"
          />
          <StatCard
            label="Upcoming Interviews"
            value={stats?.upcomingInterviewsCount || 0}
            icon={<Calendar className="w-4 h-4 text-purple-700" />}
            badgeBg="bg-purple-50"
            subtext="Scheduled candidate meetings"
          />
          <StatCard
            label="Hiring Conversion Rate"
            value={stats?.conversionRate || 0}
            icon={<Percent className="w-4 h-4 text-emerald-700" />}
            badgeBg="bg-emerald-50"
            subtext="Applicants hired (% of total)"
          />
        </div>

        {/* Stage Status Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Applied"
            value={stages.Applied}
            icon={<Inbox className="w-3.5 h-3.5 text-blue-700" />}
            badgeBg="bg-blue-50"
          />
          <StatCard
            label="Screening"
            value={stages.Screening}
            icon={<UserCheck className="w-3.5 h-3.5 text-amber-700" />}
            badgeBg="bg-amber-50"
          />
          <StatCard
            label="Interview"
            value={stages.Interview}
            icon={<CalendarCheck className="w-3.5 h-3.5 text-purple-700" />}
            badgeBg="bg-purple-50"
          />
          <StatCard
            label="Offers"
            value={stages.Offer}
            icon={<Award className="w-3.5 h-3.5 text-cyan-700" />}
            badgeBg="bg-cyan-50"
          />
          <StatCard
            label="Hired"
            value={stages.Hired}
            icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-700" />}
            badgeBg="bg-emerald-50"
          />
          <StatCard
            label="Rejected"
            value={stages.Rejected}
            icon={<XCircle className="w-3.5 h-3.5 text-rose-700" />}
            badgeBg="bg-rose-50"
          />
        </div>

        {/* Analytics & Funnel Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart data={stats?.funnelStages || []} />
          <ApplicationTrendChart data={stats?.trendData || []} />
        </div>

        {/* Pipeline Distribution Bar Chart & Upcoming Interviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HiringChart data={stats?.stageDistribution || []} />
          <UpcomingInterviewsWidget
            interviews={stats?.upcomingInterviewsList || []}
          />
        </div>

        {/* Activity Feed */}
        <RecentCandidates
          recent={stats?.recentCandidates || []}
          recentlyUpdated={stats?.recentlyUpdated || []}
        />
      </div>

      {/* Quick Add Candidate Modal */}
      <QuickAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => fetchStats()}
      />
    </MainLayout>
  );
}
