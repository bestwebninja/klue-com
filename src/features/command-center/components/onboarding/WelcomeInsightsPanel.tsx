/**
 * WelcomeInsightsPanel — First Value Moment display.
 *
 * Shown immediately after onboarding wizard completes. Presents the user's
 * personalized market intelligence before they've done anything else on the
 * platform — establishing the "this platform knows my world" moment that
 * drives 30-day retention.
 */
import { ArrowRight, BrainCircuit, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MarketIntelCard } from "../supervisor/MarketIntelCard";

interface WelcomeInsightsPanelProps {
  isLoading: boolean;
  data: Record<string, unknown> | null;
  trade: string;
  workspaceId: string;
}

const TRADE_LABEL: Record<string, string> = {
  plumbing: "Plumbing", electrical: "Electrical", roofing: "Roofing",
  hvac: "HVAC", kitchen_remodel: "Kitchen Remodel",
  bathroom_remodel: "Bath Remodel", flooring: "Flooring",
  painting: "Painting", landscaping: "Landscaping", general: "General Contracting",
};

const VALUE_PROPS = [
  "Real-time market opportunity scores for your ZIP",
  "Live permit pull trends and competitor density",
  "Seasonal demand forecasting for your trade",
  "AI-powered bid estimates calibrated to your region",
  "Renovation timelines and cash-flow simulation",
  "Zoning, entitlement, and permit approval scoring",
];

export function WelcomeInsightsPanel({ isLoading, data, trade, workspaceId }: WelcomeInsightsPanelProps) {
  const tradeLabel = TRADE_LABEL[trade] ?? trade;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/80 p-8 text-center space-y-5">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/15 p-4">
          <BrainCircuit className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Analyzing your market…</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Running Neural Command OS on your ZIP code and trade to build your personalized intelligence profile.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Market Intel AI is scanning local permit data, competitor density, and seasonal demand…
        </div>
        {/* Skeleton preview to maintain layout */}
        <div className="mt-4 space-y-3 opacity-40">
          <div className="h-3 w-3/4 mx-auto rounded bg-muted/50 animate-pulse" />
          <div className="h-3 w-1/2 mx-auto rounded bg-muted/40 animate-pulse" />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    // Graceful fallback — agent failed or timed out; show value props instead
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/15 p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Your Command Center is ready</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Everything you need to run a smarter {tradeLabel} business — all in one place.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {VALUE_PROPS.map((prop) => (
            <div key={prop} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              {prop}
            </div>
          ))}
        </div>
        <Link
          to={`/command-center/${workspaceId}`}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Open your Command Center
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const market = data.market as { city?: string; state?: string } | undefined;
  const score = data.opportunityScore as number | undefined;
  const city = market?.city;
  const state = market?.state;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/80 p-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <BrainCircuit className="h-3.5 w-3.5" />
          Neural Command OS — Live Intelligence
        </div>
        <h3 className="text-2xl font-bold">
          {city && state ? `${city}, ${state}` : "Your market"} is{" "}
          <span className={cn(
            "font-extrabold",
            score != null && score >= 75 ? "text-emerald-400" :
            score != null && score >= 55 ? "text-amber-400" : "text-foreground"
          )}>
            {score != null && score >= 75 ? "high-opportunity" :
             score != null && score >= 55 ? "solid ground" : "developing"}
          </span>
        </h3>
        <p className="text-muted-foreground text-sm">
          Your {tradeLabel} intelligence is live — here's what we found.
        </p>
      </div>

      {/* Market Intel Card */}
      <MarketIntelCard output={data as any} />

      {/* CTA */}
      <Link
        to={`/command-center/${workspaceId}`}
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="h-4 w-4" />
        Enter your Command Center
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="text-center text-xs text-muted-foreground">
        Your analysis updates as you add jobs, quotes, and documents.
      </p>
    </div>
  );
}
