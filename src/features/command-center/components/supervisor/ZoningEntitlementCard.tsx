import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  CircleHelp, ClipboardList, ShieldCheck, Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChecklistItem {
  item: string; status: "pass" | "fail" | "unknown"; notes: string;
}

interface PermitRisk {
  risk: string; severity: "critical" | "major" | "minor"; mitigation: string;
}

interface Action {
  priority: "high" | "medium" | "low"; action: string;
}

interface ZoningOutput {
  approvalProbabilityPercent: number;
  estimatedReviewDays: number;
  confidenceLevel: "high" | "medium" | "low";
  complianceChecklist: ChecklistItem[];
  permitRisks: PermitRisk[];
  entitlementPath: string;
  recommendedActions: Action[];
  alertCreated: boolean;
}

const PROB_CONFIG = {
  high:     { min: 75, ringClass: "stroke-emerald-400", labelClass: "text-emerald-300" },
  moderate: { min: 55, ringClass: "stroke-amber-400",   labelClass: "text-amber-300" },
  low:      { min: 0,  ringClass: "stroke-rose-400",    labelClass: "text-rose-300" },
} as const;

const STATUS_ICON = {
  pass:    { Icon: CheckCircle2, cls: "text-emerald-400" },
  fail:    { Icon: AlertTriangle, cls: "text-rose-400" },
  unknown: { Icon: CircleHelp, cls: "text-muted-foreground/50" },
} as const;

const SEVERITY_BADGE = {
  critical: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  major:    "bg-amber-500/15 text-amber-400 border-amber-500/30",
  minor:    "bg-slate-500/15 text-slate-300 border-slate-500/30",
} as const;

const PRIORITY_DOT = { high: "bg-rose-400", medium: "bg-amber-400", low: "bg-emerald-400" } as const;

export function ZoningEntitlementCard({ output }: { output: ZoningOutput }) {
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [risksOpen, setRisksOpen] = useState(false);

  const prob = output?.approvalProbabilityPercent ?? 0;
  const probTier = prob >= 75 ? "high" : prob >= 55 ? "moderate" : "low";
  const probCfg = PROB_CONFIG[probTier];

  // SVG donut ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (prob / 100) * circumference;

  const passingItems = (output?.complianceChecklist ?? []).filter((c) => c.status === "pass").length;
  const totalItems = (output?.complianceChecklist ?? []).length;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Zoning & Entitlement
          </CardTitle>
          {output?.confidenceLevel && (
            <span className="text-[11px] rounded-full border border-border/50 bg-card/60 px-2 py-0.5 text-muted-foreground">
              {output.confidenceLevel} confidence
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Approval probability donut + stats */}
        <div className="flex items-center gap-5">
          {/* Donut */}
          <div className="relative shrink-0">
            <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
              <circle cx="36" cy="36" r={radius} fill="none" strokeWidth="7"
                className="stroke-muted/30" />
              <circle cx="36" cy="36" r={radius} fill="none" strokeWidth="7"
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                className={cn("transition-all duration-700", probCfg.ringClass)} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-lg font-bold leading-none", probCfg.labelClass)}>{prob}%</span>
              <span className="text-[9px] text-muted-foreground leading-none mt-0.5">approval</span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 flex-1">
            <div>
              <p className="text-xs text-muted-foreground">Estimated review</p>
              <p className="text-sm font-semibold">{output?.estimatedReviewDays ?? "—"} days</p>
            </div>
            {output?.entitlementPath && (
              <div>
                <p className="text-xs text-muted-foreground">Path</p>
                <p className="text-xs font-medium text-foreground/80">{output.entitlementPath}</p>
              </div>
            )}
            {totalItems > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Checklist</p>
                <p className="text-sm font-semibold">
                  <span className="text-emerald-400">{passingItems}</span>
                  <span className="text-muted-foreground">/{totalItems} passing</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Compliance checklist */}
        {(output?.complianceChecklist?.length ?? 0) > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setChecklistOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" />
                Compliance checklist ({totalItems} items)
              </span>
              {checklistOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {checklistOpen && (
              <div className="mt-1.5 space-y-1">
                {output.complianceChecklist.map((item, i) => {
                  const cfg = STATUS_ICON[item.status] ?? STATUS_ICON.unknown;
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs rounded-lg border border-border/30 bg-card/30 px-3 py-1.5">
                      <cfg.Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", cfg.cls)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground/90 truncate">{item.item}</p>
                        {item.notes && <p className="text-muted-foreground/60 text-[11px]">{item.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Permit risks */}
        {(output?.permitRisks?.length ?? 0) > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setRisksOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {output.permitRisks.length} permit risk{output.permitRisks.length !== 1 ? "s" : ""}
              </span>
              {risksOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {risksOpen && (
              <div className="mt-1.5 space-y-1.5">
                {output.permitRisks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-xs">
                    <span className={cn("mt-0.5 shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", SEVERITY_BADGE[r.severity])}>
                      {r.severity}
                    </span>
                    <div>
                      <p className="font-medium">{r.risk}</p>
                      <p className="text-muted-foreground/70 mt-0.5">{r.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {(output?.recommendedActions?.length ?? 0) > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-border/30">
            <p className="text-[11px] font-medium text-foreground/60 flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" /> Next actions
            </p>
            {output.recommendedActions.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", PRIORITY_DOT[a.priority])} />
                <span className="text-foreground/80">{a.action}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
