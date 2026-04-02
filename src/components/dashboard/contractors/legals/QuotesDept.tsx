import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Upload, ExternalLink, Calculator } from 'lucide-react';

const KPIS: KpiItem[] = [
  { label: 'Quotes Outstanding',  value: '9',       sub: '$340k pipeline',            trend: 'up'     },
  { label: 'Win Rate',            value: '54%',     sub: '↑ 6% from last quarter',    trend: 'up'     },
  { label: 'Avg Quote Value',     value: '$38,200', sub: 'Residential avg',           trend: 'neutral'},
  { label: 'Expiring This Week',  value: '3',       sub: 'Client follow-up needed',   trend: 'down'   },
];

const AI_TIPS: AiTip[] = [
  {
    text: 'Quote #Q-2026-031 for 221 Oak Ave has been unopened for 5 days. AI recommends a follow-up call — win probability drops 40% after 7 days.',
    action: 'Call Client',
  },
  {
    text: 'Material costs for lumber (2×6) have risen 8% in the past 30 days (PPI index data). Update material line items in open quotes.',
    action: 'Update Costs',
  },
  {
    text: 'Based on your win/loss history, quotes with itemized breakdowns have a 67% win rate vs 41% for lump-sum. AI suggests switching quote #Q-031 to itemized.',
    action: 'Reformat Quote',
  },
  {
    text: 'Property at quote address 8301 Brickell Ave: Zillow-equivalent AVM shows $520k. Heavy rehab scope at $185k quoted suggests strong ARV play. Share investment analysis with client?',
    action: 'Send Analysis',
  },
];

const PIPELINE = [
  { client: 'Marcus Reid',    address: '221 Oak Ave',         value: '$52,000', expiry: '2026-04-02', status: 'Sent' as const,        color: 'blue'  as const },
  { client: 'Sandra Torres',  address: '8301 Brickell Ave',    value: '$185,000',expiry: '2026-04-08', status: 'Opened' as const,      color: 'green' as const },
  { client: 'Kevin Walsh',    address: '1102 NW 14th St',      value: '$27,500', expiry: '2026-03-30', status: 'Expiring' as const,    color: 'amber' as const },
  { client: 'Diane Cooper',   address: '450 Coral Way',        value: '$61,200', expiry: '2026-04-15', status: 'Draft' as const,       color: 'gray'  as const },
  { client: 'Jorge Fuentes',  address: '3300 Flagler St',      value: '$18,900', expiry: '2026-03-28', status: 'Expiring' as const,    color: 'amber' as const },
];

const WIN_LOSS_CHART = [
  { label: 'Won',             value: '54%', pct: 54 },
  { label: 'Lost — price',    value: '28%', pct: 28 },
  { label: 'Lost — timing',   value: '12%', pct: 12 },
  { label: 'Expired',         value: '6%',  pct: 6  },
];

const CROSS_LINKS = ['Projects', 'Materials', 'Agreements', 'Realtors', 'Finance'];

const PROJECT_TYPES = [
  'Residential Remodel','New Construction','Commercial TI',
  'Multi-family','Addition / Expansion','Infrastructure','Specialty',
];
const SCOPE_OPTIONS = [
  'Light Rehab','Medium Rehab','Heavy Rehab',
  'New Construction','Addition','Repair',
];
const VALIDITY_OPTIONS = ['7 days','14 days','30 days','60 days','90 days'];
const PAYMENT_OPTIONS = [
  'Net 30','Net 15','Due on Completion','50% upfront / 50% on completion',
  'Progress Billing','Milestone-based','COD','Other',
];

interface QuoteForm {
  quoteNo: string; clientName: string; clientPhone: string; clientEmail: string;
  address: string; zip: string; projectType: string; scope: string;
  labor: string; materials: string; equipment: string; subcontractors: string;
  overhead: string; margin: string; validity: string; paymentTerms: string; notes: string;
}

