"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { HiringChart } from "@/components/dashboard/HiringChart";
import { RecentCandidates } from "@/components/dashboard/RecentCandidates";
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

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard/stats");
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
  }, [router]);

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
        {/* Top Header & Quick Add Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Recruitment Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Welcome back, {session?.user?.name || "Recruiter"}! Overview of candidate pipeline metrics.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </button>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
          <StatCard
            label="Total"
            value={stats?.total || 0}
            icon={<Users className="w-4 h-4 text-emerald-800" />}
            badgeBg="bg-emerald-100/70"
            className="col-span-2 sm:col-span-1 lg:col-span-1"
          />
          <StatCard
            label="Applied"
            value={stages.Applied}
            icon={<Inbox className="w-4 h-4 text-blue-700" />}
            badgeBg="bg-blue-50"
          />
          <StatCard
            label="Screening"
            value={stages.Screening}
            icon={<UserCheck className="w-4 h-4 text-amber-700" />}
            badgeBg="bg-amber-50"
          />
          <StatCard
            label="Interview"
            value={stages.Interview}
            icon={<CalendarCheck className="w-4 h-4 text-purple-700" />}
            badgeBg="bg-purple-50"
          />
          <StatCard
            label="Offers"
            value={stages.Offer}
            icon={<Award className="w-4 h-4 text-cyan-700" />}
            badgeBg="bg-cyan-50"
          />
          <StatCard
            label="Hired"
            value={stages.Hired}
            icon={<CheckCircle className="w-4 h-4 text-emerald-700" />}
            badgeBg="bg-emerald-50"
          />
          <StatCard
            label="Rejected"
            value={stages.Rejected}
            icon={<XCircle className="w-4 h-4 text-rose-700" />}
            badgeBg="bg-rose-50"
          />
        </div>

        {/* Charts & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HiringChart data={stats?.stageDistribution || []} />
          <RecentCandidates
            recent={stats?.recentCandidates || []}
            recentlyUpdated={stats?.recentlyUpdated || []}
          />
        </div>
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
