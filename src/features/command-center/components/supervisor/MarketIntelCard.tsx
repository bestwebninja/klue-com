import {
  ChevronDown, ChevronUp, MapPin, TrendingUp,
  Users, Zap, BarChart3,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SeasonalMonth { month: string; demandIndex: number; }
interface Action { priority: "high" | "medium" | "low"; action: string; }

interface MarketIntelOutput {
  market: { zipCode: string; city: string; state: string; tradeType: string };
  opportunityScore: number;
  opportunityTier: "high" | "moderate" | "low";
  demandLevel: string;
  competitorCount: number;
  competitorDensity: "low" | "moderate" | "high";
  avgJobValueUsd: number;
  annualMarketSizeUsd: number;
  permitPullTrend: string;
  permitPullCount30d: number;
  seasonalDemand: SeasonalMonth[];
  marketInsights: string[];
  recommendedActions: Action[];
  alertCreated: boolean;
}

const OPPORTUNITY_CONFIG = {
  high:     { label: "High Opportunity", barClass: "bg-emerald-400", textClass: "text-emerald-300", badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  moderate: { label: "Moderate",         barClass: "bg-amber-400",   textClass: "text-amber-300",   badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  low:      { label: "Low Opportunity",  barClass: "bg-rose-400",    textClass: "text-rose-300",    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
} as const;

const DENSITY_CONFIG = {
  low:      { label: "Low Competition",  classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  moderate: { label: "Moderate",         classes: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  high:     { label: "High Competition", classes: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
} as const;

const PRIORITY_DOT = { high: "bg-rose-400", medium: "bg-amber-400", low: "bg-emerald-400" } as const;

function SeasonalChart({ data }: { data: SeasonalMonth[] }) {
  const max = Math.max(...data.map((d) => d.demandIndex), 1);
  const currentMonth = new Date().getMonth();
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((d, i) => {
        const heightPct = (d.demandIndex / max) * 100;
        const isNow = i === currentMonth;
        return (
          <div key={d.month} className="flex flex-col items-center flex-1 gap-0.5">
            <div
              className={cn(
                "w-full rounded-sm transition-all",
                isNow ? "bg-primary" : "bg-primary/25"
              )}
              style={{ height: `${heightPct}%` }}
            />
            <span className={cn("text-[8px] font-medium", isNow ? "text-primary" : "text-muted-foreground/40")}>
              {d.month.slice(0, 1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function MarketIntelCard({ output }: { output: MarketIntelOutput }) {
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [seasonalOpen, setSeasonalOpen] = useState(false);

  const tier = output?.opportunityTier ?? "moderate";
  const tierCfg = OPPORTUNITY_CONFIG[tier];
  const score = output?.opportunityScore ?? 0;
  const density = output?.competitorDensity ?? "moderate";
  const densityCfg = DENSITY_CONFIG[density];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Market Intelligence
          </CardTitle>
          <span className={cn("text-[11px] rounded-full border px-2 py-0.5 font-medium", tierCfg.badgeClass)}>
            {tierCfg.label}
          </span>
        </div>
        {output?.market && (
          <p className="text-xs text-muted-foreground mt-1">
            {output.market.city}, {output.market.state} · {output.market.tradeType.replace(/_/g, " ")}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Opportunity score bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Opportunity score</span>
            <span className={cn("font-bold text-base", tierCfg.textClass)}>{score}/100</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted/30 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", tierCfg.barClass)}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Avg job value", value: `$${(output?.avgJobValueUsd ?? 0).toLocaleString()}` },
            { label: "Market size / yr", value: output?.annualMarketSizeUsd ? `$${((output.annualMarketSizeUsd) / 1_000_000).toFixed(1)}M` : "—" },
            { label: "Permit pulls / 30d", value: String(output?.permitPullCount30d ?? "—") },
            { label: "Permit trend", value: output?.permitPullTrend === "increasing" ? "↑ Rising" : "→ Stable" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-center">
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Competitor density */}
        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {output?.competitorCount ?? "—"} competitors in trade
          </span>
          <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", densityCfg.classes)}>
            {densityCfg.label}
          </span>
        </div>

        {/* Market insights */}
        {(output?.marketInsights?.length ?? 0) > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setInsightsOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Market insights ({output.marketInsights.length})
              </span>
              {insightsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {insightsOpen && (
              <div className="mt-1.5 space-y-1.5">
                {output.marketInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs rounded-lg border border-border/30 bg-card/30 px-3 py-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                    <p className="text-foreground/80 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seasonal demand chart */}
        {(output?.seasonalDemand?.length ?? 0) > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setSeasonalOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Seasonal demand
              </span>
              {seasonalOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {seasonalOpen && (
              <div className="mt-2 px-1">
                <SeasonalChart data={output.seasonalDemand} />
                <p className="text-[10px] text-muted-foreground/50 text-center mt-1">
                  Highlighted bar = current month
                </p>
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
