"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    label: "Hiring Pipeline",
    href: "/pipeline",
    icon: Kanban,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-white border-r border-slate-200">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 pt-2 px-2 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black shadow-md shadow-emerald-800/20">
              EJ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">
                  EarlyJobs<span className="text-emerald-700">.ai</span>
                </span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Mini ATS Recruiter
              </p>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-800 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-800"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-emerald-700"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Badge */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>Production Ready</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
          Next.js App Router, Auth.js & MongoDB Atlas persistence.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 h-full bg-white z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
