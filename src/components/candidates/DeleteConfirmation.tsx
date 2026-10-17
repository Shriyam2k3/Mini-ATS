"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  candidateName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmation({
  isOpen,
  candidateName,
  onClose,
  onConfirm,
}: DeleteConfirmationProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Handled in caller
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Delete Candidate
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">
                {candidateName}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
}
