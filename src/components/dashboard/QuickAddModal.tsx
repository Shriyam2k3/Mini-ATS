"use client";

import React from "react";
import { CandidateForm } from "../candidates/CandidateForm";
import { X, UserPlus } from "lucide-react";
import { ICandidate } from "@/types/candidate";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidate: ICandidate) => void;
}

export function QuickAddModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickAddModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Add New Candidate
              </h3>
              <p className="text-xs text-slate-500">
                Enter candidate profile to track in ATS pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CandidateForm
          onSuccess={(candidate) => {
            onSuccess(candidate);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
