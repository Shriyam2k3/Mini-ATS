"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { JobForm } from "@/components/jobs/JobForm";
import { StageBadge } from "@/components/candidates/StageBadge";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { IJob } from "@/types/job";
import { ICandidate } from "@/types/candidate";
import {
  Briefcase,
  MapPin,
  Building,
  Users,
  Calendar,
  Edit3,
  Trash2,
  ArrowLeft,
  Mail,
  ExternalLink,
  Tag,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function JobDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [job, setJob] = useState<IJob | null>(null);
  const [candidates, setCandidates] = useState<ICandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchJobAndCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [jobRes, candRes] = await Promise.all([
        fetch(`/api/jobs/${id}`),
        fetch(`/api/candidates?jobId=${id}&limit=100`),
      ]);

      if (jobRes.status === 401) {
        router.push("/login");
        return;
      }

      const jobData = await jobRes.json();
      const candData = await candRes.json();

      if (!jobRes.ok) throw new Error(jobData.error || "Failed to load job");

      setJob(jobData.data);
      setCandidates(candData.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchJobAndCandidates();
  }, [fetchJobAndCandidates]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete job");

      toast.success(data.message || "Job deleted successfully");
      router.push("/jobs");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete job");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingState fullPage message="Loading job opening..." />
      </MainLayout>
    );
  }

  if (error || !job) {
    return (
      <MainLayout>
        <ErrorState
          title="Job Not Found"
          message={error || "Job opening could not be loaded."}
          onRetry={fetchJobAndCandidates}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Job Openings
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? "View Job" : "Edit Position"}
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100/70 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Job
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Edit Job Position
            </h2>
            <JobForm
              initialData={job}
              onSuccess={(updated) => {
                setJob(updated);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Job Summary Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {job.department}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        job.status === "Open"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 mt-1">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span>{job.employmentType}</span>
                    <span>•</span>
                    <span>{job.openings} Openings</span>
                    <span>•</span>
                    <span>Exp: {job.experienceRequirements}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[130px]">
                  <span className="text-2xl font-bold text-slate-900 block">
                    {candidates.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Associated Applicants
                  </span>
                </div>
              </div>

              {/* Skills */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700 block mb-2">
                    Required Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Role Overview
                </span>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Associated Candidates Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    Applicants for this Position ({candidates.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Candidates mapped to this requisition
                  </p>
                </div>
                <Link
                  href="/candidates"
                  className="text-xs font-semibold text-emerald-800 hover:underline"
                >
                  View in Directory
                </Link>
              </div>

              {candidates.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No candidates currently assigned to this job opening.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {candidates.map((c) => (
                    <div
                      key={c._id}
                      className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/candidates/${c._id}`}
                            className="font-bold text-slate-900 hover:text-emerald-800 transition-colors"
                          >
                            {c.name}
                          </Link>
                          <div className="flex items-center gap-2 text-slate-500 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{c.email}</span>
                            {c.currentCompany && <span>• {c.currentCompany}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <StageBadge stage={c.stage} />
                        <Link
                          href={`/candidates/${c._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Delete Job Opening
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-slate-800">
                      {job.title}
                    </span>
                    ? Existing candidates will remain in your system and be disassociated safely.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDelete(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
