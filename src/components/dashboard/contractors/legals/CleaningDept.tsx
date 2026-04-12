/**
 * CleaningDept — Legals > Cleaning department.
 *
 * Auto-populates from the platform-wide QuoteContext when a
 * cleaning quote has been started from My Quotes.
 *
 * Pricing models (all three shown):
 *   - Monthly Recurring contract
 *   - Per-Visit price
 *   - One-Time Initial / Deep Clean
 *
 * Quantitative surveyor risk model:
 *   - Surface-type multipliers (carpet/tile/marble/hardwood/VCT)
 *   - Traffic-level adjustments (low/moderate/high/heavy)
 *   - Restroom fixture count costing
 *   - High-touch / medical / food service surcharges
 *   - Regional labor rate index (state-based)
 *
 * Connects back to My Quotes form and WeatherWidget.
 */

import { useState, useEffect } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SectionCard, StatusBadge, SimpleBarChart,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Building2, Calculator, RefreshCw, Globe2 } from 'lucide-react';
import { useQuote } from '@/context/QuoteContext';
import { useWeather } from '@/hooks/useWeather';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { useLanguage } from '@/hooks/useLanguage';

// ─── Regional labor index ($/hour for cleaning labor by state) ───────────
const LABOR_RATE: Record<string, number> = {
  CA: 22, NY: 21, WA: 20, MA: 19, CO: 18, OR: 17, IL: 17, NJ: 20,
  TX: 14, FL: 15, AZ: 14, TN: 13, GA: 14, NC: 13, SC: 13, NV: 15,
  DEFAULT: 15,
};

// ─── Building type dropdown (concise) ─────────────────────────────────────
const BUILDING_TYPES = [
  'Office Building', 'Retail Store', 'Restaurant / Food Service',
  'Medical / Healthcare', 'School / Educational', 'Warehouse / Industrial',
  'Apartment Complex', 'Single-Family Home', 'Condo / HOA Common Areas',
  'Government / Municipal', 'Hotel / Hospitality', 'Gym / Fitness Center',
  'Church / Place of Worship', 'Auto Dealership', 'Post-Construction',
];

// ─── Floor type multipliers (labor time × sqft) ───────────────────────────
const FLOOR_MULTIPLIERS: Record<string, number> = {
  'Carpet': 1.0, 'Tile / Grout': 1.35, 'Hardwood': 1.15, 'VCT / Vinyl': 1.05,
  'Marble / Stone': 1.50, 'Epoxy / Sealed Concrete': 0.90, 'Mixed': 1.20,
};

const FREQUENCY_OPTIONS = [
  'Daily (5x/week)', 'Daily (7x/week)', '3x / week',
  'Twice a week', 'Weekly', 'Bi-Weekly', 'Monthly', 'One-Time',
];

const FREQ_VISITS_PER_MONTH: Record<string, number> = {
  'Daily (5x/week)': 22, 'Daily (7x/week)': 30, '3x / week': 13,
  'Twice a week': 9, 'Weekly': 4, 'Bi-Weekly': 2, 'Monthly': 1, 'One-Time': 1,
};

const TRAFFIC_SURCHARGE: Record<string, number> = {
  'Low': 0, 'Moderate': 0.10, 'High': 0.20, 'Heavy': 0.35,
};

const WIN_LOSS_CHART = [
  { label: 'Won (price competitive)', value: '61%', pct: 61 },
  { label: 'Lost — price too high',   value: '22%', pct: 22 },
  { label: 'Lost — responsiveness',   value: '11%', pct: 11 },
  { label: 'Expired / no decision',   value: '6%',  pct: 6  },
];

interface CleaningForm {
  quoteNo: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  siteAddress: string;
  siteZip: string;
  buildingType: string;
  floorType: string;
  sqft: string;
  restrooms: string;
  restroomFixtures: string;
  trafficLevel: string;
  frequency: string;
  specialRequirements: string;
  notes: string;
  laborRateOverride: string;
  marginPct: string;
  medicalSurcharge: boolean;
  foodServiceSurcharge: boolean;
  postConSurcharge: boolean;
}

