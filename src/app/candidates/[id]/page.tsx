"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { CandidateDetails } from "@/components/candidates/CandidateDetails";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ICandidate } from "@/types/candidate";
import { useSession } from "next-auth/react";

export default function CandidateDetailPage() {
  const { id } = useParams() as { id: string };
  const { status } = useSession();
  const router = useRouter();

  const [candidate, setCandidate] = useState<ICandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/candidates/${id}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load candidate details");
      }
      setCandidate(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch candidate");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && id) {
      fetchCandidate();
    }
  }, [status, id, router, fetchCandidate]);

  return (
    <MainLayout>
      {loading ? (
        <LoadingState fullPage message="Loading candidate profile..." />
      ) : error || !candidate ? (
        <ErrorState
          title="Candidate Profile Not Found"
          message={error || "The requested candidate could not be found."}
          onRetry={fetchCandidate}
        />
      ) : (
        <CandidateDetails candidate={candidate} onRefresh={fetchCandidate} />
      )}
    </MainLayout>
  );
}
