/**
 * CleanScopeApp — Standalone cleaning-company quoting tool.
 *
 * Full workflow:
 *   Step 1: Capture Areas          (AreaCapture)
 *   Step 2: Scope of Work          (ScopeBuilder)
 *   Step 3: Pricing                (PricingDisplay)
 *   Step 4: Proposal & Handoff     (ProposalPreview)
 *
 * White-label ready: branding driven by props / localStorage.
 * Can be deployed standalone at /cleanscope or embedded in a dashboard.
 */

import { useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AreaCapture } from './components/AreaCapture';
import { ScopeBuilder } from './components/ScopeBuilder';
import { PricingDisplay } from './components/PricingDisplay';
import { ProposalPreview } from './components/ProposalPreview';
import { calculatePricing, BUILDING_SURCHARGE, VISITS_PER_MONTH } from './utils/pricing';
import type { AreaInput, PricingResult } from './utils/pricing';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

interface JobMeta {
  companyName: string;
  clientName: string;
  clientEmail: string;
  siteAddress: string;
  siteCity: string;
  siteState: string;
  siteZip: string;
  buildingType: string;
  frequency: string;
  marginPct: number;
  laborRateOverride: number;
  notes: string;
}

const DEFAULT_META: JobMeta = {
  companyName: '',
  clientName: '',
  clientEmail: '',
  siteAddress: '',
  siteCity: '',
  siteState: '',
  siteZip: '',
  buildingType: 'Office Building',
  frequency: 'Weekly',
  marginPct: 35,
  laborRateOverride: 0,
  notes: '',
};

const STEPS = [
  { id: 1, label: 'Areas',    description: 'Capture every area of the facility' },
  { id: 2, label: 'Scope',    description: 'Generate & refine scope of work' },
  { id: 3, label: 'Pricing',  description: 'Calculate three pricing models' },
  { id: 4, label: 'Proposal', description: 'Preview, download & hand off' },
];

const BUILDING_TYPES = Object.keys(BUILDING_SURCHARGE).filter(k => k !== 'DEFAULT');
const FREQUENCY_OPTIONS = Object.keys(VISITS_PER_MONTH);

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  done ? 'bg-orange-500 text-white' :
                  active ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400' :
                  'bg-muted border border-border text-muted-foreground'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step.id}
              </div>
              <div className="hidden sm:block mt-1 text-center">
                <p className={cn('text-[10px] font-semibold', active ? 'text-orange-400' : 'text-muted-foreground')}>
                  {step.label}
                </p>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                'h-0.5 w-8 sm:w-16 mx-0.5 transition-all',
                done ? 'bg-orange-500' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Meta form (shown at the top on every step) ──────────────────────────────

