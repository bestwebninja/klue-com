import {
  AlertTriangle, CalendarDays, CheckCircle2, ChevronDown, ChevronUp,
  DollarSign, TrendingDown, Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Phase {
  phase: string; startWeek: number; durationWeeks: number;
  costUsd: number | null; criticalPath: boolean; estimatedStartDate: string;
}

interface CashFlow {
  hasCashFlowGap: boolean;
  cashFlowGapSeverity: "low" | "moderate" | "high";
  peakNegativeWeek: number;
  peakNegativeAmountUsd: number;
  weeklyProjections: Array<{ week: number; inflow: number; outflow: number; cumulativeBalance: number }>;
}

interface Risk {
  type: string; probability: number; impact: string; mitigation: string;
}

interface Action {
  priority: "high" | "medium" | "low"; action: string; timing: string;
}

interface RenovationOutput {
  projectSummary: { tradeType: string; scopeDescription: string; estimatedBudgetUsd: number | null; startDate: string };
  timeline: { phases: Phase[]; totalWeeks: number; estimatedCompletionDate: string };
  cashFlow: CashFlow;
  risks: Risk[];
  recommendedActions: Action[];
  weatherSummary: string | null;
  lendingNudge: boolean;
}

const GAP_SEVERITY = {
  high:     { label: "High Gap", classes: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  moderate: { label: "Moderate Gap", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  low:      { label: "Minimal Gap", classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
} as const;

const PRIORITY_DOT = { high: "bg-rose-400", medium: "bg-amber-400", low: "bg-emerald-400" } as const;

export function RenovationWorkflowCard({ output }: { output: RenovationOutput }) {
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [cashflowOpen, setCashflowOpen] = useState(false);
  const [risksOpen, setRisksOpen] = useState(false);

  const { projectSummary, timeline, cashFlow, risks, recommendedActions, weatherSummary, lendingNudge } = output;
  const budget = projectSummary?.estimatedBudgetUsd;
  const gapSev = cashFlow?.cashFlowGapSeverity ?? "low";

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Renovation Workflow
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {timeline?.totalWeeks && (
              <span className="text-[11px] rounded-full border border-border/50 bg-card/60 px-2 py-0.5 text-muted-foreground">
                {timeline.totalWeeks}w · ends {timeline.estimatedCompletionDate}
              </span>
            )}
            {budget && (
              <span className="text-[11px] rounded-full border border-border/50 bg-card/60 px-2 py-0.5 text-muted-foreground">
                ${(budget / 1000).toFixed(0)}k budget
              </span>
            )}
          </div>
        </div>
        {projectSummary?.scopeDescription && (
          <p className="text-xs text-muted-foreground mt-1">{projectSummary.scopeDescription}</p>
        )}
        {weatherSummary && (
          <p className="text-xs text-muted-foreground/70 italic">{weatherSummary}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">

        {/* Cash flow summary */}
        {cashFlow && (
          <div className={cn(
            "flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5",
            GAP_SEVERITY[gapSev].classes
          )}>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-xs font-semibold">
                  {cashFlow.hasCashFlowGap
                    ? `Cash-flow gap · Week ${cashFlow.peakNegativeWeek}: $${Math.abs(cashFlow.peakNegativeAmountUsd).toLocaleString()}`
                    : "Cash flow looks healthy"}
                </p>
                {lendingNudge && (
                  <p className="text-[11px] opacity-80 mt-0.5">Lending Capital AI can help bridge this gap.</p>
                )}
              </div>
            </div>
            <span className={cn("shrink-0 text-[11px] rounded-full border px-2 py-0.5 font-medium", GAP_SEVERITY[gapSev].classes)}>
              {GAP_SEVERITY[gapSev].label}
            </span>
          </div>
        )}

        {/* Timeline phases */}
        {timeline?.phases?.length > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setTimelineOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Timeline · {timeline.phases.length} phases
              </span>
              {timelineOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {timelineOpen && (
              <div className="space-y-1.5 mt-1">
                {timeline.phases.map((phase, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs">
                    <span className="w-5 text-right text-muted-foreground/50 shrink-0">W{phase.startWeek}</span>
                    <div
                      className={cn(
                        "h-1.5 rounded-full shrink-0",
                        phase.criticalPath ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                      style={{ width: `${Math.max(phase.durationWeeks * 14, 8)}px` }}
                    />
                    <span className="text-foreground/80 truncate">{phase.phase}</span>
                    {phase.costUsd && (
                      <span className="ml-auto shrink-0 text-muted-foreground/60">
                        ${(phase.costUsd / 1000).toFixed(0)}k
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cash flow chart — simplified weekly bar */}
        {cashFlow?.weeklyProjections?.length > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setCashflowOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Weekly cash flow ({cashFlow.weeklyProjections.length} weeks)
              </span>
              {cashflowOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {cashflowOpen && (
              <div className="mt-2 space-y-1">
                {cashFlow.weeklyProjections.slice(0, 20).map((w) => {
                  const isNegative = w.cumulativeBalance < 0;
                  return (
                    <div key={w.week} className="flex items-center gap-2 text-[11px]">
                      <span className="w-8 text-right text-muted-foreground/50 shrink-0">W{w.week}</span>
                      <div className="flex-1 h-3 rounded bg-muted/30 overflow-hidden">
                        <div
                          className={cn("h-full rounded", isNegative ? "bg-rose-500/60" : "bg-emerald-500/50")}
                          style={{
                            width: `${Math.min(
                              Math.abs(w.cumulativeBalance) /
                              Math.max(...cashFlow.weeklyProjections.map((p) => Math.abs(p.cumulativeBalance)), 1) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className={cn("w-20 text-right shrink-0", isNegative ? "text-rose-400" : "text-emerald-400")}>
                        {w.cumulativeBalance >= 0 ? "+" : ""}${(w.cumulativeBalance / 1000).toFixed(1)}k
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Risks */}
        {risks?.length > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setRisksOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {risks.length} project risks
              </span>
              {risksOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {risksOpen && (
              <div className="space-y-1.5 mt-1">
                {risks.map((r, i) => (
                  <div key={i} className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{r.type}</span>
                      <span className="text-muted-foreground/70">{Math.round(r.probability * 100)}%</span>
                    </div>
                    <p className="text-muted-foreground/70">{r.mitigation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {recommendedActions?.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-border/30">
            <p className="text-[11px] font-medium text-foreground/60 flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" /> Next actions
            </p>
            {recommendedActions.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", PRIORITY_DOT[a.priority])} />
                <span className="text-foreground/80">{a.action}</span>
                {a.timing && <span className="ml-auto shrink-0 text-muted-foreground/50">{a.timing}</span>}
              </div>
            ))}
          </div>
        )}

        {lendingNudge && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-xs text-amber-300">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Ask Kluje: "Find financing options for this project" to route to Lending Capital AI
          </div>
        )}
      </CardContent>
    </Card>
  );
}
