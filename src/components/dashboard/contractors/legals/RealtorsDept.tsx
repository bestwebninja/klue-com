import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Home, ExternalLink, TrendingUp } from 'lucide-react';

const KPIS: KpiItem[] = [
  { label: 'Realtor Partners',      value: '12',      sub: '3 active referrals',        trend: 'up'   },
  { label: 'Deals in Pipeline',     value: '5',       sub: '$1.8M combined value',       trend: 'up'   },
  { label: 'Commission Earned YTD', value: '$14,200', sub: 'Referral + co-op',           trend: 'up'   },
  { label: 'Avg Days to Close',     value: '38',      sub: 'Market avg: 45 days',        trend: 'up'   },
];

const AI_TIPS: AiTip[] = [
  {
    text: 'Property 8814 Coral Way, Miami FL 33155: Redfin comp data shows ARV of ~$620k. Your medium rehab quote of $95k gives a projected ROI of 34%. High-value flip opportunity.',
    action: 'Run Full Analysis',
  },
  {
    text: 'Realtor partner Jane Smithfield has 4 listings in your service zip codes with deferred maintenance — all potential rehab referrals. Contact her today.',
    action: 'Message Jane',
  },
  {
    text: 'Market trend: Inventory in 33101 down 18% YoY (Crexi/Redfin equivalent data). Competition for rehab properties is high. Targeting off-market deals recommended.',
    action: 'Find Off-Market',
  },
  {
    text: 'Realtor license for partner Carlos Mendoza expired 60 days ago. Verify before co-brokering any transaction.',
    action: 'Verify License',
  },
];

const DIRECTORY = [
  { name: 'Jane Smithfield',  brokerage: 'Compass Miami',      specialty: 'Investment / Flips',   rating: '4.9', status: 'Active' as const,   color: 'green' as const },
  { name: 'Carlos Mendoza',   brokerage: 'RE/MAX Advance',     specialty: 'Residential Sales',    rating: '4.6', status: 'Review' as const,   color: 'amber' as const },
  { name: 'Patricia Lowe',    brokerage: 'Keller Williams',    specialty: 'Multifamily',          rating: '4.8', status: 'Active' as const,   color: 'green' as const },
  { name: 'Derek Okafor',     brokerage: 'eXp Realty',         specialty: 'Short Sales / REO',    rating: '4.7', status: 'Active' as const,   color: 'green' as const },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];

const SPECIALTY_OPTIONS = [
  'Residential Sales','Commercial Sales','Investment / Flips',
  'Multifamily','Land','Short Sales / REO','Property Management',
];
const PARTNERSHIP_OPTIONS = [
  'Referral Only','Co-Broker','Buyer\'s Agent','Listing Agent','Investor Partner',
];
const SCOPE_OPTIONS = ['Light','Medium','Heavy'];
const HOLDING_OPTIONS = ['3 mo','6 mo','9 mo','12 mo','18 mo'];
const DEAL_TYPE_OPTIONS = ['Fix & Flip','Buy & Hold','Double Close','Wholesale','BRRRR'];

const CROSS_LINKS = ['Title Companies', 'Quotes', 'Projects', 'Attorneys', 'Finance'];

interface RealtorForm {
  fullName: string; licenseNo: string; brokerage: string; licenseState: string;
  phone: string; email: string; specialty: string; serviceZips: string;
  partnershipType: string; commissionSplit: string; googleRating: string; notes: string;
}

interface AnalyzerForm {
  address: string; zip: string; purchasePrice: string; rehabCost: string;
  scope: string; arv: string; holdingPeriod: string; dealType: string;
}

