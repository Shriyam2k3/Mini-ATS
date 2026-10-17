export const HIRING_STAGES = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
] as const;

export type HiringStage = (typeof HIRING_STAGES)[number];

export const STAGE_CONFIG: Record<
  HiringStage,
  {
    label: string;
    color: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    borderTop: string;
    description: string;
  }
> = {
  Applied: {
    label: "Applied",
    color: "#3B82F6",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
    borderTop: "border-t-blue-500",
    description: "New application received",
  },
  Screening: {
    label: "Screening",
    color: "#F59E0B",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    borderTop: "border-t-amber-500",
    description: "Initial profile & resume screening",
  },
  Interview: {
    label: "Interview",
    color: "#8B5CF6",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    borderTop: "border-t-purple-500",
    description: "Technical or HR interview in progress",
  },
  Offer: {
    label: "Offer",
    color: "#06B6D4",
    badgeBg: "bg-cyan-50",
    badgeText: "text-cyan-700",
    badgeBorder: "border-cyan-200",
    borderTop: "border-t-cyan-500",
    description: "Job offer extended to candidate",
  },
  Hired: {
    label: "Hired",
    color: "#10B981",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    borderTop: "border-t-emerald-500",
    description: "Candidate accepted and hired",
  },
  Rejected: {
    label: "Rejected",
    color: "#EF4444",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200",
    borderTop: "border-t-rose-500",
    description: "Not moving forward with candidate",
  },
};