export default function QuotesDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<QuoteForm>({
    quoteNo: '', clientName: '', clientPhone: '', clientEmail: '',
    address: '', zip: '', projectType: '', scope: '',
    labor: '', materials: '', equipment: '', subcontractors: '',
    overhead: '', margin: '', validity: '', paymentTerms: '', notes: '',
  });

  const set = (k: keyof QuoteForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const labor       = parseFloat(form.labor)         || 0;
  const materials   = parseFloat(form.materials)     || 0;
  const equipment   = parseFloat(form.equipment)     || 0;
  const subcontract = parseFloat(form.subcontractors)|| 0;
  const overheadPct = parseFloat(form.overhead)      || 0;
  const marginPct   = parseFloat(form.margin)        || 0;
  const subtotal    = labor + materials + equipment + subcontract;
  const overheadAmt = subtotal * (overheadPct / 100);
  const marginAmt   = (subtotal + overheadAmt) * (marginPct / 100);
  const totalQuote  = subtotal + overheadAmt + marginAmt;

  const fmt = (n: number) =>
    n > 0 ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

  return (
    <DeptShell
      title="Quotes & Estimates"
      icon={FileText}
      kpis={KPIS}
      aiTips={AI_TIPS}
      onBack={onBack}
    >
      {/* ── New Quote / Estimate Form ── */}
      <SectionCard title="New Quote / Estimate">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Quote #" hint="Auto-generated: Q-2026-XXX">
              <Input value={form.quoteNo} onChange={e => set('quoteNo')(e.target.value)} placeholder="Q-2026-032" />
            </Field>
            <Field label="Client Name" required>
              <Input value={form.clientName} onChange={e => set('clientName')(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Client Phone">
              <Input type="tel" value={form.clientPhone} onChange={e => set('clientPhone')(e.target.value)} placeholder="(305) 555-0000" />
            </Field>
            <Field label="Client Email">
              <Input type="email" value={form.clientEmail} onChange={e => set('clientEmail')(e.target.value)} placeholder="client@email.com" />
            </Field>
            <Field label="Property Address" fullWidth>
              <Input value={form.address} onChange={e => set('address')(e.target.value)} placeholder="Street address" />
            </Field>
            <Field label="Zip Code" hint="Material costs auto-adjusted by regional index">
              <Input value={form.zip} onChange={e => set('zip')(e.target.value)} placeholder="33101" />
            </Field>
            <Field label="Project Type">
              <SelectField placeholder="Select type" options={PROJECT_TYPES} value={form.projectType} onChange={set('projectType')} />
            </Field>
            <Field label="Scope">
              <SelectField placeholder="Select scope" options={SCOPE_OPTIONS} value={form.scope} onChange={set('scope')} />
            </Field>
          </FieldGroup>

          {/* Cost Line Items */}
          <div className="border border-border/60 rounded-lg overflow-hidden">
            <div className="bg-muted/40 px-4 py-2 flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[12px] font-semibold text-foreground">Cost Line Items</span>
            </div>
            <div className="p-4">
              <FieldGroup>
                <Field label="Labor — Estimated Cost" required>
                  <Input type="number" value={form.labor} onChange={e => set('labor')(e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Materials — Estimated Cost" required>
                  <Input type="number" value={form.materials} onChange={e => set('materials')(e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Equipment / Rentals">
                  <Input type="number" value={form.equipment} onChange={e => set('equipment')(e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Subcontractor Costs">
                  <Input type="number" value={form.subcontractors} onChange={e => set('subcontractors')(e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Overhead %" hint="Typical range 10–15%">
                  <Input type="number" value={form.overhead} onChange={e => set('overhead')(e.target.value)} placeholder="12" />
                </Field>
                <Field label="Profit Margin %" hint="Industry avg: 12–18% for residential">
                  <Input type="number" value={form.margin} onChange={e => set('margin')(e.target.value)} placeholder="15" />
                </Field>
              </FieldGroup>

              {/* Running total summary box */}
              <div className="mt-4 rounded-lg bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/40 p-4">
                <div className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-3">Quote Summary — Live Calculator</div>
                <div className="space-y-1.5">
                  {[
                    ['Labor',          fmt(labor)],
                    ['Materials',      fmt(materials)],
                    ['Equipment',      fmt(equipment)],
                    ['Subcontractors', fmt(subcontract)],
                    ['Subtotal',       fmt(subtotal)],
                    [`Overhead (${overheadPct}%)`, fmt(overheadAmt)],
                    [`Profit Margin (${marginPct}%)`, fmt(marginAmt)],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{val}</span>
                    </div>
                  ))}
                  <div className="border-t border-orange-200/60 pt-2 mt-2 flex justify-between">
                    <span className="text-sm font-semibold text-foreground">Total Quote Value</span>
                    <span className="text-sm font-bold text-orange-600">{fmt(totalQuote)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FieldGroup>
            <Field label="Quote Validity">
              <SelectField placeholder="Select validity" options={VALIDITY_OPTIONS} value={form.validity} onChange={set('validity')} />
            </Field>
            <Field label="Payment Terms">
              <SelectField placeholder="Select terms" options={PAYMENT_OPTIONS} value={form.paymentTerms} onChange={set('paymentTerms')} />
            </Field>
          </FieldGroup>

          {/* Voice Quote Upload */}
          <Field label="Voice Quote Upload" fullWidth hint="Upload voice memo — AI transcribes and populates line items">
            <div className="contractor-upload-zone py-5">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-center">Drag &amp; drop voice memo or <span className="text-orange-500 font-medium">browse</span></p>
              <p className="text-[10px] text-muted-foreground">MP3, M4A, WAV — max 50 MB</p>
            </div>
          </Field>

          {/* Handwriting Upload */}
          <Field label="Handwritten Estimate Upload" fullWidth hint="Upload handwritten estimate — AI converts to digital quote">
            <div className="contractor-upload-zone py-5">
              <Upload className="w-5 h-5 text-orange-400" />
              <p className="text-xs text-muted-foreground text-center">Drag &amp; drop handwritten estimate or <span className="text-orange-500 font-medium">browse</span></p>
              <p className="text-[10px] text-muted-foreground">PNG, JPG, PDF — max 20 MB</p>
            </div>
            <div className="mt-2">
              <OcrBanner />
            </div>
          </Field>

          <Field label="Notes" fullWidth>
            <textarea
              value={form.notes}
              onChange={e => set('notes')(e.target.value)}
              rows={3}
              className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Additional scope details, exclusions, assumptions..."
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Generate Quote PDF</Button>
            <Button variant="outline" className="text-xs h-8">Send to Client</Button>
            <Button variant="secondary" className="text-xs h-8">Convert to Project</Button>
            <Button variant="ghost" className="text-xs h-8">Save Draft</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Quote Pipeline Table ── */}
      <SectionCard title="Quote Pipeline">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Client</th>
                <th className="text-left py-2 pr-3 font-medium">Address</th>
                <th className="text-left py-2 pr-3 font-medium">Value</th>
                <th className="text-left py-2 pr-3 font-medium">Expiry</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {PIPELINE.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 font-medium">{row.client}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.address}</td>
                  <td className="py-2 pr-3 font-medium text-orange-600">{row.value}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.expiry}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Win/Loss Analysis ── */}
      <SectionCard title="Win / Loss Analysis">
        <SimpleBarChart data={WIN_LOSS_CHART} colorClass="bg-orange-400" />
      </SectionCard>

      {/* ── Finance Prompt ── */}
      <div className="rounded-lg border border-orange-200/60 dark:border-orange-800/40 bg-orange-50/30 dark:bg-orange-950/10 px-4 py-4">
        <div className="text-[12px] font-semibold text-foreground mb-1">Need financing to win this contract?</div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Offer your client bridge financing through Kluje Finance. Avg approval: 3 business days.
        </p>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Pre-qualify Client</Button>
      </div>

      {/* ── Cross-links ── */}
      <div className="flex flex-wrap gap-2">
        {CROSS_LINKS.map(link => (
          <button
            key={link}
            className="flex items-center gap-1 text-[11px] text-orange-500 hover:text-orange-600 border border-orange-200 dark:border-orange-800 rounded-md px-2.5 py-1 hover:bg-orange-50/50 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {link}
          </button>
        ))}
      </div>
    </DeptShell>
  );
}
