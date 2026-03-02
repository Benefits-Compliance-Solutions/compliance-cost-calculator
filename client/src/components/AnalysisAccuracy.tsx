/*
 * AnalysisAccuracy Component
 * Displays a progress bar and contextual banner above the results panel
 * to encourage users to complete all input sections for a full analysis.
 * Uses BCS brand colors and corporate minimalist design.
 */

import { CheckCircle2, Circle, ChevronRight } from "lucide-react";

interface SectionsReviewed {
  basics: boolean;
  lostOpportunities: boolean;
  clientChurn: boolean;
  staffAndProductivity: boolean;
}

interface AnalysisAccuracyProps {
  sectionsReviewed: SectionsReviewed;
  completionPct: number;
}

const SECTION_LABELS: { key: keyof SectionsReviewed; label: string }[] = [
  { key: "basics", label: "Agency Profile" },
  { key: "lostOpportunities", label: "Revenue Opportunities" },
  { key: "clientChurn", label: "Client Churn" },
  { key: "staffAndProductivity", label: "Staff & Productivity" },
];

function getAccuracyLabel(pct: number): { label: string; color: string; bg: string; bar: string } {
  if (pct === 100) return { label: "Full Analysis", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", bar: "bg-emerald-500" };
  if (pct >= 75)  return { label: "Nearly Complete", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     bar: "bg-blue-500" };
  if (pct >= 50)  return { label: "Partial Estimate", color: "text-amber-700", bg: "bg-amber-50 border-amber-200",   bar: "bg-amber-500" };
  if (pct >= 25)  return { label: "Early Estimate",   color: "text-orange-700",bg: "bg-orange-50 border-orange-200", bar: "bg-orange-400" };
  return                 { label: "Not Started",       color: "text-muted-foreground", bg: "bg-muted/30 border-muted", bar: "bg-muted-foreground/30" };
}

export default function AnalysisAccuracy({ sectionsReviewed, completionPct }: AnalysisAccuracyProps) {
  const accuracy = getAccuracyLabel(completionPct);
  const isComplete = completionPct === 100;

  return (
    <div className={`rounded-xl border p-4 mb-4 transition-all duration-500 ${accuracy.bg}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${accuracy.color}`}>
          Analysis Accuracy
        </span>
        <span className={`text-sm font-bold tabular-nums ${accuracy.color}`}>
          {completionPct}%
          {!isComplete && (
            <span className="ml-1 font-normal text-xs opacity-70">— {accuracy.label}</span>
          )}
          {isComplete && (
            <span className="ml-1 font-normal text-xs opacity-70">— {accuracy.label}</span>
          )}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${accuracy.bar}`}
          style={{ width: `${completionPct}%` }}
        />
      </div>

      {/* Section checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
        {SECTION_LABELS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            {sectionsReviewed[key] ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
            )}
            <span className={sectionsReviewed[key] ? "text-foreground/80" : "text-muted-foreground"}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Contextual message */}
      {!isComplete && (
        <div className="flex items-start gap-1.5 pt-2 border-t border-black/10">
          <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-snug">
            Complete all sections on the left for a fully personalized estimate.
            Uncompleted sections use industry default values.
          </p>
        </div>
      )}

      {isComplete && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
          <p className="text-xs text-emerald-700 font-medium">
            All sections reviewed — this is your personalized analysis.
          </p>
        </div>
      )}
    </div>
  );
}
