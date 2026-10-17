"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const { name, email, image, role } = session.user;
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
      >
        {image ? (
          <Image
            src={image}
            alt={name || "User Avatar"}
            width={34}
            height={34}
            className="rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
            {initial}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in text-sm">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-900 truncate">
              {name || "Recruiter"}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Shield className="w-3 h-3 text-emerald-700" />
              <span>{role || "RECRUITER"}</span>
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Settings & Profile
            </Link>
          </div>

          {/* Sign out */}
          <div className="pt-1 border-t border-slate-100">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
