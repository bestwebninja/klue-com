/**
 * ContractBuilder — generates, previews, and signs contracts.
 *
 * Features:
 *  - Pre-fills from proposal/job data
 *  - Live HTML preview pane
 *  - Contractor e-signature canvas
 *  - Send-to-homeowner action (saves to contracts table)
 *  - Download as HTML
 *  - Status badge: draft → sent → signed
 */

import { useState } from "react";
import { FileText, Send, Download, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ESignatureCanvas } from "./ESignatureCanvas";
import { generateContract, type ContractData, type ContractLineItem } from "./utils/generateContract";

interface ContractBuilderProps {
  initialTitle?: string;
  initialTradeType?: string;
  initialScopeOfWork?: string;
  initialLineItems?: ContractLineItem[];
  homeownerId?: string;
  homeownerName?: string;
  homeownerAddress?: string;
  proposalId?: string;
  className?: string;
}

type ContractStatus = "draft" | "sent" | "signed";

const STATUS_COLORS: Record<ContractStatus, string> = {
  draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  sent: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  signed: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function ContractBuilder({
  initialTitle = "Construction Services Agreement",
  initialTradeType = "",
  initialScopeOfWork = "",
  initialLineItems = [{ description: "Labor & Materials", amount: 0 }],
  homeownerId,
  homeownerName: initialHomeownerName = "",
  homeownerAddress: initialHomeownerAddress = "",
  proposalId,
  className,
}: ContractBuilderProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [tradeType, setTradeType] = useState(initialTradeType);
  const [scopeOfWork, setScopeOfWork] = useState(initialScopeOfWork);
  const [lineItems, setLineItems] = useState<ContractLineItem[]>(initialLineItems);
  const [homeownerName, setHomeownerName] = useState(initialHomeownerName);
  const [homeownerAddress, setHomeownerAddress] = useState(initialHomeownerAddress);
  const [startDate, setStartDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [specialConditions, setSpecialConditions] = useState("");

  const [contractorSignature, setContractorSignature] = useState<string | null>(null);
  const [status, setStatus] = useState<ContractStatus>("draft");
  const [contractId, setContractId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = lineItems.reduce((sum, li) => sum + (li.amount || 0), 0);

  const buildContractData = (): ContractData => ({
    title,
    contractorName: user?.user_metadata?.full_name ?? user?.email ?? "Contractor",
    contractorEmail: user?.email,
    homeownerName,
    homeownerAddress,
    tradeType,
    scopeOfWork,
    lineItems,
    startDate: startDate || undefined,
    estimatedCompletionDate: completionDate || undefined,
    warrantyMonths,
    specialConditions: specialConditions || undefined,
  });

  const contractHtml = generateContract(buildContractData());

  const handleAddLineItem = () => {
    setLineItems((prev) => [...prev, { description: "", amount: 0 }]);
  };

  const handleLineItemChange = (index: number, field: keyof ContractLineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((li, i) =>
        i === index ? { ...li, [field]: field === "amount" ? Number(value) : value } : li
      )
    );
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        contractor_id: user.id,
        homeowner_id: homeownerId ?? null,
        proposal_id: proposalId ?? null,
        title,
        trade_type: tradeType,
        total_amount_usd: totalAmount,
        status: "draft" as const,
        contract_html: contractHtml,
        contractor_signature: contractorSignature ?? null,
        metadata: { lineItems, scopeOfWork, warrantyMonths, specialConditions },
      };

      if (contractId) {
        await (supabase as any).from("contracts").update(payload).eq("id", contractId);
      } else {
        const { data, error: insertErr } = await (supabase as any)
          .from("contracts")
          .insert(payload)
          .select("id")
          .single();
        if (insertErr) throw insertErr;
        setContractId(data.id);
      }
      setStatus("draft");
    } catch (err: any) {
      setError(err?.message ?? "Failed to save contract.");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!contractorSignature) {
      setError("Please sign the contract before sending.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      // Save first
      await handleSaveDraft();

      if (contractId) {
        await (supabase as any)
          .from("contracts")
          .update({ status: "sent", sent_at: new Date().toISOString(), contractor_signature: contractorSignature })
          .eq("id", contractId);
        setStatus("sent");

        // Create notification for homeowner if we have their ID
        if (homeownerId) {
          await (supabase as any).from("notifications").insert({
            user_id: homeownerId,
            type: "contract_signed",
            title: `New contract ready for your signature`,
            body: `${title} — ${user?.user_metadata?.full_name ?? "Your contractor"} has sent a contract for your review.`,
            metadata: { contract_id: contractId },
          });
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to send contract.");
    } finally {
      setSending(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([contractHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("border-violet-500/20 bg-[#0f0f1a]", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-violet-300">
            <FileText className="h-5 w-5" />
            Contract Builder
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("text-xs", STATUS_COLORS[status])}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Contract details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Contract Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#16162a] border-violet-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Trade Type</Label>
            <Input
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value)}
              placeholder="e.g. Roofing, Plumbing…"
              className="bg-[#16162a] border-violet-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Homeowner Name</Label>
            <Input
              value={homeownerName}
              onChange={(e) => setHomeownerName(e.target.value)}
              className="bg-[#16162a] border-violet-500/20"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Homeowner Address</Label>
            <Input
              value={homeownerAddress}
              onChange={(e) => setHomeownerAddress(e.target.value)}
              className="bg-[#16162a] border-violet-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#16162a] border-violet-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Estimated Completion</Label>
            <Input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="bg-[#16162a] border-violet-500/20"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Scope of Work</Label>
            <Textarea
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              rows={4}
              placeholder="Describe all work to be performed…"
              className="bg-[#16162a] border-violet-500/20 resize-none"
            />
          </div>
        </div>

        {/* Line items */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Cost Breakdown</Label>
          {lineItems.map((li, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={li.description}
                onChange={(e) => handleLineItemChange(i, "description", e.target.value)}
                placeholder="Description"
                className="flex-1 bg-[#16162a] border-violet-500/20 text-sm"
              />
              <Input
                type="number"
                min={0}
                value={li.amount || ""}
                onChange={(e) => handleLineItemChange(i, "amount", e.target.value)}
                placeholder="Amount ($)"
                className="w-32 bg-[#16162a] border-violet-500/20 text-sm"
              />
              {lineItems.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLineItem(i)}
                  className="text-muted-foreground hover:text-destructive px-2"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddLineItem}
              className="text-violet-400 hover:text-violet-300 text-xs"
            >
              + Add line item
            </Button>
            <span className="text-sm font-semibold text-violet-300">
              Total: ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Special conditions */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Special Conditions (optional)</Label>
          <Textarea
            value={specialConditions}
            onChange={(e) => setSpecialConditions(e.target.value)}
            rows={2}
            className="bg-[#16162a] border-violet-500/20 resize-none text-sm"
          />
        </div>

        {/* Warranty */}
        <div className="space-y-1.5 w-40">
          <Label className="text-xs text-muted-foreground">Warranty (months)</Label>
          <Input
            type="number"
            min={1}
            max={120}
            value={warrantyMonths}
            onChange={(e) => setWarrantyMonths(Number(e.target.value))}
            className="bg-[#16162a] border-violet-500/20"
          />
        </div>

        {/* Signature */}
        <ESignatureCanvas
          label="Your Signature (Contractor)"
          onSign={(dataUrl) => setContractorSignature(dataUrl)}
          onClear={() => setContractorSignature(null)}
          disabled={status === "signed"}
        />

        {/* Preview toggle */}
        <div className="rounded-lg border border-violet-500/20 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#16162a] hover:bg-[#1e1e36] transition-colors text-sm font-medium text-violet-300"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contract Preview
            </span>
            {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showPreview && (
            <div
              className="bg-[#0f0f1a] max-h-[500px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: contractHtml }}
            />
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saving || sending}
            className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 gap-1.5"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Save Draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={saving || sending || status === "sent" || status === "signed"}
            className="bg-violet-600 hover:bg-violet-500 text-white gap-1.5"
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : status === "sent" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {status === "sent" ? "Sent" : "Sign & Send"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="gap-1.5 text-muted-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
