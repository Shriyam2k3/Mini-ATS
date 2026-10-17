"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CandidateFilters } from "@/components/candidates/CandidateFilters";
import { CandidateTable } from "@/components/candidates/CandidateTable";
import { QuickAddModal } from "@/components/dashboard/QuickAddModal";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ICandidate } from "@/types/candidate";
import { Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CandidatesPage() {
  const { status } = useSession();
  const router = useRouter();

  const [candidates, setCandidates] = useState<ICandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stage, setStage] = useState("ALL");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [showAddModal, setShowAddModal] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
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
  }, [debouncedSearch, stage, sort, order, page, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCandidates();
    }
  }, [status, router, fetchCandidates]);

  return (
    <MainLayout>
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

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </button>
        </div>

        {/* Filters & Search */}
        <CandidateFilters
          search={search}
          stage={stage}
          sort={sort}
          order={order}
          onSearchChange={setSearch}
          onStageChange={(newStage) => {
            setStage(newStage);
            setPage(1);
          }}
          onSortChange={(newSort, newOrder) => {
            setSort(newSort);
            setOrder(newOrder);
            setPage(1);
          }}
        />

        {/* Candidate List Table */}
        {loading && candidates.length === 0 ? (
          <LoadingState message="Loading candidates..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchCandidates} />
        ) : candidates.length === 0 ? (
          <EmptyState
            title={
              debouncedSearch || stage !== "ALL"
                ? "No matching candidates"
                : "No candidates yet"
            }
            description={
              debouncedSearch || stage !== "ALL"
                ? "Try adjusting your search query or stage filter."
                : "Add your first applicant or click 'Seed Demo Data' above to populate candidates."
            }
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
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => fetchCandidates()}
      />
    </MainLayout>
  );
}
