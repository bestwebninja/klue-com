import {
  AlertTriangle, ArrowRight, Building2, ChevronDown, ChevronUp,
  CircleDollarSign, TrendingUp, Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Gap { gap: string; impact: string; remedy: string; }

interface FinancingReadiness {
  score: number;
  band: "ready" | "near_ready" | "needs_work" | "not_ready";
  gaps: Gap[];
}

interface LenderProduct {
  lenderType: string; productName: string; estimatedRateRange: string;
  maxLtv: string; typicalTerm: string; timeToClose: string; notes: string;
}

interface IndicativeTerms {
  loanAmountUsd: number; annualRatePercent: number; maxLtv: string;
  termLabel: string; monthlyPaymentUsd: number; reserveRequirementUsd: number;
}

interface Action { priority: "high" | "medium" | "low"; action: string; }

interface LendingOutput {
  financingReadiness: FinancingReadiness;
  lenderShortlist: LenderProduct[];
  indicativeTerms: IndicativeTerms | null;
  cashFlowAssessment: { estimatedMonthlyPayment: number | null; monthlyServiceabilityNote: string };
  recommendedActions: Action[];
  alertCreated: boolean;
}

const BAND_CONFIG = {
  ready:      { label: "Ready", barClass: "bg-emerald-400", textClass: "text-emerald-300", width: "100%" },
  near_ready: { label: "Near Ready", barClass: "bg-amber-400", textClass: "text-amber-300", width: "70%" },
  needs_work: { label: "Needs Work", barClass: "bg-orange-400", textClass: "text-orange-300", width: "40%" },
  not_ready:  { label: "Not Ready", barClass: "bg-rose-400", textClass: "text-rose-300", width: "15%" },
} as const;

const PRIORITY_DOT = { high: "bg-rose-400", medium: "bg-amber-400", low: "bg-emerald-400" } as const;

export function LendingCapitalCard({ output }: { output: LendingOutput }) {
  const [lendersOpen, setLendersOpen] = useState(true);
  const [gapsOpen, setGapsOpen] = useState(false);

  const readiness = output?.financingReadiness;
  const band = readiness?.band ?? "needs_work";
  const bandCfg = BAND_CONFIG[band];
  const score = readiness?.score ?? 0;
  const terms = output?.indicativeTerms;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-primary" />
            Lending & Capital
          </CardTitle>
          <span className={cn("text-[11px] rounded-full border px-2 py-0.5 font-medium",
            band === "ready"      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" :
            band === "near_ready" ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
            band === "needs_work" ? "border-orange-500/30 bg-orange-500/10 text-orange-300" :
                                    "border-rose-500/30 bg-rose-500/10 text-rose-300"
          )}>
            {bandCfg.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Readiness score bar */}
        {readiness && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Financing readiness</span>
              <span className={cn("font-bold", bandCfg.textClass)}>{score}/100</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted/30 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", bandCfg.barClass)}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        )}

        {/* Indicative terms summary */}
        {terms && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Rate", value: `${terms.annualRatePercent}%` },
              { label: "Max LTV", value: terms.maxLtv },
              { label: "Term", value: terms.termLabel },
              { label: "Est. payment", value: `$${terms.monthlyPaymentUsd.toLocaleString()}/mo` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-center">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reserve requirement callout */}
        {terms?.reserveRequirementUsd && (
          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-primary/60" />
            Lenders typically require ${terms.reserveRequirementUsd.toLocaleString()} in cash reserves (6 months PITIA)
          </div>
        )}

        {/* Cash flow note */}
        {output?.cashFlowAssessment?.monthlyServiceabilityNote && (
          <p className="text-xs text-muted-foreground/70 italic px-1">
            {output.cashFlowAssessment.monthlyServiceabilityNote}
          </p>
        )}

        {/* Lender shortlist */}
        {(output?.lenderShortlist?.length ?? 0) > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setLendersOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {output.lenderShortlist.length} matched lender product{output.lenderShortlist.length !== 1 ? "s" : ""}
              </span>
              {lendersOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {lendersOpen && (
              <div className="mt-1.5 space-y-2">
                {output.lenderShortlist.map((l, i) => (
                  <div key={i} className="rounded-lg border border-border/40 bg-card/40 px-3 py-2.5 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground/90">{l.productName}</p>
                        <p className="text-muted-foreground/70">{l.lenderType}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-primary">{l.estimatedRateRange}</p>
                        <p className="text-muted-foreground/60">{l.maxLtv} LTV</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground/60">
                      <span>{l.typicalTerm}</span>
                      <span>·</span>
                      <span>{l.timeToClose}</span>
                    </div>
                    <p className="text-muted-foreground/60 leading-relaxed">{l.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Readiness gaps */}
        {(readiness?.gaps?.length ?? 0) > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setGapsOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {readiness!.gaps.length} gap{readiness!.gaps.length !== 1 ? "s" : ""} to close
              </span>
              {gapsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {gapsOpen && (
              <div className="mt-1.5 space-y-1.5">
                {readiness!.gaps.map((g, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs">
                    <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-400" />
                    <div>
                      <p className="font-medium text-foreground/90">{g.gap}</p>
                      <p className="text-muted-foreground/60 mt-0.5">{g.remedy}</p>
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
