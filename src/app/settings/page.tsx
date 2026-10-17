"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  User,
  Mail,
  Shield,
  KeyRound,
  LogOut,
  Server,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const user = session?.user;
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <MainLayout>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Account &amp; System Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authenticated session details and role security overview
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-800" />
            Recruiter Profile Information
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={80}
                height={80}
                className="rounded-2xl border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-emerald-800 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-emerald-800/20">
                {initial}
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {user?.name || "ATS Recruiter"}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  Role: {user?.role || "RECRUITER"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Role Governance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-800" />
            Security &amp; Role Enforcement Policy
          </h2>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-semibold text-slate-800">
                • Server-Side Role Integrity:
              </p>
              <p>
                Role permissions are strictly validated on every Next.js API Route Handler and server component. Roles cannot be modified through client requests or user profiles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-semibold text-slate-800">
                • Safe Admin Provisioning:
              </p>
              <p>
                To promote a user to <strong>ADMIN</strong> or bootstrap an admin account, use the protected server endpoint:
              </p>
              <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
{`POST /api/admin/provision
Headers: { "x-admin-secret": "YOUR_ADMIN_PROVISION_SECRET" }
Body: { "email": "admin@earlyjobs.ai", "action": "promote" }`}
              </pre>
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-800" />
            Active Session Diagnostics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-1">User Identifier (Sub / ID)</span>
              <span className="font-mono text-slate-800 font-semibold truncate block">
                {user?.id || "N/A"}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block mb-1">Session Strategy</span>
              <span className="font-medium text-slate-800">
                JWT (Signed &amp; Encrypted with AUTH_SECRET)
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Session
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
