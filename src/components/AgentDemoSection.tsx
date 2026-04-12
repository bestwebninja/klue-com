/**
 * AgentDemoSection — Homepage interactive preview of the Neural Command OS.
 *
 * Three pre-baked scenario tabs show realistic agent output cards so visitors
 * can experience the platform before signing up. No API call required.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { BidEstimatorCard } from "@/features/command-center/components/supervisor/BidEstimatorCard";
import { MarketIntelCard } from "@/features/command-center/components/supervisor/MarketIntelCard";
import { RenovationWorkflowCard } from "@/features/command-center/components/supervisor/RenovationWorkflowCard";

// ---------------------------------------------------------------------------
// Pre-baked demo data — crafted to showcase the platform at its best
// ---------------------------------------------------------------------------

const DEMO_BID = {
  projectSummary: {
    tradeType: "roofing",
    scopeDescription: "Full tear-off and re-roof, 28 squares architectural shingles, new ice & water shield",
    squareFootage: 2800,
    zipCode: "80202",
    city: "Denver",
    state: "CO",
  },
  estimate: {
    totalLow: 16800,
    totalHigh: 26600,
    midpointUsd: 21700,
    confidencePercent: 88,
    lineItems: [
      { category: "Material" as const, item: "Architectural Shingles (30yr)", estimatedQty: "28 squares", unitCostRange: "$149–$234", totalLow: 4172, totalHigh: 6552 },
      { category: "Material" as const, item: "Ice & Water Shield", estimatedQty: "14 rolls", unitCostRange: "$80–$127", totalLow: 1120, totalHigh: 1778 },
      { category: "Material" as const, item: "Roofing Underlayment", estimatedQty: "22 rolls", unitCostRange: "$48–$95", totalLow: 1056, totalHigh: 2090 },
      { category: "Labor" as const, item: "Tear-Off & Disposal", estimatedQty: "28 squares", unitCostRange: "$48–$90", totalLow: 1344, totalHigh: 2520 },
      { category: "Labor" as const, item: "Installation Labor", estimatedQty: "28 squares", unitCostRange: "$80–$149", totalLow: 2240, totalHigh: 4172 },
      { category: "Other" as const, item: "Permits & Inspections", estimatedQty: "1 flat", unitCostRange: "$212–$530", totalLow: 212, totalHigh: 530 },
      { category: "Other" as const, item: "Dumpster & Cleanup", estimatedQty: "1 flat", unitCostRange: "$372–$636", totalLow: 372, totalHigh: 636 },
    ],
    materialCostUsd: 13330,
    laborCostUsd: 8370,
    laborPercent: 40,
  },
  marginAnalysis: {
    recommendedMarginPercent: 23,
    recommendedBidUsd: 26691,
    estimatedProfitUsd: 4991,
    breakEvenCostUsd: 21700,
  },
  competitiveness: {
    marketMedianUsd: 24200,
    bidPercentile: 55,
    winProbabilityPercent: 67,
    recommendation: "Your bid is right at market — emphasize your warranty, reviews, and timeline to stand out from the 18 other roofers in this zip.",
  },
  recommendedActions: [
    { priority: "high" as const, action: "Include a 10-year workmanship warranty to differentiate from low-bid competitors" },
    { priority: "medium" as const, action: "Schedule material delivery for Monday to hit the dry weather window (Tue–Fri)" },
    { priority: "low" as const, action: "Upsell gutter cleaning post-installation — 60% close rate on roofing jobs" },
  ],
};

const DEMO_MARKET = {
  market: { zipCode: "78701", city: "Austin", state: "TX", tradeType: "plumbing" },
  opportunityScore: 81,
  opportunityTier: "high" as const,
  demandLevel: "strong",
  competitorCount: 11,
  competitorDensity: "moderate" as const,
  avgJobValueUsd: 3990,
  annualMarketSizeUsd: 1_536_150,
  permitPullTrend: "increasing",
  permitPullCount30d: 138,
  seasonalDemand: [
    { month: "Jan", demandIndex: 75 }, { month: "Feb", demandIndex: 70 },
    { month: "Mar", demandIndex: 78 }, { month: "Apr", demandIndex: 83 },
    { month: "May", demandIndex: 85 }, { month: "Jun", demandIndex: 82 },
    { month: "Jul", demandIndex: 80 }, { month: "Aug", demandIndex: 82 },
    { month: "Sep", demandIndex: 84 }, { month: "Oct", demandIndex: 80 },
    { month: "Nov", demandIndex: 77 }, { month: "Dec", demandIndex: 74 },
  ],
  marketInsights: [
    "Austin, TX is one of the fastest-growing construction markets in the US.",
    "Permit pull volume up 22% year-over-year — construction boom underway.",
    "Only 11 licensed plumbers serving a rapidly expanding residential base.",
    "Off-peak now, but demand peaks at 85/100 in May — great time to build pipeline.",
  ],
  recommendedActions: [
    { priority: "high" as const, action: "Capture market share in Austin — opportunity score 81/100" },
    { priority: "high" as const, action: "Ramp capacity before May peak season — leads will accelerate" },
    { priority: "medium" as const, action: "Price at market median (~$3,990) to maximize win rate in this competitive field" },
  ],
  alertCreated: false,
};

const DEMO_RENO = {
  projectSummary: {
    tradeType: "kitchen_remodel",
    scopeDescription: "Full kitchen gut-reno: new cabinets, quartz countertops, appliances, electrical panel upgrade",
    estimatedBudgetUsd: 68000,
    startDate: "2026-05-12",
  },
  timeline: {
    totalWeeks: 10,
    estimatedCompletionDate: "2026-07-21",
    phases: [
      { phase: "Permits & Design", startWeek: 0, durationWeeks: 1.5, costUsd: 2720, criticalPath: true, estimatedStartDate: "2026-05-12" },
      { phase: "Demolition", startWeek: 1.5, durationWeeks: 0.5, costUsd: 4080, criticalPath: true, estimatedStartDate: "2026-05-22" },
      { phase: "Rough-In Plumbing & Electrical", startWeek: 2, durationWeeks: 1.5, costUsd: 9520, criticalPath: true, estimatedStartDate: "2026-05-26" },
      { phase: "Rough-In Inspection", startWeek: 3.5, durationWeeks: 0.5, costUsd: null, criticalPath: true, estimatedStartDate: "2026-06-09" },
      { phase: "Drywall & Insulation", startWeek: 4, durationWeeks: 1, costUsd: 5440, criticalPath: true, estimatedStartDate: "2026-06-16" },
      { phase: "Cabinets & Countertops", startWeek: 5, durationWeeks: 1.5, costUsd: 18360, criticalPath: true, estimatedStartDate: "2026-06-23" },
      { phase: "Flooring", startWeek: 5, durationWeeks: 1, costUsd: 6120, criticalPath: false, estimatedStartDate: "2026-06-23" },
      { phase: "Fixtures, Appliances & Trim", startWeek: 6.5, durationWeeks: 1, costUsd: 14960, criticalPath: true, estimatedStartDate: "2026-07-07" },
      { phase: "Punch List & Final Inspection", startWeek: 7.5, durationWeeks: 0.5, costUsd: 6120, criticalPath: true, estimatedStartDate: "2026-07-14" },
    ],
  },
  cashFlow: {
    hasCashFlowGap: false,
    cashFlowGapSeverity: "low" as const,
    peakNegativeWeek: 3,
    peakNegativeAmountUsd: 12400,
    weeklyProjections: [
      { week: 1, inflow: 6800, outflow: 4200, cumulativeBalance: 2600 },
      { week: 2, inflow: 0, outflow: 8500, cumulativeBalance: -5900 },
      { week: 3, inflow: 13600, outflow: 4800, cumulativeBalance: 2900 },
      { week: 4, inflow: 0, outflow: 5200, cumulativeBalance: -2300 },
      { week: 5, inflow: 13600, outflow: 9400, cumulativeBalance: 1900 },
      { week: 6, inflow: 0, outflow: 8800, cumulativeBalance: -6900 },
      { week: 7, inflow: 20400, outflow: 6200, cumulativeBalance: 7300 },
      { week: 8, inflow: 0, outflow: 4400, cumulativeBalance: 2900 },
      { week: 9, inflow: 13600, outflow: 2800, cumulativeBalance: 13700 },
      { week: 10, inflow: 0, outflow: 1600, cumulativeBalance: 12100 },
    ],
  },
  risks: [
    { type: "Permit Delay", probability: 0.22, impact: "3–7 day timeline slip", mitigation: "Submit permit application on day 1; pre-schedule inspector." },
    { type: "Hidden Structural Issues", probability: 0.15, impact: "Up to $4k change order", mitigation: "Budget 10% contingency; open wall inspection before drywall." },
  ],
  recommendedActions: [
    { priority: "high" as const, action: "Submit permit application immediately to avoid timeline slip", timing: "Day 1" },
    { priority: "medium" as const, action: "Order cabinets by Week 2 — 3–4 week lead time required", timing: "Week 2" },
    { priority: "low" as const, action: "Confirm appliance delivery before Week 6 to stay on schedule", timing: "Week 4" },
  ],
  weatherSummary: "Clear weather window in Denver through mid-July — ideal for any necessary outdoor work.",
  lendingNudge: false,
};

// ---------------------------------------------------------------------------
// Scenario config
// ---------------------------------------------------------------------------
const SCENARIOS = [
  {
    id: "bid",
    label: "Estimate a Job",
    query: "Estimate a 2,800 sqft roofing tear-off in Denver, CO",
    description: "Get a line-item estimate with margin analysis and win probability vs market.",
    card: <BidEstimatorCard output={DEMO_BID} />,
  },
  {
    id: "market",
    label: "Market Intelligence",
    query: "What's the plumbing market like in Austin, TX?",
    description: "See local opportunity scores, competitor density, and seasonal demand trends.",
    card: <MarketIntelCard output={DEMO_MARKET} />,
  },
  {
    id: "reno",
    label: "Renovation Workflow",
    query: "Plan a full kitchen remodel — $68k budget, start May 12",
    description: "Phase-by-phase timeline, cash-flow simulation, and risk analysis.",
    card: <RenovationWorkflowCard output={DEMO_RENO} />,
  },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AgentDemoSection() {
  const [active, setActive] = useState<"bid" | "market" | "reno">("bid");
  const scenario = SCENARIOS.find((s) => s.id === active)!;

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            <BrainCircuit className="h-4 w-4" />
            Neural Command OS — Live Preview
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            See what your projects look like<br className="hidden sm:block" /> through AI intelligence
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose a scenario below to see a real agent analysis. No signup needed —
            your actual results will be personalized to your projects and location.
          </p>
        </div>

        {/* Scenario tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                active === s.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Demo panel */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left: context */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-primary/15 p-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-primary/80 uppercase tracking-wider">
                    Neural Command OS
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {scenario.label}
                  </p>
                </div>
              </div>

              {/* Fake command bar */}
              <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm text-foreground/80 font-mono">
                <span className="text-primary/60">›</span> {scenario.query}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {scenario.description}
              </p>

              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground/60">What you get with full access:</p>
                {[
                  "Real data from your actual jobs and quotes",
                  "Live weather, permit, and market feeds",
                  "Alert system that notifies you proactively",
                  "All 10 specialized AI agents working together",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center space-y-3">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors w-full"
              >
                Get your personalized analysis — free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs text-muted-foreground">
                No credit card required · Setup in 2 minutes
              </p>
            </div>
          </div>

          {/* Right: live card preview */}
          <div className="overflow-hidden">
            {scenario.card}
          </div>
        </div>

      </div>
    </section>
  );
}
