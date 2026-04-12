import {
  ChevronDown, ChevronUp, DollarSign, Hammer,
  BarChart3, TrendingUp, Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineItem {
  category: "Material" | "Labor" | "Other";
  item: string;
  estimatedQty: string;
  unitCostRange: string;
  totalLow: number;
  totalHigh: number;
}

interface Estimate {
  totalLow: number;
  totalHigh: number;
  midpointUsd: number;
  confidencePercent: number;
  lineItems: LineItem[];
  materialCostUsd: number;
  laborCostUsd: number;
  laborPercent: number;
}

interface MarginAnalysis {
  recommendedMarginPercent: number;
  recommendedBidUsd: number;
  estimatedProfitUsd: number;
  breakEvenCostUsd: number;
}

interface Competitiveness {
  marketMedianUsd: number | null;
  bidPercentile: number | null;
  winProbabilityPercent: number | null;
  recommendation: string;
}

interface Action { priority: "high" | "medium" | "low"; action: string; }

interface ProjectSummary {
  tradeType: string;
  scopeDescription: string;
  squareFootage: number | null;
  zipCode: string | null;
  city: string | null;
  state: string | null;
}

interface BidEstimatorOutput {
  projectSummary: ProjectSummary;
  estimate: Estimate;
  marginAnalysis: MarginAnalysis;
  competitiveness: Competitiveness;
  recommendedActions: Action[];
}

const CATEGORY_COLORS = {
  Material: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Labor: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Other: "bg-slate-500/15 text-slate-300 border-slate-500/30",
} as const;

const PRIORITY_DOT = { high: "bg-rose-400", medium: "bg-amber-400", low: "bg-emerald-400" } as const;

function WinProbabilityGauge({ value }: { value: number }) {
  const color = value >= 65 ? "text-emerald-300" : value >= 45 ? "text-amber-300" : "text-rose-300";
  const barColor = value >= 65 ? "bg-emerald-400" : value >= 45 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Win probability</span>
        <span className={cn("font-bold text-sm", color)}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function BidEstimatorCard({ output }: { output: BidEstimatorOutput }) {
  const [lineItemsOpen, setLineItemsOpen] = useState(true);
  const [marginOpen, setMarginOpen] = useState(true);

  const est = output?.estimate;
  const margin = output?.marginAnalysis;
  const comp = output?.competitiveness;
  const project = output?.projectSummary;

  const location = project?.city && project?.state
    ? `${project.city}, ${project.state}`
    : project?.zipCode ?? null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Hammer className="h-4 w-4 text-primary" />
            Bid & Estimate
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {project?.tradeType && (
              <span className="text-[11px] rounded-full border border-border/50 bg-card/60 px-2 py-0.5 text-muted-foreground capitalize">
                {project.tradeType.replace(/_/g, " ")}
              </span>
            )}
            {location && (
              <span className="text-[11px] rounded-full border border-border/50 bg-card/60 px-2 py-0.5 text-muted-foreground">
                {location}
              </span>
            )}
          </div>
        </div>
        {project?.scopeDescription && (
          <p className="text-xs text-muted-foreground mt-1">{project.scopeDescription}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Total estimate hero */}
        {est && (
          <div className="rounded-xl border border-primary/20 bg-primary/8 px-4 py-3">
            <p className="text-[11px] text-muted-foreground mb-1">Estimated project cost</p>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-foreground">
                ${est.totalLow.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-sm mb-0.5">–</span>
              <span className="text-2xl font-bold text-foreground">
                ${est.totalHigh.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>Midpoint: <span className="text-foreground font-medium">${est.midpointUsd.toLocaleString()}</span></span>
              <span>·</span>
              <span>Confidence: <span className="text-primary font-medium">{est.confidencePercent}%</span></span>
              {project?.squareFootage && (
                <>
                  <span>·</span>
                  <span>{project.squareFootage.toLocaleString()} sqft</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Material vs Labor split */}
        {est && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-center">
              <p className="text-[11px] text-muted-foreground">Materials</p>
              <p className="text-sm font-semibold">${est.materialCostUsd.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground/60">{100 - est.laborPercent}% of cost</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-center">
              <p className="text-[11px] text-muted-foreground">Labor</p>
              <p className="text-sm font-semibold">${est.laborCostUsd.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground/60">{est.laborPercent}% of cost</p>
            </div>
          </div>
        )}

        {/* Win probability + market comparison */}
        {comp && comp.winProbabilityPercent != null && (
          <div className="space-y-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2.5">
            <WinProbabilityGauge value={comp.winProbabilityPercent} />
            {comp.marketMedianUsd && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Market median</span>
                <span className="font-medium">${comp.marketMedianUsd.toLocaleString()}</span>
              </div>
            )}
            {comp.recommendation && (
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic">
                {comp.recommendation}
              </p>
            )}
          </div>
        )}

        {/* Margin analysis */}
        {margin && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setMarginOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Margin analysis
              </span>
              {marginOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {marginOpen && (
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {[
                  { label: "Recommended bid", value: `$${margin.recommendedBidUsd.toLocaleString()}` },
                  { label: "Margin", value: `${margin.recommendedMarginPercent}%` },
                  { label: "Est. profit", value: `$${margin.estimatedProfitUsd.toLocaleString()}` },
                  { label: "Break-even", value: `$${margin.breakEvenCostUsd.toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-center">
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Line items */}
        {(est?.lineItems?.length ?? 0) > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setLineItemsOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Line items ({est!.lineItems.length})
              </span>
              {lineItemsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {lineItemsOpen && (
              <div className="mt-1.5 space-y-1">
                {est!.lineItems.map((li, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs rounded-lg border border-border/30 bg-card/30 px-3 py-2">
                    <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", CATEGORY_COLORS[li.category])}>
                      {li.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground/90">{li.item}</p>
                      <p className="text-muted-foreground/60 text-[11px]">{li.estimatedQty} · {li.unitCostRange}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-muted-foreground/80">${li.totalLow.toLocaleString()}–${li.totalHigh.toLocaleString()}</p>
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
