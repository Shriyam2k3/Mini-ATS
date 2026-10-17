"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CandidateFilters } from "@/components/candidates/CandidateFilters";
import { CandidateTable } from "@/components/candidates/CandidateTable";
import { QuickAddModal } from "@/components/dashboard/QuickAddModal";
import { CsvImportModal } from "@/components/candidates/CsvImportModal";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ICandidate } from "@/types/candidate";
import { Plus, Users, Download, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function CandidatesContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [candidates, setCandidates] = useState<ICandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination state (initialized from URL where present)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [stage, setStage] = useState(searchParams.get("stage") || "ALL");
  const [jobId, setJobId] = useState(searchParams.get("jobId") || "ALL");
  const [skill, setSkill] = useState(searchParams.get("skill") || "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt");
  const [order, setOrder] = useState(searchParams.get("order") || "desc");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (stage && stage !== "ALL") params.set("stage", stage);
      if (jobId && jobId !== "ALL") params.set("jobId", jobId);
      if (skill) params.set("skill", skill);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("sort", sort);
      params.set("order", order);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/candidates?${params.toString()}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load candidates");
      }

      setCandidates(data.data || []);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, stage, jobId, skill, startDate, endDate, sort, order, page, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCandidates();
    }
  }, [status, router, fetchCandidates]);

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStage("ALL");
    setJobId("ALL");
    setSkill("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (stage && stage !== "ALL") params.set("stage", stage);
    if (jobId && jobId !== "ALL") params.set("jobId", jobId);
    if (skill) params.set("skill", skill);

    toast.info("Generating CSV export...");
    window.open(`/api/candidates/export?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Candidate Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage applicant profiles, interview stages, and resumes
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <CandidateFilters
        search={search}
        stage={stage}
        jobId={jobId}
        skill={skill}
        startDate={startDate}
        endDate={endDate}
        sort={sort}
        order={order}
        onSearchChange={setSearch}
        onStageChange={(newStage) => {
          setStage(newStage);
          setPage(1);
        }}
        onJobChange={(newJob) => {
          setJobId(newJob);
          setPage(1);
        }}
        onSkillChange={(newSkill) => {
          setSkill(newSkill);
          setPage(1);
        }}
        onDateChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
          setPage(1);
        }}
        onSortChange={(newSort, newOrder) => {
          setSort(newSort);
          setOrder(newOrder);
          setPage(1);
        }}
        onClearFilters={handleClearFilters}
      />

      {/* Candidate List Table */}
      {loading && candidates.length === 0 ? (
        <LoadingState message="Loading candidates..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCandidates} />
      ) : candidates.length === 0 ? (
        <EmptyState
          title="No matching candidates"
          description="Try adjusting your search query, clearing filters, or adding a new candidate."
          actionLabel="Add Candidate"
          onAction={() => setShowAddModal(true)}
          icon={<Users className="w-6 h-6 text-slate-400" />}
        />
      ) : (
        <CandidateTable
          candidates={candidates}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
          onRefresh={fetchCandidates}
        />
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => fetchCandidates()}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => fetchCandidates()}
      />
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingState fullPage message="Loading candidate directory..." />}>
        <CandidatesContent />
      </Suspense>
    </MainLayout>
  );
}
