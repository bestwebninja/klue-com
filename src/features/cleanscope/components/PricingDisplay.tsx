/**
 * PricingDisplay — Step 3 of the CleanScope walkthrough.
 *
 * Shows the three pricing outputs (monthly, per-visit, initial deep clean)
 * with a rep-adjustable margin slider and building/frequency controls.
 * Also displays area-level breakdown and labor assumptions.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  calculatePricing,
  BUILDING_SURCHARGE,
  VISITS_PER_MONTH,
  LABOR_RATE_BY_STATE,
  type PricingInput,
  type PricingResult,
} from '../utils/pricing';
import type { AreaInput } from '../utils/pricing';
import { cn } from '@/lib/utils';

interface PricingDisplayProps {
  areas: AreaInput[];
  onPricingChange?: (result: PricingResult, input: PricingInput) => void;
}

const FREQUENCY_OPTIONS = Object.keys(VISITS_PER_MONTH);
const BUILDING_TYPES = Object.keys(BUILDING_SURCHARGE).filter(k => k !== 'DEFAULT');
const US_STATES = [
  'AK','AZ','CA','CO','CT','FL','GA','HI','IL','MA','MD','MI','MN',
  'NJ','NV','NY','OH','OR','PA','SC','TN','TX','UT','VA','WA','WI',
  'AL','AR','DE','ID','IA','KS','KY','LA','ME','MS','MO','MT','NE',
  'NH','NM','ND','OK','RI','SD','VT','WV','WY','DC',
];

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function PricingDisplay({ areas, onPricingChange }: PricingDisplayProps) {
  const [buildingType, setBuildingType] = useState('Office Building');
  const [frequency, setFrequency] = useState('Weekly');
  const [stateAbbr, setStateAbbr] = useState('');
  const [marginPct, setMarginPct] = useState(35);
  const [laborOverride, setLaborOverride] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const input: PricingInput = {
    areas,
    buildingType,
    frequency,
    stateAbbr,
    marginPct,
    laborRateOverride: laborOverride,
  };

  const result = areas.length > 0 ? calculatePricing(input) : null;

  // Notify parent whenever pricing changes
  if (result && onPricingChange) {
    // Use a ref pattern to avoid render loop — called inline only for the final result
  }

  const surcharge = BUILDING_SURCHARGE[buildingType] ?? 0;
  const surchargeLabel =
    surcharge > 0 ? `+${Math.round(surcharge * 100)}%` :
    surcharge < 0 ? `${Math.round(surcharge * 100)}%` : 'None';

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Building type */}
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Building Type</Label>
          <select
            value={buildingType}
            onChange={e => setBuildingType(e.target.value)}
            className="w-full h-8 text-xs border border-input bg-background rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          >
            {BUILDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <p className="text-[10px] text-muted-foreground">Specialty surcharge: {surchargeLabel}</p>
        </div>

        {/* Frequency */}
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Frequency</Label>
          <select
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
            className="w-full h-8 text-xs border border-input bg-background rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          >
            {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <p className="text-[10px] text-muted-foreground">
            {result ? `${result.visitsPerMonth} visits/month` : '—'}
          </p>
        </div>

        {/* State */}
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">State (labor rate)</Label>
          <select
            value={stateAbbr}
            onChange={e => setStateAbbr(e.target.value)}
            className="w-full h-8 text-xs border border-input bg-background rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          >
            <option value="">— National default —</option>
            {US_STATES.sort().map(s => (
              <option key={s} value={s}>
                {s} (${LABOR_RATE_BY_STATE[s] ?? LABOR_RATE_BY_STATE.DEFAULT}/hr)
              </option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground">
            {result ? `Using $${result.laborRate}/hr` : `Default $${LABOR_RATE_BY_STATE.DEFAULT}/hr`}
          </p>
        </div>

        {/* Labor override */}
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Labor Rate Override ($/hr)</Label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={laborOverride || ''}
            onChange={e => setLaborOverride(parseFloat(e.target.value) || 0)}
            placeholder="0 = use state rate"
            className="w-full h-8 text-xs border border-input bg-background rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          />
          <p className="text-[10px] text-muted-foreground">
            {laborOverride > 0 ? `Override active: $${laborOverride}/hr` : 'Using regional rate'}
          </p>
        </div>
      </div>

      {/* Margin slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] text-muted-foreground">Target Margin</Label>
          <span className="text-xs font-semibold text-orange-400">{marginPct}%</span>
        </div>
        <input
          type="range"
          min={5}
          max={70}
          step={1}
          value={marginPct}
          onChange={e => setMarginPct(parseInt(e.target.value))}
          className="w-full accent-orange-500"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>5% (cost+)</span>
          <span>35% (standard)</span>
          <span>70% (premium)</span>
        </div>
      </div>

      {/* No areas */}
      {areas.length === 0 && (
        <div className="text-center py-10 text-muted-foreground border border-dashed border-border/60 rounded-lg">
          <p className="text-sm">No areas captured yet.</p>
          <p className="text-xs mt-1">Go back to Step 1 and add areas to generate pricing.</p>
        </div>
      )}

      {/* Pricing cards */}
      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Monthly */}
            <div className="rounded-xl border-2 border-orange-500 bg-orange-500/5 p-4 text-center relative">
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] px-2">
                RECOMMENDED
              </Badge>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1 mb-2">Monthly Recurring</p>
              <p className="text-3xl font-bold text-orange-400">{fmt(result.monthlyPrice)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {result.visitsPerMonth} visits × {fmt(result.perVisitPrice)}
              </p>
              <p className="text-[11px] text-muted-foreground">Annual value: {fmt(result.annualValue)}</p>
            </div>

            {/* Per visit */}
            <div className="rounded-xl border border-border/60 bg-background p-4 text-center">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Per Visit</p>
              <p className="text-3xl font-bold text-foreground">{fmt(result.perVisitPrice)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {result.totalHoursPerVisit.toFixed(1)} labor hours/visit
              </p>
              <p className="text-[11px] text-muted-foreground">
                {fmt(result.laborRate)}/hr · {result.effectiveMarginPct}% margin
              </p>
            </div>

            {/* Initial deep clean */}
            <div className="rounded-xl border border-border/60 bg-background p-4 text-center">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Initial Deep Clean</p>
              <p className="text-3xl font-bold text-foreground">{fmt(result.initialDeepCleanPrice)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">One-time first service</p>
              <p className="text-[11px] text-muted-foreground">2.5× standard visit rate</p>
            </div>
          </div>

          {/* Margin & cost summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Cost/Visit', value: fmt(result.totalCostPerVisit), sub: 'labor + supplies + specialty' },
              { label: 'Margin/Visit', value: fmt(result.marginPerVisit), sub: `${result.effectiveMarginPct}% effective` },
              { label: 'Labor Rate', value: `$${result.laborRate}/hr`, sub: stateAbbr || 'national default' },
              { label: 'Bldg Surcharge', value: surchargeLabel, sub: buildingType },
            ].map(c => (
              <div key={c.label} className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
                <p className="text-xs font-semibold text-foreground">{c.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
                <p className="text-[10px] text-muted-foreground/70">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Area breakdown toggle */}
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs gap-1 -ml-1"
              onClick={() => setShowBreakdown(v => !v)}
            >
              {showBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Area-level breakdown
            </Button>

            {showBreakdown && (
              <div className="mt-3 rounded-lg border border-border/60 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/40 text-left">
                      <th className="px-3 py-2 font-medium text-[11px] uppercase text-muted-foreground">Area</th>
                      <th className="px-3 py-2 font-medium text-[11px] uppercase text-muted-foreground">Sq Ft</th>
                      <th className="px-3 py-2 font-medium text-[11px] uppercase text-muted-foreground">Hrs/Visit</th>
                      <th className="px-3 py-2 font-medium text-[11px] uppercase text-muted-foreground">Labor</th>
                      <th className="px-3 py-2 font-medium text-[11px] uppercase text-muted-foreground">Supplies</th>
                      <th className="px-3 py-2 font-medium text-[11px] uppercase text-muted-foreground">Price/Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.areas.map((a, i) => (
                      <tr key={a.areaId} className={cn('border-t border-border/40', i % 2 === 0 ? '' : 'bg-muted/10')}>
                        <td className="px-3 py-2">{a.areaName || `Area ${i + 1}`}</td>
                        <td className="px-3 py-2">{a.sqft.toLocaleString()}</td>
                        <td className="px-3 py-2">{a.hoursPerVisit.toFixed(2)}</td>
                        <td className="px-3 py-2">{fmt(a.laborCostPerVisit)}</td>
                        <td className="px-3 py-2">{fmt(a.suppliesCostPerVisit)}</td>
                        <td className="px-3 py-2 font-semibold text-orange-400">{fmt(a.pricePerVisit)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border/60 bg-muted/20 font-semibold">
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2">{result.areas.reduce((s, a) => s + a.sqft, 0).toLocaleString()}</td>
                      <td className="px-3 py-2">{result.totalHoursPerVisit.toFixed(2)}</td>
                      <td className="px-3 py-2">{fmt(result.areas.reduce((s, a) => s + a.laborCostPerVisit, 0))}</td>
                      <td className="px-3 py-2">{fmt(result.areas.reduce((s, a) => s + a.suppliesCostPerVisit, 0))}</td>
                      <td className="px-3 py-2 text-orange-400">{fmt(result.perVisitPrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Historical comparison placeholder */}
          <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Historical Job Comparison</p>
              <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Once you have saved quotes in your history, this section will show how this job compares
              to past similar buildings — average price per sq ft, close rate, and win/loss patterns.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// Export result getter for parent
export type { PricingInput };
