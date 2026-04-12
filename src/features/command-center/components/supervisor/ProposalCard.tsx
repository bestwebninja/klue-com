/**
 * ProposalCard — renders a Client Proposal AI output.
 *
 * Designed to look like a real professional proposal document:
 * - Header with proposal number, dates, client/contractor
 * - Executive summary
 * - Scope of work (collapsible sections with line items)
 * - Payment schedule table
 * - Timeline summary
 * - Inclusions / Exclusions columns
 * - Warranty statement
 * - Total amount hero + copy-to-clipboard
 */
import {
  Calendar, CheckCircle2, ChevronDown, ChevronUp,
  ClipboardCopy, FileText, ShieldCheck, Wallet, Zap, XCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ScopeSection {
  section: string;
  items: string[];
  subtotalUsd: number;
}

interface PaymentMilestone {
  milestone: string;
  amountUsd: number;
  percentOfTotal: number;
  dueAt: string;
}

interface ProposalTimeline {
  startDate: string;
  completionDate: string;
  totalWeeks: number;
  keyMilestones: string[];
}

interface Proposal {
  proposalNumber: string;
  dateIssued: string;
  validThrough: string;
  contractorName: string;
  clientName: string;
  executiveSummary: string;
  scopeDescription: string;
  scopeOfWork: ScopeSection[];
  paymentSchedule: PaymentMilestone[];
  timeline: ProposalTimeline;
  inclusions: string[];
  exclusions: string[];
  warrantyStatement: string;
  totalAmountUsd: number;
  terms: string;
}

interface Action { priority: "high" | "medium" | "low"; action: string; }

interface ProposalOutput {
  proposal: Proposal;
  recommendedActions: Action[];
}

const PRIORITY_DOT = { high: "bg-rose-400", medium: "bg-amber-400", low: "bg-emerald-400" } as const;

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-primary transition-colors"
    >
      <ClipboardCopy className="h-3 w-3" />
      {copied ? "Copied!" : label}
    </button>
  );
}

export function ProposalCard({ output }: { output: ProposalOutput }) {
  const [scopeOpen, setScopeOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const p = output?.proposal;
  if (!p) return null;

  const scopeText = p.scopeOfWork
    .map((s) => `${s.section}\n${s.items.map((i) => `  • ${i}`).join("\n")}`)
    .join("\n\n");

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-card/80">
      {/* Document header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/15 p-1.5 shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-primary/80 uppercase tracking-wider">
                Project Proposal
              </p>
              <p className="text-sm font-semibold">#{p.proposalNumber}</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-muted-foreground space-y-0.5">
            <p>Issued: <span className="text-foreground/80">{p.dateIssued}</span></p>
            <p>Valid through: <span className="text-foreground/80">{p.validThrough}</span></p>
          </div>
        </div>

        {/* Client / Contractor */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/40 bg-card/40 px-3 py-2">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Prepared for</p>
            <p className="text-xs font-semibold mt-0.5">{p.clientName}</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card/40 px-3 py-2">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Submitted by</p>
            <p className="text-xs font-semibold mt-0.5">{p.contractorName}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Total hero */}
        <div className="rounded-xl border border-primary/20 bg-primary/8 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground">Total project investment</p>
            <p className="text-2xl font-bold">${p.totalAmountUsd.toLocaleString()}</p>
          </div>
          <Wallet className="h-8 w-8 text-primary/40" />
        </div>

        {/* Executive summary */}
        <div className="rounded-lg border border-border/40 bg-card/40 px-3 py-2.5 text-xs text-muted-foreground leading-relaxed">
          {p.executiveSummary}
        </div>

        {/* Timeline strip */}
        {p.timeline && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground rounded-lg border border-border/40 bg-card/40 px-3 py-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/60" />
            <span>Start: <span className="text-foreground/80 font-medium">{p.timeline.startDate}</span></span>
            <span>·</span>
            <span>Complete: <span className="text-foreground/80 font-medium">{p.timeline.completionDate}</span></span>
            <span>·</span>
            <span className="text-foreground/80 font-medium">{p.timeline.totalWeeks} weeks</span>
          </div>
        )}

        {/* Scope of work */}
        {(p.scopeOfWork?.length ?? 0) > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setScopeOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Scope of work ({p.scopeOfWork.length} sections)
              </span>
              <div className="flex items-center gap-2">
                <CopyButton text={scopeText} label="Copy scope" />
                {scopeOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </div>
            </button>
            {scopeOpen && (
              <div className="mt-1.5 space-y-2">
                {p.scopeOfWork.map((section, i) => (
                  <div key={i} className="rounded-lg border border-border/40 bg-card/40 px-3 py-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground/90">{section.section}</p>
                      <span className="text-[11px] text-muted-foreground/70">
                        ~${section.subtotalUsd.toLocaleString()}
                      </span>
                    </div>
                    {section.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-1.5 text-[11px] text-muted-foreground/80">
                        <span className="mt-1 h-1 w-1 rounded-full bg-primary/40 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment schedule */}
        {(p.paymentSchedule?.length ?? 0) > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setPaymentOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5" />
                Payment schedule ({p.paymentSchedule.length} milestones)
              </span>
              {paymentOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {paymentOpen && (
              <div className="mt-1.5 space-y-1">
                {p.paymentSchedule.map((m, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 rounded-lg border border-border/30 bg-card/30 px-3 py-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground/90 truncate">{m.milestone}</p>
                      <p className="text-muted-foreground/60 text-[11px]">{m.dueAt}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-primary">${m.amountUsd.toLocaleString()}</p>
                      <p className="text-muted-foreground/50 text-[10px]">{m.percentOfTotal}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inclusions / Exclusions + Warranty */}
        {((p.inclusions?.length ?? 0) > 0 || (p.exclusions?.length ?? 0) > 0) && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setDetailsOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Inclusions, exclusions & warranty
              </span>
              {detailsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {detailsOpen && (
              <div className="mt-1.5 space-y-3">
                {/* Inclusions */}
                {(p.inclusions?.length ?? 0) > 0 && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 space-y-1.5">
                    <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Included</p>
                    {p.inclusions.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground/80">
                        <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-emerald-400/70" />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                {/* Exclusions */}
                {(p.exclusions?.length ?? 0) > 0 && (
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 space-y-1.5">
                    <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Not included</p>
                    {p.exclusions.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground/80">
                        <XCircle className="h-3 w-3 mt-0.5 shrink-0 text-rose-400/60" />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                {/* Warranty */}
                {p.warrantyStatement && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider mb-1">Warranty</p>
                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed">{p.warrantyStatement}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Next actions */}
        {(output?.recommendedActions?.length ?? 0) > 0 && (
          <div>
            <button
              className="flex w-full items-center justify-between text-xs font-medium text-foreground/70 hover:text-foreground py-1"
              onClick={() => setActionsOpen((v) => !v)}
            >
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Next actions
              </span>
              {actionsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {actionsOpen && (
              <div className="mt-1.5 space-y-1.5">
                {output.recommendedActions.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", PRIORITY_DOT[a.priority])} />
                    <span className="text-foreground/80">{a.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