export default function RealtorsDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<RealtorForm>({
    fullName: '', licenseNo: '', brokerage: '', licenseState: '',
    phone: '', email: '', specialty: '', serviceZips: '',
    partnershipType: '', commissionSplit: '', googleRating: '', notes: '',
  });
  const [analyzer, setAnalyzer] = useState<AnalyzerForm>({
    address: '', zip: '', purchasePrice: '', rehabCost: '',
    scope: '', arv: '', holdingPeriod: '', dealType: '',
  });

  const set  = (k: keyof RealtorForm)   => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const setA = (k: keyof AnalyzerForm)  => (v: string) => setAnalyzer(f => ({ ...f, [k]: v }));

  const purchase  = parseFloat(analyzer.purchasePrice) || 0;
  const rehab     = parseFloat(analyzer.rehabCost)     || 0;
  const arv       = parseFloat(analyzer.arv)           || 0;
  const totalCost = purchase + rehab;
  const grossProfit   = arv - totalCost;
  const roi           = totalCost > 0 ? ((grossProfit / totalCost) * 100) : 0;
  const holdMonths    = parseInt(analyzer.holdingPeriod) || 6;
  const annualized    = roi > 0 ? (roi / holdMonths) * 12 : 0;
  const fmt = (n: number) =>
    n !== 0 ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—';

  return (
    <DeptShell
      title="Realtors & Investment Partners"
      icon={Home}
      kpis={KPIS}
      aiTips={AI_TIPS}
      onBack={onBack}
    >
      {/* ── Add Realtor Partner ── */}
      <SectionCard title="Add Realtor Partner">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Realtor Full Name" required>
              <Input value={form.fullName} onChange={e => set('fullName')(e.target.value)} placeholder="First Last" />
            </Field>
            <Field label="License #" required>
              <Input value={form.licenseNo} onChange={e => set('licenseNo')(e.target.value)} placeholder="e.g. BK3524893" />
            </Field>
            <Field label="Brokerage Name" required>
              <Input value={form.brokerage} onChange={e => set('brokerage')(e.target.value)} placeholder="Brokerage LLC" />
            </Field>
            <Field label="License State">
              <SelectField placeholder="Select state" options={US_STATES} value={form.licenseState} onChange={set('licenseState')} />
            </Field>
            <Field label="Phone">
              <Input type="tel" value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="(305) 555-0000" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={e => set('email')(e.target.value)} placeholder="realtor@brokerage.com" />
            </Field>
            <Field label="Specialty">
              <SelectField placeholder="Select specialty" options={SPECIALTY_OPTIONS} value={form.specialty} onChange={set('specialty')} />
            </Field>
            <Field label="Service Zip Codes" hint="Comma-separated, e.g. 33101, 33102">
              <Input value={form.serviceZips} onChange={e => set('serviceZips')(e.target.value)} placeholder="33101, 33102, 33125" />
            </Field>
            <Field label="Partnership Type">
              <SelectField placeholder="Select type" options={PARTNERSHIP_OPTIONS} value={form.partnershipType} onChange={set('partnershipType')} />
            </Field>
            <Field label="Commission Split %" hint="Typical: 25–35% referral fee">
              <Input type="number" value={form.commissionSplit} onChange={e => set('commissionSplit')(e.target.value)} placeholder="30" />
            </Field>
            <Field label="Google Reviews Rating">
              <Input type="number" value={form.googleRating} onChange={e => set('googleRating')(e.target.value)} placeholder="4.8" />
            </Field>
          </FieldGroup>
          <Field label="Notes" fullWidth>
            <textarea
              value={form.notes}
              onChange={e => set('notes')(e.target.value)}
              rows={3}
              className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Relationship notes, deal history, preferred contact method..."
            />
          </Field>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Add Partner</Button>
            <Button variant="outline" className="text-xs h-8">Verify License</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Investment Property Analyzer ── */}
      <SectionCard title="Investment Property Analyzer">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-[11px] text-muted-foreground">Powered by AI comp benchmarking + regional PPI index</span>
          </div>
          <FieldGroup>
            <Field label="Property Address">
              <Input value={analyzer.address} onChange={e => setA('address')(e.target.value)} placeholder="Street address" />
            </Field>
            <Field label="Zip Code">
              <Input value={analyzer.zip} onChange={e => setA('zip')(e.target.value)} placeholder="33101" />
            </Field>
            <Field label="Purchase Price">
              <Input type="number" value={analyzer.purchasePrice} onChange={e => setA('purchasePrice')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Estimated Rehab Cost" hint="Links to Quotes department">
              <Input type="number" value={analyzer.rehabCost} onChange={e => setA('rehabCost')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Scope">
              <SelectField placeholder="Select scope" options={SCOPE_OPTIONS} value={analyzer.scope} onChange={setA('scope')} />
            </Field>
            <Field label="ARV Estimate" hint="After-repair value — AI provides neighborhood comp benchmark">
              <Input type="number" value={analyzer.arv} onChange={e => setA('arv')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Holding Period">
              <SelectField placeholder="Select period" options={HOLDING_OPTIONS} value={analyzer.holdingPeriod} onChange={setA('holdingPeriod')} />
            </Field>
            <Field label="Deal Type">
              <SelectField placeholder="Select deal type" options={DEAL_TYPE_OPTIONS} value={analyzer.dealType} onChange={setA('dealType')} />
            </Field>
          </FieldGroup>

          {/* ROI Summary Box */}
          <div className="rounded-lg bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/40 p-4">
            <div className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-3">Projected Returns</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Gross Profit</div>
                <div className="text-base font-bold text-foreground">{fmt(grossProfit)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">ROI %</div>
                <div className="text-base font-bold text-orange-600">{roi > 0 ? roi.toFixed(1) + '%' : '—'}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-1">Annualized Return</div>
                <div className="text-base font-bold text-emerald-600">{annualized > 0 ? annualized.toFixed(1) + '%' : '—'}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Save Analysis</Button>
            <Button variant="outline" className="text-xs h-8">Share with Realtor</Button>
            <Button variant="secondary" className="text-xs h-8">Connect with Lender</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Realtor Directory ── */}
      <SectionCard title="Realtor Directory">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Name</th>
                <th className="text-left py-2 pr-3 font-medium">Brokerage</th>
                <th className="text-left py-2 pr-3 font-medium">Specialty</th>
                <th className="text-left py-2 pr-3 font-medium">Rating</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {DIRECTORY.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 font-medium">{row.name}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.brokerage}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.specialty}</td>
                  <td className="py-2 pr-3 text-orange-600 font-medium">⭐ {row.rating}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Market Opportunity Map ── */}
      <SectionCard title="Market Opportunity Map">
        <div className="rounded-md bg-muted/30 border border-border/40 px-4 py-3 text-[12px] text-muted-foreground leading-relaxed">
          Based on your service zip codes, top opportunity areas this quarter:{' '}
          <span className="font-semibold text-foreground">33101</span>,{' '}
          <span className="font-semibold text-foreground">33125</span>,{' '}
          <span className="font-semibold text-foreground">33155</span>{' '}
          — avg DOM 22 days, avg price reduction 6.2%. Inventory down 18% YoY. Off-market pipeline recommended.
        </div>
      </SectionCard>

      {/* ── Finance Integration ── */}
      <div className="rounded-lg border border-orange-200/60 dark:border-orange-800/40 bg-orange-50/30 dark:bg-orange-950/10 px-4 py-4">
        <div className="text-[12px] font-semibold text-foreground mb-1">Kluje Finance — Fix &amp; Flip Bridge Loans</div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Bridge loans from $50k–$5M for fix &amp; flip. Avg close: 5 business days. Rates from 8.9%.
        </p>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Apply Now</Button>
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
