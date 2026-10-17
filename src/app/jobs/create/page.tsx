"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { JobForm } from "@/components/jobs/JobForm";
import { ArrowLeft, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateJobPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Job Openings
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create New Job Position
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define requirements, skills, department, and openings
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <JobForm onCancel={() => router.push("/jobs")} />
        </div>
      </div>
    </MainLayout>
  );
}
