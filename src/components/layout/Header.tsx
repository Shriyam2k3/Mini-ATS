"use client";

import React, { useState } from "react";
import { UserMenu } from "../auth/UserMenu";
import { Menu, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/candidates/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed data");

      toast.success(data.message || "Sample candidate data seeded!");
      router.refresh();
      // Also reload current window to refresh dashboard charts if on dashboard
      window.dispatchEvent(new CustomEvent("refresh-ats-data"));
    } catch (err: any) {
      toast.error(err.message || "Failed to seed sample candidates");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-medium text-slate-400">
            Recruitment Workspace
          </span>
          <h2 className="text-sm font-bold text-slate-800">
            EarlyJobs.ai Hiring Portal
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Demo Seed Button */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          title="Seed realistic candidates across all stages for demo/testing"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100/70 transition-colors disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Database className="w-3.5 h-3.5" />
          )}
          <span>{seeding ? "Seeding..." : "Seed Demo Data"}</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        <UserMenu />
      </div>
    </header>
  );
}
