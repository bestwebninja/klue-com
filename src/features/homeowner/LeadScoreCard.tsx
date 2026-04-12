/**
 * LeadScoreCard — displays a scored lead result for contractors.
 *
 * Shows: SVG circle score, tier badge, conversion probability bar,
 * estimated job value, contractor match strength, intent signal pills,
 * and the recommended response.
 */

import { cn } from "@/lib/utils";
import { Clock, DollarSign, Zap, Target } from "lucide-react";

export interface LeadScore {
  score: number;
  tier: "platinum" | "gold" | "silver" | "bronze";
  intentSignals: string[];
  contractorMatchStrength: number;
  conversionProbability: number;
  estimatedJobValue: number;
  recommendedResponse: string;
  scoreBreakdown?: {
    budgetScore: number;
    tradeUrgencyScore: number;
    homeownerTypeScore: number;
    descriptionScore: number;
  };
}

interface LeadScoreCardProps {
  score: LeadScore;
  jobTitle?: string;
  className?: string;
}

const TIER_CONFIG = {
  platinum: {
    label: "Platinum",
    bg: "bg-violet-500/20",
    border: "border-violet-500/40",
    text: "text-violet-300",
    ring: "#a78bfa",
    track: "#2a1a4a",
  },
  gold: {
    label: "Gold",
    bg: "bg-amber-500/20",
    border: "border-amber-500/40",
    text: "text-amber-300",
    ring: "#f59e0b",
    track: "#2a1a00",
  },
  silver: {
    label: "Silver",
    bg: "bg-slate-500/20",
    border: "border-slate-500/40",
    text: "text-slate-300",
    ring: "#94a3b8",
    track: "#1a2030",
  },
  bronze: {
    label: "Bronze",
    bg: "bg-orange-500/20",
    border: "border-orange-500/40",
    text: "text-orange-400",
    ring: "#f97316",
    track: "#2a1000",
  },
};

function CircleScore({ score, tier }: { score: number; tier: keyof typeof TIER_CONFIG }) {
  const config = TIER_CONFIG[tier];
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke={config.track} strokeWidth="8" />
        {/* Progress */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={config.ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold", config.text)}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function ProbabilityBar({ value, color }: { value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground">Conversion Probability</span>
        <span className="text-xs font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1e1e36] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

const SIGNAL_LABELS: Record<string, string> = {
  urgent_timeline: "Urgent",
  detailed_scope: "Detailed Scope",
  high_budget: "High Budget",
  owner_occupant: "Owner Occupant",
  repeat_client_potential: "Repeat Client",
  quality_focused: "Quality Focused",
};

function formatCurrency(n: number) {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export function LeadScoreCard({ score, jobTitle, className }: LeadScoreCardProps) {
  const config = TIER_CONFIG[score.tier];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 bg-[#0f0f1a] space-y-4",
        config.border,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          {jobTitle && (
            <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{jobTitle}</p>
          )}
          <span
            className={cn(
              "inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full mt-1",
              config.bg, config.text, `border ${config.border}`
            )}
          >
            {config.label} Lead
          </span>
        </div>
        <CircleScore score={score.score} tier={score.tier} />
      </div>

      {/* Conversion probability */}
      <ProbabilityBar value={score.conversionProbability} color={config.ring} />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-[#16162a] p-2.5">
          <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Est. Value</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(score.estimatedJobValue)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#16162a] p-2.5">
          <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Match Strength</p>
            <p className="text-sm font-semibold text-foreground">
              {Math.round(score.contractorMatchStrength * 10)}/10
            </p>
          </div>
        </div>
      </div>

      {/* Intent signals */}
      {score.intentSignals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {score.intentSignals.map((sig) => (
            <span
              key={sig}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#16162a] border border-white/10 text-muted-foreground"
            >
              <Zap className="h-2.5 w-2.5" />
              {SIGNAL_LABELS[sig] ?? sig}
            </span>
          ))}
        </div>
      )}

      {/* Recommended response */}
      <div className={cn("rounded-lg p-3 flex gap-2 items-start", config.bg, `border ${config.border}`)}>
        <Clock className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.text)} />
        <p className={cn("text-xs leading-relaxed", config.text)}>
          {score.recommendedResponse}
        </p>
      </div>

      {/* Score breakdown */}
      {score.scoreBreakdown && (
        <div className="space-y-1 pt-1 border-t border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score Breakdown</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {Object.entries({
              "Budget": score.scoreBreakdown.budgetScore,
              "Trade Urgency": score.scoreBreakdown.tradeUrgencyScore,
              "Owner Type": score.scoreBreakdown.homeownerTypeScore,
              "Description": score.scoreBreakdown.descriptionScore,
            }).map(([label, pts]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{label}</span>
                <span className="text-[10px] font-medium text-foreground">{pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
