"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ICandidateActivity } from "@/types/activity";
import { formatDateTime } from "@/lib/utils";
import {
  Clock,
  Send,
  UserCheck,
  Calendar,
  MessageSquare,
  Award,
  XCircle,
  FileEdit,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ActivityTimelineProps {
  candidateId: string;
}

export function ActivityTimeline({ candidateId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ICandidateActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [isPostingNote, setIsPostingNote] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/candidates/${candidateId}/activity`);
      const data = await res.json();
      if (res.ok) {
        setActivities(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load activity timeline", err);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsPostingNote(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post note");

      toast.success("Recruiter note added to timeline");
      setNoteText("");
      fetchActivities();
    } catch (err: any) {
      toast.error(err.message || "Failed to add note");
    } finally {
      setIsPostingNote(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CREATED":
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case "STAGE_CHANGED":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "INTERVIEW_SCHEDULED":
      case "INTERVIEW_STATUS":
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case "NOTE_ADDED":
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case "HIRED":
        return <Award className="w-4 h-4 text-emerald-700" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <FileEdit className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Recruiter Note Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-700" />
          Add Recruiter Note
        </h3>
        <form onSubmit={handlePostNote} className="space-y-3">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type observations, interview feedback, or screening notes..."
            rows={3}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPostingNote || !noteText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isPostingNote ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Post Note</span>
            </button>
          </div>
        </form>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-700" />
          Candidate Activity &amp; Audit Timeline
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-700 mb-2" />
            Loading activity timeline...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No activity events recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activities.map((act) => (
              <div key={act._id} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                  {getActivityIcon(act.type)}
                </div>

                <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-slate-800">
                      {act.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(act.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {act.description}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    <span>Actor: {act.actorName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
