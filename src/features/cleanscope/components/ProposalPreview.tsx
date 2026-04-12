/**
 * ProposalPreview — Step 4 of the CleanScope walkthrough.
 *
 * Renders the client-facing proposal as an HTML preview, allows
 * downloading as a standalone HTML file, and captures internal ops
 * handoff notes (crew size, start date, special instructions).
 */

import { useState, useRef } from 'react';
import { Download, Send, ClipboardList, Eye, EyeOff, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { generateProposalHtml } from '../utils/pricing';
import type { PricingResult } from '../utils/pricing';

interface ProposalPreviewProps {
  companyName: string;
  clientName: string;
  siteAddress: string;
  buildingType: string;
  frequency: string;
  scope: string[];
  pricing: PricingResult | null;
}

interface HandoffNote {
  crewSize: string;
  startDate: string;
  supervisorName: string;
  accessInstructions: string;
  specialInstructions: string;
  equipmentNeeded: string;
}

const DEFAULT_HANDOFF: HandoffNote = {
  crewSize: '',
  startDate: '',
  supervisorName: '',
  accessInstructions: '',
  specialInstructions: '',
  equipmentNeeded: '',
};

export function ProposalPreview({
  companyName,
  clientName,
  siteAddress,
  buildingType,
  frequency,
  scope,
  pricing,
}: ProposalPreviewProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [handoff, setHandoff] = useState<HandoffNote>(DEFAULT_HANDOFF);
  const [handoffSaved, setHandoffSaved] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeScope = scope; // already filtered by ScopeBuilder

  const proposalHtml = pricing
    ? generateProposalHtml({
        companyName: companyName || 'Your Company',
        clientName: clientName || 'Valued Client',
        siteAddress: siteAddress || '—',
        pricing,
        buildingType,
        frequency,
        scope: activeScope,
      })
    : null;

  const handleDownload = () => {
    if (!proposalHtml) return;
    const blob = new Blob([proposalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (clientName || 'proposal').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `cleanscope_proposal_${safeName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.print();
  };

  const updateHandoff = (field: keyof HandoffNote, value: string) => {
    setHandoff(prev => ({ ...prev, [field]: value }));
    setHandoffSaved(false);
  };

  const saveHandoff = () => {
    // In a full implementation this would push to an ops management system / Supabase
    setHandoffSaved(true);
    setTimeout(() => setHandoffSaved(false), 3000);
  };

  const missingFields: string[] = [];
  if (!companyName) missingFields.push('company name');
  if (!clientName) missingFields.push('client name');
  if (!pricing) missingFields.push('pricing (complete Step 2)');
  if (activeScope.length === 0) missingFields.push('scope items');

  return (
    <div className="space-y-5">
      {/* Warnings */}
      {missingFields.length > 0 && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2">
          <p className="text-xs text-amber-600 font-medium">
            Missing fields: {missingFields.join(', ')}
          </p>
          <p className="text-[11px] text-amber-500 mt-0.5">
            Proposal preview will use placeholder values until all fields are filled.
          </p>
        </div>
      )}

      {/* Header actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Client Proposal</h3>
          <p className="text-[11px] text-muted-foreground">
            {activeScope.length} scope items · {pricing
              ? `${pricing.visitsPerMonth} visits/month`
              : 'No pricing yet'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(v => !v)}
            className="text-xs gap-1.5"
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={!proposalHtml || !showPreview}
            className="text-xs gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDownload}
            disabled={!proposalHtml}
            className="text-xs gap-1.5 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download HTML
          </Button>
        </div>
      </div>

      {/* Proposal iframe preview */}
      {showPreview && (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          {proposalHtml ? (
            <iframe
              ref={iframeRef}
              srcDoc={proposalHtml}
              className="w-full"
              style={{ height: '520px', border: 'none' }}
              title="Proposal Preview"
              sandbox="allow-same-origin allow-modals"
            />
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <p className="text-sm">Add areas and set pricing to preview proposal.</p>
            </div>
          )}
        </div>
      )}

      {/* Ops Handoff */}
      <div className="rounded-lg border border-border/60 bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 border-b border-border/40">
          <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Internal Ops Handoff</span>
          <Badge variant="outline" className="text-[10px] ml-auto">Not sent to client</Badge>
        </div>
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Crew Size</Label>
            <Input
              value={handoff.crewSize}
              onChange={e => updateHandoff('crewSize', e.target.value)}
              placeholder="e.g. 2 cleaners"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Start Date</Label>
            <Input
              type="date"
              value={handoff.startDate}
              onChange={e => updateHandoff('startDate', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Supervisor / Lead</Label>
            <Input
              value={handoff.supervisorName}
              onChange={e => updateHandoff('supervisorName', e.target.value)}
              placeholder="e.g. Maria G."
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Site Access Instructions</Label>
            <Input
              value={handoff.accessInstructions}
              onChange={e => updateHandoff('accessInstructions', e.target.value)}
              placeholder="Key code, contact person, parking…"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Special Instructions</Label>
            <Input
              value={handoff.specialInstructions}
              onChange={e => updateHandoff('specialInstructions', e.target.value)}
              placeholder="Fragile items, security zones…"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Equipment Needed</Label>
            <Input
              value={handoff.equipmentNeeded}
              onChange={e => updateHandoff('equipmentNeeded', e.target.value)}
              placeholder="Floor buffer, HEPA vacuum…"
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div className="px-3 pb-3 flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            onClick={saveHandoff}
            className="text-xs gap-1.5 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Send className="h-3.5 w-3.5" />
            Save Handoff Notes
          </Button>
          {handoffSaved && (
            <Badge className="bg-green-500/20 text-green-600 border-green-300 text-[10px]">
              Saved ✓
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
