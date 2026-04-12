import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SynthesisResult } from "../../ai/client/supervisorClient";
import type { SupervisorMessage } from "../../hooks/useSupervisor";
import { RenovationWorkflowCard } from "./RenovationWorkflowCard";
import { ZoningEntitlementCard } from "./ZoningEntitlementCard";
import { LendingCapitalCard } from "./LendingCapitalCard";
import { BidEstimatorCard } from "./BidEstimatorCard";
import { MarketIntelCard } from "./MarketIntelCard";
import { ProposalCard } from "./ProposalCard";

// ---------------------------------------------------------------------------
// Risk level styling
// ---------------------------------------------------------------------------
const RISK_CONFIG = {
  low: { label: "Low Risk", classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  moderate: { label: "Moderate Risk", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  elevated: { label: "Elevated Risk", classes: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  high: { label: "High Risk", classes: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
} as const;

const PRIORITY_CONFIG = {
  high: { icon: AlertTriangle, classes: "text-rose-400", badgeClasses: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  medium: { icon: Circle, classes: "text-amber-400", badgeClasses: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  low: { icon: CheckCircle2, classes: "text-emerald-400", badgeClasses: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
} as const;

const AGENT_LABELS: Record<string, string> = {
  leak_hunter: "Leak Hunter",
  code_guardian: "Code Guardian",
  rebate_maximizer: "Rebate Maximizer",
  storm_scout: "Storm Scout",
  draw_guardian: "Draw Guardian",
  document_whisperer: "Document Whisperer",
  escrow_automator: "Escrow Automator",
  renovation_ai: "Renovation AI",
  zoning_ai: "Zoning AI",
  lending_ai: "Lending AI",
  bid_estimator: "Bid & Estimating AI",
  market_intel: "Market Intel AI",
  proposal_ai: "Client Proposal AI",
};

const INTENT_LABELS: Record<string, string> = {
  renovation_workflow: "Renovation Workflow",
  zoning_entitlement: "Zoning & Entitlement",
  lending_capital: "Lending & Capital",
  bid_estimating: "Bid & Estimating",
  market_intelligence: "Market Intelligence",
  proposal_generation: "Client Proposal",
  risk_scan: "Risk Scan",
  document_audit: "Document Audit",
  rebate_discovery: "Rebate Discovery",
  single_agent: "Direct Agent",
  full_audit: "Full Audit",
};

// ---------------------------------------------------------------------------
// Thinking skeleton — shown while isThinking
// ---------------------------------------------------------------------------
export function SupervisorThinkingSkeleton() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-lg bg-primary/15 p-1.5">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="h-3 w-40 rounded bg-primary/15 animate-pulse" />
            <div className="h-2.5 w-24 rounded bg-muted/40 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2 pl-8">
          <div className="h-2.5 w-full rounded bg-muted/30 animate-pulse" />
          <div className="h-2.5 w-4/5 rounded bg-muted/30 animate-pulse" />
          <div className="h-2.5 w-3/5 rounded bg-muted/30 animate-pulse" />
        </div>
        <div className="flex gap-2 pl-8">
          {["Storm Scout", "Code Guardian"].map((label) => (
            <span key={label} className="flex items-center gap-1 rounded-full border border-border/50 bg-card/50 px-2.5 py-0.5 text-[11px] text-muted-foreground">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              {label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main response card
// ---------------------------------------------------------------------------
interface SupervisorResponseCardProps {
  message: SupervisorMessage;
}

export function SupervisorResponseCard({ message }: SupervisorResponseCardProps) {
  const [actionsExpanded, setActionsExpanded] = useState(true);
  const [agentsExpanded, setAgentsExpanded] = useState(false);

  const synthesis = message.data?.synthesis as SynthesisResult | null | undefined;
  const intent = message.data?.intent;
  const agentRunIds = message.data?.agentRunIds ?? [];
  const agentOutputs = message.data?.agentOutputs ?? {};
  const hadPartialFailure = message.data?.hadPartialFailure ?? false;

  const agentKeys = Object.keys(agentOutputs);
  const riskLevel = synthesis?.riskLevel ?? "low";
  const riskCfg = RISK_CONFIG[riskLevel] ?? RISK_CONFIG.low;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card/80">
      <CardContent className="p-4 space-y-4">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="flex items-center justify-center rounded-lg bg-primary/15 p-1.5 shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              {intent && (
                <p className="text-[11px] font-medium text-primary/80 uppercase tracking-wider mb-0.5">
                  {INTENT_LABELS[intent] ?? intent}
                </p>
              )}
              {synthesis?.headline ? (
                <p className="text-sm font-semibold leading-snug">{synthesis.headline}</p>
              ) : (
                <p className="text-sm font-semibold leading-snug">{message.content.split("\n")[0]}</p>
              )}
            </div>
          </div>
          <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium", riskCfg.classes)}>
            {riskCfg.label}
          </span>
        </div>

        {/* Narrative */}
        {synthesis?.narrative && (
          <p className="text-sm text-muted-foreground leading-relaxed pl-8">
            {synthesis.narrative}
          </p>
        )}

        {/* Macro-agent specialized cards */}
        {agentOutputs.renovation_ai && (
          <div className="pl-0 pt-1">
            <RenovationWorkflowCard output={agentOutputs.renovation_ai as any} />
          </div>
        )}
        {agentOutputs.zoning_ai && (
          <div className="pl-0 pt-1">
            <ZoningEntitlementCard output={agentOutputs.zoning_ai as any} />
          </div>
        )}
        {agentOutputs.lending_ai && (
          <div className="pl-0 pt-1">
            <LendingCapitalCard output={agentOutputs.lending_ai as any} />
          </div>
        )}
        {agentOutputs.bid_estimator && (
          <div className="pl-0 pt-1">
            <BidEstimatorCard output={agentOutputs.bid_estimator as any} />
          </div>
        )}
        {agentOutputs.market_intel && (
          <div className="pl-0 pt-1">
            <MarketIntelCard output={agentOutputs.market_intel as any} />
          </div>
        )}
        {agentOutputs.proposal_ai && (
          <div className="pl-0 pt-1">
            <ProposalCard output={agentOutputs.proposal_ai as any} />
          </div>
        )}

        {/* Actions */}
        {synthesis?.actions && synthesis.actions.length > 0 && (
          <div className="pl-8 space-y-2">
            <button
              className="flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setActionsExpanded((v) => !v)}
            >
              <Zap className="h-3.5 w-3.5 text-primary" />
              Next Actions ({synthesis.actions.length})
              {actionsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {actionsExpanded && (
              <div className="space-y-1.5">
                {synthesis.actions.map((action, i) => {
                  const pCfg = PRIORITY_CONFIG[action.priority] ?? PRIORITY_CONFIG.low;
                  const Icon = pCfg.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-card/50 px-3 py-2"
                    >
                      <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", pCfg.classes)} />
                      <p className="text-xs text-foreground/90 leading-snug flex-1">{action.action}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", pCfg.badgeClasses)}>
                          {action.priority}
                        </span>
                        {action.sourceAgent && (
                          <span className="rounded-full border border-border/40 bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {AGENT_LABELS[action.sourceAgent] ?? action.sourceAgent}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Agent run attribution */}
        {agentKeys.length > 0 && (
          <div className="pl-8">
            <button
              className="flex items-center gap-1.5 text-xs font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
              onClick={() => setAgentsExpanded((v) => !v)}
            >
              <Bot className="h-3.5 w-3.5" />
              {agentKeys.length} agent{agentKeys.length !== 1 ? "s" : ""} ran
              {hadPartialFailure && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400 ml-1">
                  partial
                </span>
              )}
              {agentsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {agentsExpanded && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {agentKeys.map((key) => {
                  const hasOutput = agentOutputs[key] != null;
                  return (
                    <span
                      key={key}
                      className={cn(
                        "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                        hasOutput
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                      )}
                    >
                      {hasOutput ? (
                        <CheckCircle2 className="h-2.5 w-2.5" />
                      ) : (
                        <AlertTriangle className="h-2.5 w-2.5" />
                      )}
                      {AGENT_LABELS[key] ?? key}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Confidence */}
        {synthesis?.confidence != null && (
          <div className="pl-8 flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-muted-foreground/60" />
            <p className="text-[11px] text-muted-foreground/60">
              Confidence: {Math.round(synthesis.confidence * 100)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// System nudge pill
// ---------------------------------------------------------------------------
export function NudgePill({ content }: { content: string }) {
  return (
    <div className="flex items-center justify-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
        <ArrowRight className="h-3 w-3" />
        {content.replace(/^Suggestion:\s*/i, "")}
      </span>
    </div>
  );
}
