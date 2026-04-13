/**
 * HomeownerIntelPanel — AI-powered intelligence panel for homeowners reviewing a job.
 *
 * Four sub-cards:
 *  1. CostEstimateCard — realistic cost range for the trade + region
 *  2. PermitRequirementCard — permit required / not required / check local rules
 *  3. ContractorMatchCard — what to look for in a contractor for this trade
 *  4. TimingIntelligenceCard — best season / demand cycle advice
 *
 * Driven by trade type + ZIP. No external API calls — deterministic data tables.
 */

import { useState } from "react";
import {
  DollarSign, FileCheck, Star, Calendar, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Data tables
// ---------------------------------------------------------------------------

interface TradeIntel {
  costRangeLow: number;
  costRangeHigh: number;
  costUnit: string;
  permitRequired: "always" | "sometimes" | "rarely";
  permitNote: string;
  qualifications: string[];
  peakMonths: number[];      // 0-based
  offPeakAdvice: string;
  peakAdvice: string;
  warningTips: string[];
}

const TRADE_INTEL: Record<string, TradeIntel> = {
  electrical: {
    costRangeLow: 150, costRangeHigh: 350, costUnit: "per hour",
    permitRequired: "always",
    permitNote: "Electrical work almost always requires a permit and licensed electrician by law.",
    qualifications: ["State-licensed electrician (Master or Journeyman)", "Liability insurance min $1M", "Workers' comp coverage", "Pull their own permits"],
    peakMonths: [3, 4, 5, 8, 9],
    offPeakAdvice: "Winter and January–February are slow months — negotiate 10–15% off peak rates.",
    peakAdvice: "Spring and back-to-school season drive high demand. Lock in scheduling 3–4 weeks ahead.",
    warningTips: ["Never let unlicensed electricians do panel work", "Require a copy of the pulled permit before work starts", "Ask for a load calculation if upgrading service"],
  },
  plumbing: {
    costRangeLow: 120, costRangeHigh: 300, costUnit: "per hour",
    permitRequired: "sometimes",
    permitNote: "Permits required for new pipe runs, sewer work, and water heater installs. Simple repairs often don't need one.",
    qualifications: ["Licensed plumber (Master preferred)", "Liability insurance", "Familiar with local code and backflow requirements", "Bonded"],
    peakMonths: [0, 1, 5, 6, 7],
    offPeakAdvice: "Spring and fall are moderate seasons — good time to negotiate water heater replacements.",
    peakAdvice: "Frozen pipe season (Jan–Feb) and summer remodel season drive highest demand. Emergency rates can be 2×.",
    warningTips: ["Always ask if they pull permits for water heater installs (required in most states)", "Get 3 bids for anything over $2,000", "Ask about pipe material used — PEX vs copper matters long-term"],
  },
  roofing: {
    costRangeLow: 5_000, costRangeHigh: 25_000, costUnit: "per project",
    permitRequired: "sometimes",
    permitNote: "Full replacements typically require a permit; repairs over $5K may also. Varies by county.",
    qualifications: ["Licensed roofing contractor (state-required in most states)", "Manufacturer certification (GAF, Owens Corning) for warranty", "Liability + workers' comp insurance", "Local references"],
    peakMonths: [3, 4, 5, 8, 9],
    offPeakAdvice: "Late fall and winter offer 10–20% price reductions. Roofers book fast in spring.",
    peakAdvice: "Post-storm season (spring) creates 2–4 week backlogs. Get on lists early after a storm event.",
    warningTips: ["Beware of storm chasers — verify local office or physical address", "Manufacturer warranty requires certified installer — always verify", "Require a lien waiver before final payment"],
  },
  hvac: {
    costRangeLow: 4_000, costRangeHigh: 14_000, costUnit: "per system",
    permitRequired: "sometimes",
    permitNote: "New system installs and ductwork modifications typically require permits and inspections.",
    qualifications: ["EPA 608 certified technician", "Licensed HVAC contractor", "Brand-authorized dealer (for warranty)", "Liability and workers' comp insurance"],
    peakMonths: [5, 6, 7, 11, 0],
    offPeakAdvice: "Spring (before heat season) and fall (before cold season) are ideal for system replacements at pre-peak pricing.",
    peakAdvice: "Mid-summer and dead of winter create emergency pricing and 2–3 week install backlogs.",
    warningTips: ["Right-size your system — oversized units cause humidity problems", "Ask for Manual J load calculation", "Verify contractor is authorized dealer to protect your warranty"],
  },
  kitchen_remodel: {
    costRangeLow: 15_000, costRangeHigh: 80_000, costUnit: "per project",
    permitRequired: "sometimes",
    permitNote: "Moving walls, adding plumbing, or upgrading electrical panel requires permits. Cosmetic updates usually don't.",
    qualifications: ["Licensed general contractor", "Kitchen design certification (NKBA) a plus", "References from similar-scale projects", "Bonded and insured"],
    peakMonths: [2, 3, 4, 8, 9],
    offPeakAdvice: "January–February and November are slower months for remodelers — better scheduling flexibility.",
    peakAdvice: "Spring and back-to-school season create 4–8 week lead times for top contractors.",
    warningTips: ["Budget 15–20% contingency for hidden issues (asbestos, old wiring, plumbing surprises)", "Get a detailed scope — vague contracts lead to disputes", "Don't pay more than 10–15% upfront before work starts"],
  },
  bathroom_remodel: {
    costRangeLow: 8_000, costRangeHigh: 35_000, costUnit: "per project",
    permitRequired: "sometimes",
    permitNote: "Moving fixtures, adding a bathroom, or changing plumbing lines requires permits in most jurisdictions.",
    qualifications: ["Licensed general contractor or remodeling contractor", "Tile and waterproofing experience", "Plumbing license for fixture moves", "Insurance and references"],
    peakMonths: [2, 3, 4, 8],
    offPeakAdvice: "Winter months are ideal for scheduling bathroom remodels — contractors are less booked.",
    peakAdvice: "Spring kicks off remodel season — popular contractors fill up fast.",
    warningTips: ["Waterproofing is critical — ask specifically how they waterproof the shower pan", "Don't skip a permit for relocated plumbing — unpermitted work affects resale", "Ventilation is code-required; verify fan specs"],
  },
  full_renovation: {
    costRangeLow: 80_000, costRangeHigh: 300_000, costUnit: "per project",
    permitRequired: "always",
    permitNote: "Whole-home renovations always require permits. Expect multiple inspections for structural, electrical, plumbing, and HVAC.",
    qualifications: ["Licensed general contractor with renovation experience", "Architect or designer for structural changes", "Project management capability (schedule, subs)", "Strong local references (similar project scale)", "Full bonding and insurance"],
    peakMonths: [2, 3, 4, 5],
    offPeakAdvice: "Start planning in fall/winter for spring construction — GCs book out 3–6 months.",
    peakAdvice: "Peak GC demand in spring means higher prices and longer lead times.",
    warningTips: ["Interview at least 3 GCs — this is your largest home investment", "Insist on a detailed construction schedule with milestones", "Never pay more than 10% down; tie payments to completion milestones", "Clarify who manages subcontractors and how disputes are handled"],
  },
};

const DEFAULT_INTEL: TradeIntel = {
  costRangeLow: 1_000, costRangeHigh: 10_000, costUnit: "per project",
  permitRequired: "sometimes",
  permitNote: "Permit requirements vary — always check with your local building department.",
  qualifications: ["Licensed contractor", "Liability insurance", "Local references"],
  peakMonths: [3, 4, 5],
  offPeakAdvice: "Off-season timing can reduce costs by 10–20%.",
  peakAdvice: "Peak season demand increases pricing and reduces contractor availability.",
  warningTips: ["Get at least 3 quotes", "Verify license and insurance", "Never pay 100% upfront"],
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatCostRange(low: number, high: number, unit: string) {
  const fmt = (n: number) =>
    n >= 1_000 ? `$${(n / 1_000).toFixed(0)}k` : `$${n}`;
  return `${fmt(low)} – ${fmt(high)} ${unit}`;
}

// ---------------------------------------------------------------------------
// Sub-cards
// ---------------------------------------------------------------------------

interface SubCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accentColor: string;
  defaultOpen?: boolean;
}

function SubCard({ icon, title, children, accentColor, defaultOpen = true }: SubCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: `${accentColor}33` }}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
        style={{ background: `${accentColor}0a` }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: accentColor }}>{icon}</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-4 py-3 bg-[#0f0f1a] space-y-2">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

interface HomeownerIntelPanelProps {
  tradeType: string;
  zip?: string;
  loading?: boolean;
  className?: string;
}

export function HomeownerIntelPanel({
  tradeType,
  loading = false,
  className,
}: HomeownerIntelPanelProps) {
  const normalizedTrade = tradeType.toLowerCase().replace(/\s+/g, "_");
  const intel = TRADE_INTEL[normalizedTrade] ?? DEFAULT_INTEL;
  const currentMonth = new Date().getMonth();
  const isPeak = intel.peakMonths.includes(currentMonth);

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const permitColor =
    intel.permitRequired === "always" ? "#ef4444" :
    intel.permitRequired === "sometimes" ? "#f59e0b" : "#22c55e";

  return (
    <div className={cn("space-y-3", className)}>
      {/* Cost Estimate */}
      <SubCard
        icon={<DollarSign className="h-4 w-4" />}
        title="Typical Cost Range"
        accentColor="#22c55e"
      >
        <p className="text-lg font-bold text-green-400">
          {formatCostRange(intel.costRangeLow, intel.costRangeHigh, intel.costUnit)}
        </p>
        <p className="text-xs text-muted-foreground">
          Based on US national averages. Regional pricing varies — high-cost states (CA, NY, WA) run 20–35% higher.
        </p>
        <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-xs text-green-400">
            Tip: Get at least 3 quotes. Anything 30%+ below average may indicate cut corners or unlicensed work.
          </p>
        </div>
      </SubCard>

      {/* Permit Requirements */}
      <SubCard
        icon={<FileCheck className="h-4 w-4" />}
        title="Permit Requirements"
        accentColor={permitColor}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${permitColor}20`, color: permitColor, border: `1px solid ${permitColor}40` }}
          >
            {intel.permitRequired === "always" ? "Permit Required" :
             intel.permitRequired === "sometimes" ? "May Require Permit" : "Usually No Permit"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{intel.permitNote}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Always verify with your local building department before work begins. Unpermitted work can affect homeowner's insurance and resale value.
        </p>
      </SubCard>

      {/* Contractor Qualifications */}
      <SubCard
        icon={<Star className="h-4 w-4" />}
        title="What to Look For in a Contractor"
        accentColor="#a78bfa"
      >
        <ul className="space-y-1.5">
          {intel.qualifications.map((q) => (
            <li key={q} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="text-violet-400 mt-0.5">•</span>
              {q}
            </li>
          ))}
        </ul>
        {intel.warningTips.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Watch Out For</p>
            {intel.warningTips.map((tip) => (
              <div key={tip} className="flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 text-xs mt-0.5">!</span>
                <p className="text-xs text-amber-300">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </SubCard>

      {/* Timing Intelligence */}
      <SubCard
        icon={<Calendar className="h-4 w-4" />}
        title="Best Time to Hire"
        accentColor="#38bdf8"
      >
        {/* Month visualization */}
        <div className="grid grid-cols-12 gap-0.5 mb-3">
          {MONTH_NAMES.map((month, i) => (
            <div key={month} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-full rounded-sm h-6",
                  intel.peakMonths.includes(i)
                    ? "bg-red-500/40 border border-red-500/30"
                    : "bg-green-500/20 border border-green-500/20",
                  i === currentMonth && "ring-1 ring-white/40"
                )}
              />
              <span className="text-[8px] text-muted-foreground">{month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm bg-red-500/40 border border-red-500/30" />
            Peak season
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm bg-green-500/20 border border-green-500/20" />
            Off-peak
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded-sm ring-1 ring-white/40 bg-transparent" />
            Now
          </div>
        </div>

        <div
          className={cn(
            "rounded-lg p-3 text-xs",
            isPeak
              ? "bg-red-500/10 border border-red-500/20 text-red-300"
              : "bg-green-500/10 border border-green-500/20 text-green-300"
          )}
        >
          <strong>{isPeak ? "You are in peak season." : "Good timing — off-peak season."}</strong>{" "}
          {isPeak ? intel.peakAdvice : intel.offPeakAdvice}
        </div>
      </SubCard>
    </div>
  );
}
