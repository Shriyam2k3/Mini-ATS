"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CsvImportModal({
  isOpen,
  onClose,
  onSuccess,
}: CsvImportModalProps) {
  const [csvText, setCsvText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    totalRows: number;
    validCount: number;
    errorCount: number;
    errors: { row: number; email: string; error: string }[];
    preview: any[];
  } | null>(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const template =
      "name,email,phone,jobRole,stage,currentCompany,currentDesignation,yearsOfExperience,skills,source,resumeUrl\n" +
      'Jane Smith,jane.smith@example.com,+1 555-0192,Full Stack Engineer,Applied,Acme Corp,Senior Developer,4,"React, Node.js, TypeScript",LinkedIn,https://example.com/resume.pdf\n' +
      'David Miller,david.m@example.com,+1 555-0193,Frontend Specialist,Screening,TechNova,UI Engineer,2,"Next.js, Tailwind, Vue",Referral,https://example.com/david.pdf';

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidates-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Import template downloaded!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseAndPreview(text);
    };
    reader.readAsText(file);
  };

  const parseCsvIntoObjects = (text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const objects: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Regex handling quoted CSV values containing commas
      const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      const rawValues = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const values = matches ? matches.map((m) => m.replace(/^"|"$/g, "").trim()) : rawValues;

      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || "";
      });

      if (obj.name && obj.email) {
        if (!obj.stage) obj.stage = "Applied";
        if (obj.yearsOfExperience) {
          obj.yearsOfExperience = Number(obj.yearsOfExperience) || 0;
        }
        objects.push(obj);
      }
    }

    return objects;
  };

  const parseAndPreview = async (textToParse: string) => {
    const parsed = parseCsvIntoObjects(textToParse);
    if (parsed.length === 0) {
      toast.error("No valid candidate rows detected in CSV");
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch("/api/candidates/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: parsed,
          dryRun: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setAnalysisResult(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze CSV");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCommitImport = async () => {
    const parsed = parseCsvIntoObjects(csvText);
    if (parsed.length === 0) return;

    setImporting(true);
    try {
      const res = await fetch("/api/candidates/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: parsed,
          dryRun: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      toast.success(data.message || "Candidates imported successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to import candidates");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bulk Import Candidates from CSV
              </h3>
              <p className="text-xs text-slate-500">
                Pre-validate rows, avoid duplicates, and review before adding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100/70 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Sample CSV Template
          </button>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Upload .CSV File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Text Area for manual paste */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Or paste CSV raw content:
          </label>
          <textarea
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setAnalysisResult(null);
            }}
            placeholder="name,email,phone,jobRole,stage..."
            rows={4}
            className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
          />
          {csvText && !analysisResult && (
            <button
              onClick={() => parseAndPreview(csvText)}
              disabled={analyzing}
              className="mt-2 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 transition-colors inline-flex items-center gap-1.5"
            >
              {analyzing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Analyze &amp; Validate CSV
            </button>
          )}
        </div>

        {/* Analysis & Validation Results */}
        {analysisResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-500 block">Total Rows</span>
                <span className="text-lg font-bold text-slate-800">
                  {analysisResult.totalRows}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[11px] text-emerald-700 block">Valid Rows</span>
                <span className="text-lg font-bold text-emerald-800">
                  {analysisResult.validCount}
                </span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-[11px] text-rose-700 block">Invalid / Duplicate</span>
                <span className="text-lg font-bold text-rose-800">
                  {analysisResult.errorCount}
                </span>
              </div>
            </div>

            {/* Error List */}
            {analysisResult.errors.length > 0 && (
              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl max-h-36 overflow-y-auto">
                <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Row Validation Errors ({analysisResult.errors.length})
                </h4>
                <div className="space-y-1.5 text-[11px] text-rose-800">
                  {analysisResult.errors.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="font-semibold">Row {err.row}:</span>
                      <span>{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview of Valid Records */}
            {analysisResult.preview.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">
                  Valid Records Preview (First {analysisResult.preview.length}):
                </div>
                <div className="divide-y divide-slate-100">
                  {analysisResult.preview.map((p, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 flex items-center justify-between text-slate-600"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{p.name}</span>{" "}
                        <span className="text-slate-400">({p.email})</span>
                      </div>
                      <span className="text-emerald-700 font-medium">{p.jobRole}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommitImport}
            disabled={
              importing ||
              !analysisResult ||
              analysisResult.validCount === 0
            }
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm transition-all disabled:opacity-40"
          >
            {importing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>
              {importing
                ? "Writing to Database..."
                : `Confirm & Import (${analysisResult?.validCount || 0} Records)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