function MetaForm({ meta, onChange }: { meta: JobMeta; onChange: (m: JobMeta) => void }) {
  const set = (field: keyof JobMeta, value: string | number) =>
    onChange({ ...meta, [field]: value });

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Job Details</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Your Company Name *</Label>
          <Input
            value={meta.companyName}
            onChange={e => set('companyName', e.target.value)}
            placeholder="ABC Cleaning Co."
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Client / Prospect Name *</Label>
          <Input
            value={meta.clientName}
            onChange={e => set('clientName', e.target.value)}
            placeholder="Acme Corporation"
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Client Email</Label>
          <Input
            type="email"
            value={meta.clientEmail}
            onChange={e => set('clientEmail', e.target.value)}
            placeholder="contact@acme.com"
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-[11px] text-muted-foreground">Site Address</Label>
          <Input
            value={meta.siteAddress}
            onChange={e => set('siteAddress', e.target.value)}
            placeholder="123 Main St, Suite 400"
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">City / State / ZIP</Label>
          <div className="flex gap-1">
            <Input
              value={meta.siteCity}
              onChange={e => set('siteCity', e.target.value)}
              placeholder="City"
              className="h-8 text-xs flex-1"
            />
            <Input
              value={meta.siteState}
              onChange={e => set('siteState', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="CA"
              className="h-8 text-xs w-14"
              maxLength={2}
            />
            <Input
              value={meta.siteZip}
              onChange={e => set('siteZip', e.target.value)}
              placeholder="ZIP"
              className="h-8 text-xs w-20"
              maxLength={5}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Building Type</Label>
          <select
            value={meta.buildingType}
            onChange={e => set('buildingType', e.target.value)}
            className="w-full h-8 text-xs border border-input bg-background rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          >
            {BUILDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Service Frequency</Label>
          <select
            value={meta.frequency}
            onChange={e => set('frequency', e.target.value)}
            className="w-full h-8 text-xs border border-input bg-background rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          >
            {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Target Margin %</Label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={5}
              max={70}
              step={1}
              value={meta.marginPct}
              onChange={e => set('marginPct', parseInt(e.target.value))}
              className="flex-1 accent-orange-500"
            />
            <span className="text-xs font-semibold text-orange-400 w-8">{meta.marginPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export function CleanScopeApp() {
  const [step, setStep] = useState(1);
  const [meta, setMeta] = useState<JobMeta>(DEFAULT_META);
  const [areas, setAreas] = useState<AreaInput[]>([]);
  const [scope, setScope] = useState<string[]>([]);
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);

  // Recompute pricing whenever relevant meta or areas change
  const recomputePricing = useCallback((
    currentAreas: AreaInput[],
    currentMeta: JobMeta
  ) => {
    if (currentAreas.length === 0) { setPricingResult(null); return; }
    const result = calculatePricing({
      areas: currentAreas,
      buildingType: currentMeta.buildingType,
      frequency: currentMeta.frequency,
      stateAbbr: currentMeta.siteState,
      marginPct: currentMeta.marginPct,
      laborRateOverride: currentMeta.laborRateOverride,
    });
    setPricingResult(result);
  }, []);

  const handleAreasChange = (next: AreaInput[]) => {
    setAreas(next);
    recomputePricing(next, meta);
  };

  const handleMetaChange = (next: JobMeta) => {
    setMeta(next);
    recomputePricing(areas, next);
  };

  const canAdvance = () => {
    if (step === 1) return areas.length > 0 && areas.every(a => a.name && a.sqft > 0);
    if (step === 2) return scope.length > 0;
    if (step === 3) return pricingResult !== null;
    return true;
  };

  const fullAddress = [meta.siteAddress, meta.siteCity, meta.siteState, meta.siteZip]
    .filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-background">
      {/* App header */}
      <div className="border-b border-border/60 bg-card/50 px-4 py-3 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">CleanScope</span>
              <Badge variant="outline" className="ml-2 text-[10px]">Beta</Badge>
            </div>
          </div>
          <StepIndicator current={step} />
          <div className="hidden sm:block text-right">
            <p className="text-[11px] font-medium text-foreground">{STEPS[step - 1].label}</p>
            <p className="text-[10px] text-muted-foreground">{STEPS[step - 1].description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Job meta — always visible */}
        <MetaForm meta={meta} onChange={handleMetaChange} />

        {/* Step content */}
        <div className="rounded-lg border border-border/60 bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
              {step}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{STEPS[step - 1].label}</h2>
              <p className="text-[11px] text-muted-foreground">{STEPS[step - 1].description}</p>
            </div>
          </div>

          {step === 1 && (
            <AreaCapture areas={areas} onChange={handleAreasChange} />
          )}

          {step === 2 && (
            <ScopeBuilder areas={areas} scope={scope} onChange={setScope} />
          )}

          {step === 3 && (
            <PricingDisplay
              areas={areas}
              onPricingChange={(result) => setPricingResult(result)}
            />
          )}

          {step === 4 && (
            <ProposalPreview
              companyName={meta.companyName}
              clientName={meta.clientName}
              siteAddress={fullAddress}
              buildingType={meta.buildingType}
              frequency={meta.frequency}
              scope={scope}
              pricing={pricingResult}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="gap-1.5 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </Button>

          {/* Quick summary strip */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
            {areas.length > 0 && (
              <span>{areas.length} area{areas.length !== 1 ? 's' : ''} · {areas.reduce((s, a) => s + (a.sqft || 0), 0).toLocaleString()} sq ft</span>
            )}
            {pricingResult && (
              <span className="text-orange-400 font-semibold">
                ${pricingResult.monthlyPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo
              </span>
            )}
          </div>

          {step < STEPS.length ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setStep(s => Math.min(STEPS.length, s + 1))}
              disabled={!canAdvance()}
              className="gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white"
            >
              Next: {STEPS[step].label}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setStep(1);
                setAreas([]);
                setScope([]);
                setMeta(DEFAULT_META);
                setPricingResult(null);
              }}
              variant="outline"
              className="gap-1.5 text-xs"
            >
              Start New Quote
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
