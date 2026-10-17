"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PipelineColumn } from "@/components/pipeline/PipelineColumn";
import { QuickAddModal } from "@/components/dashboard/QuickAddModal";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { HIRING_STAGES, HiringStage } from "@/constants/stages";
import { ICandidate } from "@/types/candidate";
import { Plus, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PipelinePage() {
  const { status } = useSession();
  const router = useRouter();

  const [candidates, setCandidates] = useState<ICandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/candidates?limit=100&sort=createdAt&order=desc");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load pipeline candidates");
      }
      setCandidates(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCandidates();
    }
  }, [status, router, fetchCandidates]);

  // Optimistic UI Stage Change with Server Persistence and Rollback
  const handleStageChange = async (candidateId: string, newStage: HiringStage) => {
    const candidateToMove = candidates.find((c) => c._id === candidateId);
    if (!candidateToMove || candidateToMove.stage === newStage) return;

    const previousStage = candidateToMove.stage;

    // 1. Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c._id === candidateId ? { ...c, stage: newStage } : c))
    );

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Server failed to persist stage change");
      }

      toast.success(
        `Moved ${candidateToMove.name} from ${previousStage} to ${newStage}`
      );
    } catch (err: any) {
      // 2. Rollback UI on failure
      setCandidates((prev) =>
        prev.map((c) =>
          c._id === candidateId ? { ...c, stage: previousStage } : c
        )
      );
      toast.error(err.message || "Stage change failed. Rolled back.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Hiring Pipeline
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Drag &amp; Drop Enabled
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Drag candidate cards between columns or use the dropdown selector to transition stages
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

        {/* Pipeline Board */}
        {loading && candidates.length === 0 ? (
          <LoadingState message="Loading pipeline columns..." fullPage />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchCandidates} />
        ) : (
          <div className="overflow-x-auto pb-6">
            <div className="flex gap-4 min-w-[1200px]">
              {HIRING_STAGES.map((stage) => {
                const stageCandidates = candidates.filter(
                  (c) => c.stage === stage
                );
                return (
                  <PipelineColumn
                    key={stage}
                    stage={stage}
                    candidates={stageCandidates}
                    onStageChange={handleStageChange}
                  />
                );
              })}
            </div>
          </div>
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