const DEFAULT_FORM: CleaningForm = {
  quoteNo: '', clientName: '', clientPhone: '', clientEmail: '',
  siteAddress: '', siteZip: '',
  buildingType: '', floorType: 'Carpet', sqft: '', restrooms: '1',
  restroomFixtures: '2', trafficLevel: 'Moderate', frequency: 'Weekly',
  specialRequirements: '', notes: '',
  laborRateOverride: '', marginPct: '20',
  medicalSurcharge: false, foodServiceSurcharge: false, postConSurcharge: false,
};

function extractStateFromZip(_zip: string): string {
  // Simplified — in production you'd do a ZIP lookup
  return 'FL'; // default
}

export default function CleaningDept({ onBack }: { onBack: () => void }) {
  const { quote } = useQuote();
  const { t, lang, toggleLang } = useLanguage();
  const [form, setForm] = useState<CleaningForm>(DEFAULT_FORM);

  // Auto-populate from quote context when cleaning data is present
  useEffect(() => {
    if (quote.clientName && quote.clientName !== form.clientName) {
      setForm((prev) => ({
        ...prev,
        quoteNo: quote.quoteNo || prev.quoteNo,
        clientName: quote.clientName,
        clientPhone: quote.clientPhone,
        clientEmail: quote.clientEmail,
        siteAddress: quote.siteAddress,
        siteZip: quote.siteZip,
        buildingType: quote.buildingType || prev.buildingType,
        sqft: quote.cleaningAreasSqft || quote.squareFootage || prev.sqft,
        frequency: quote.cleaningFrequency || prev.frequency,
        specialRequirements: quote.cleaningSpecialRequirements || prev.specialRequirements,
      }));
    }
  }, [quote.clientName]);

  const { weather } = useWeather(form.siteZip || null);

  const set = (k: keyof CleaningForm) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  // ─── Quantitative pricing model ─────────────────────────────────────────
  const sqft = parseFloat(form.sqft) || 0;
  const restrooms = parseInt(form.restrooms) || 0;
  const fixtures = parseInt(form.restroomFixtures) || 0;
  const state = extractStateFromZip(form.siteZip);
  const baseRate = parseFloat(form.laborRateOverride) || (LABOR_RATE[state] ?? LABOR_RATE.DEFAULT);
  const margin = (parseFloat(form.marginPct) || 20) / 100;

  const floorMult = FLOOR_MULTIPLIERS[form.floorType] ?? 1.0;
  const trafficMult = 1 + (TRAFFIC_SURCHARGE[form.trafficLevel] ?? 0.10);
  const specialMult =
    (form.medicalSurcharge ? 1.25 : 1.0) *
    (form.foodServiceSurcharge ? 1.15 : 1.0) *
    (form.postConSurcharge ? 1.40 : 1.0);

  // Time model: 1 cleaner can clean ~2,200 sqft/hour for standard offices
  const CLEANING_SPEED_SQFT_PER_HOUR = 2200;
  const cleaningHours = (sqft / CLEANING_SPEED_SQFT_PER_HOUR) * floorMult * trafficMult;
  const restroomHours = restrooms * fixtures * 0.08; // 5 min per fixture
  const totalHoursPerVisit = cleaningHours + restroomHours;

  const laborCostPerVisit = totalHoursPerVisit * baseRate;
  const suppliesCostPerVisit = sqft * 0.005; // ~$0.005/sqft for supplies
  const costPerVisit = (laborCostPerVisit + suppliesCostPerVisit) * specialMult;
  const pricePerVisit = costPerVisit / (1 - margin);

  const visitsPerMonth = FREQ_VISITS_PER_MONTH[form.frequency] ?? 4;
  const monthlyPrice = pricePerVisit * visitsPerMonth;

  // Initial deep clean: 2.5× a regular visit
  const initialDeepCleanPrice = pricePerVisit * 2.5;

  const fmt = (n: number) =>
    n > 0 ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

  const KPIS: KpiItem[] = [
    { label: 'Monthly Contract',    value: sqft > 0 ? fmt(monthlyPrice) : '—',         sub: `${visitsPerMonth} visits/month`,  trend: 'up'     },
    { label: 'Per-Visit Price',      value: sqft > 0 ? fmt(pricePerVisit) : '—',        sub: `${totalHoursPerVisit.toFixed(1)} hrs / visit`, trend: 'neutral' },
    { label: 'Initial Deep Clean',   value: sqft > 0 ? fmt(initialDeepCleanPrice) : '—',sub: 'First service surcharge',         trend: 'neutral' },
    { label: 'Gross Margin',         value: `${Math.round(margin * 100)}%`,             sub: 'After labor & supplies',          trend: 'up'     },
  ];

  const AI_TIPS: AiTip[] = [
    { text: t('Monthly contracts with auto-renewal clauses have 40% higher LTV. Include an auto-renewal in every commercial proposal.'), action: t('Add Clause') },
    { text: `${t('Based on')} ${sqft || '—'} sq ft @ ${form.frequency}, ${t('your labor efficiency is optimized for a 2-person team.')}` },
    { text: t('Medical/healthcare facilities carry 25% surcharge — ensure your quote includes it and mention OSHA compliance in the proposal.') },
    { text: `${t('Post-construction cleaning in your ZIP')} ${form.siteZip || '(enter ZIP)'}: ${weather?.riskFlags?.summary ?? t('enter ZIP for weather context')}`, action: t('View Weather') },
  ];

  return (
    <DeptShell
      title={t('Cleaning')}
      icon={Sparkles}
      kpis={KPIS}
      aiTips={AI_TIPS}
      weatherWarning={
        weather && weather.riskFlags.level !== 'low'
          ? weather.riskFlags.summary
          : undefined
      }
      onBack={onBack}
    >
      {/* ── Language toggle ── */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLang}
          className="gap-1.5 text-xs border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
        >
          <Globe2 className="h-3.5 w-3.5" />
          {lang === 'en' ? 'Español' : 'English'}
        </Button>
      </div>

      {/* ── Auto-populate notice ── */}
      {quote.clientName && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          <RefreshCw className="h-3.5 w-3.5 shrink-0" />
          {t('Auto-populated from My Quotes')}: <strong>{quote.clientName}</strong> · {quote.siteZip}
        </div>
      )}

      {/* ── Quote form ── */}
      <SectionCard title={t('New Cleaning Quote')}>
        <div className="space-y-4">
          <FieldGroup>
            <Field label={t('Quote #')} hint="Auto-generated or from My Quotes">
              <Input value={form.quoteNo} onChange={e => set('quoteNo')(e.target.value)} placeholder="Q-2026-032" />
            </Field>
            <Field label={t('Client Name')} required>
              <Input value={form.clientName} onChange={e => set('clientName')(e.target.value)} placeholder="Company or person name" />
            </Field>
            <Field label={t('Client Phone')}>
              <Input type="tel" value={form.clientPhone} onChange={e => set('clientPhone')(e.target.value)} placeholder="(305) 555-0000" />
            </Field>
            <Field label={t('Client Email')}>
              <Input type="email" value={form.clientEmail} onChange={e => set('clientEmail')(e.target.value)} placeholder="client@email.com" />
            </Field>
            <Field label={t('Property Address')} fullWidth>
              <Input value={form.siteAddress} onChange={e => set('siteAddress')(e.target.value)} placeholder="Street address" />
            </Field>
            <Field label={t('Zip Code')} hint={t('Pulls weather & regional labor rates')}>
              <Input value={form.siteZip} onChange={e => set('siteZip')(e.target.value)} placeholder="33101" maxLength={5} />
            </Field>
          </FieldGroup>

          {/* Building type */}
          <FieldGroup>
            <Field label={t('Building Type')} required>
              <SelectField
                placeholder="Select building type"
                options={BUILDING_TYPES}
                value={form.buildingType}
                onChange={set('buildingType')}
              />
            </Field>
            <Field label={t('Floor Type')} hint={t('Affects labor time multiplier')}>
              <SelectField
                options={Object.keys(FLOOR_MULTIPLIERS)}
                value={form.floorType}
                onChange={set('floorType')}
              />
            </Field>
            <Field label={`${t('Square Footage')} (sq ft)`} required hint={t('Total cleanable area')}>
              <Input type="number" value={form.sqft} onChange={e => set('sqft')(e.target.value)} placeholder="2500" />
            </Field>
            <Field label={t('Traffic Level')} hint={t('Higher traffic = more frequent cleaning needed')}>
              <SelectField
                options={['Low', 'Moderate', 'High', 'Heavy'].map(t)}
                value={t(form.trafficLevel)}
                onChange={(v) => {
                  const key = ['Low', 'Moderate', 'High', 'Heavy'].find(k => t(k) === v) ?? v;
                  set('trafficLevel')(key);
                }}
              />
            </Field>
            <Field label={t('Restrooms')} hint={t('Number of restrooms to service')}>
              <Input type="number" min="0" value={form.restrooms} onChange={e => set('restrooms')(e.target.value)} placeholder="2" />
            </Field>
            <Field label={t('Fixtures per Restroom')} hint={t('Toilets + sinks + urinals')}>
              <Input type="number" min="1" value={form.restroomFixtures} onChange={e => set('restroomFixtures')(e.target.value)} placeholder="3" />
            </Field>
            <Field label={t('Cleaning Frequency')} required>
              <SelectField
                options={FREQUENCY_OPTIONS}
                value={form.frequency}
                onChange={set('frequency')}
              />
            </Field>
          </FieldGroup>

          {/* Surcharges */}
          <div className="rounded-lg border border-border/60 p-4">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('Specialty Surcharges')}</div>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'medicalSurcharge', label: t('Medical / Healthcare +25%'), flag: form.medicalSurcharge },
                { key: 'foodServiceSurcharge', label: t('Food Service +15%'), flag: form.foodServiceSurcharge },
                { key: 'postConSurcharge', label: t('Post-Construction +40%'), flag: form.postConSurcharge },
              ].map(({ key, label, flag }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={flag}
                    onChange={(e) => set(key as keyof CleaningForm)(e.target.checked)}
                    className="h-4 w-4 aspect-square rounded border border-input accent-orange-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Pricing overrides */}
          <FieldGroup>
            <Field label={t('Labor Rate Override ($/hr)')} hint={`${t('Regional default')}: $${baseRate}/hr (${state})`}>
              <Input
                type="number"
                value={form.laborRateOverride}
                onChange={e => set('laborRateOverride')(e.target.value)}
                placeholder={String(baseRate)}
              />
            </Field>
            <Field label={t('Profit Margin %')} hint={t('Industry avg: 18-25% for commercial cleaning')}>
              <Input type="number" value={form.marginPct} onChange={e => set('marginPct')(e.target.value)} placeholder="20" />
            </Field>
          </FieldGroup>

          {/* ── Pricing Summary ── */}
          {sqft > 0 && (
            <div className="rounded-lg bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/40 p-4">
              <div className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-3">
                <Calculator className="inline h-3.5 w-3.5 mr-1" />
                {t('Cleaning Pricing — Quantitative Model')}
              </div>

              {/* Pricing model display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: t('Monthly Recurring'), value: fmt(monthlyPrice), sub: `${visitsPerMonth} visits × ${fmt(pricePerVisit)}`, highlight: true },
                  { label: t('Per-Visit Price'), value: fmt(pricePerVisit), sub: `${totalHoursPerVisit.toFixed(1)} labor hrs + supplies` },
                  { label: t('Initial Deep Clean'), value: fmt(initialDeepCleanPrice), sub: `First service (2.5× visit rate)` },
                ].map(({ label, value, sub, highlight }) => (
                  <div
                    key={label}
                    className={`rounded-lg p-3 border ${highlight ? 'border-orange-400/60 bg-orange-50 dark:bg-orange-950/30' : 'border-border/60 bg-muted/30'}`}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
                    <div className={`text-xl font-bold mt-1 ${highlight ? 'text-orange-600' : 'text-foreground'}`}>{value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Assumption breakdown */}
              <div className="space-y-1.5 text-[11px]">
                {[
                  [`${t('Area')}`, `${sqft.toLocaleString()} sq ft @ ${form.floorType} (×${floorMult.toFixed(2)})`],
                  [`${t('Traffic')}`, `${t(form.trafficLevel)} (+${Math.round(TRAFFIC_SURCHARGE[form.trafficLevel] * 100)}%)`],
                  [`${t('Labor')}`, `${totalHoursPerVisit.toFixed(1)} hrs × $${baseRate}/hr = ${fmt(laborCostPerVisit)}`],
                  [`${t('Supplies')}`, `${fmt(suppliesCostPerVisit)} ($0.005/sq ft)`],
                  [`${t('Specialty')} ×`, specialMult.toFixed(2)],
                  [`${t('Margin')} ${Math.round(margin * 100)}%`, fmt(pricePerVisit - costPerVisit)],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Field label={t('Special Requirements')} fullWidth>
            <textarea
              value={form.specialRequirements}
              onChange={e => set('specialRequirements')(e.target.value)}
              rows={3}
              className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder={t('e.g. Eco-friendly products, hospital-grade disinfectants, biohazard areas, high-security zones...')}
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">
              {t('Generate Quote PDF')}
            </Button>
            <Button variant="outline" className="text-xs h-8">{t('Send to Client')}</Button>
            <Button variant="secondary" className="text-xs h-8">{t('Convert to Contract')}</Button>
            <Button variant="ghost" className="text-xs h-8">{t('Save Draft')}</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Weather context ── */}
      {form.siteZip && /^\d{5}$/.test(form.siteZip) && (
        <SectionCard title={`${t('Weather')} — ${form.siteZip}`}>
          <WeatherWidget zip={form.siteZip} />
        </SectionCard>
      )}

      {/* ── Win/loss ── */}
      <SectionCard title={t('Win / Loss Analysis — Cleaning Contracts')}>
        <SimpleBarChart data={WIN_LOSS_CHART} colorClass="bg-orange-400" />
      </SectionCard>

      {/* ── Building type guide ── */}
      <SectionCard title={t('Building Type — Pricing Guidance')}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">{t('Building Type')}</th>
                <th className="text-left py-2 pr-3 font-medium">{t('Typical Rate')}</th>
                <th className="text-left py-2 font-medium">{t('Key Notes')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Office Building',          '$0.08–0.12/sqft/visit',  'Standard scope; add deep clean quarterly'],
                ['Medical / Healthcare',     '$0.14–0.22/sqft/visit',  'OSHA/EPA compliant products required'],
                ['Restaurant / Food Service','$0.15–0.25/sqft/visit',  'Hood, grease trap, health dept standard'],
                ['Warehouse / Industrial',   '$0.04–0.08/sqft/visit',  'Sweeping + occasional scrub; quick win'],
                ['Post-Construction',        '$0.25–0.60/sqft (one)',  'Debris removal + detail; highest margin'],
                ['Apartment Common Areas',   '$0.09–0.15/sqft/visit',  'Reliable recurring; often annual contract'],
              ].map(([type, rate, note], i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30">
                  <td className="py-2 pr-3 font-medium">{t(type as string)}</td>
                  <td className="py-2 pr-3 text-orange-500 font-semibold">{rate}</td>
                  <td className="py-2 text-muted-foreground">{t(note as string)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </DeptShell>
  );
}
