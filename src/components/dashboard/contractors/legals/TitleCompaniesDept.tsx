import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, Upload, ExternalLink, CheckCircle2, Circle } from 'lucide-react';

const KPIS: KpiItem[] = [
  { label: 'Open Transactions',  value: '3',      sub: '2 approaching closing',       trend: 'neutral' },
  { label: 'Avg Days to Close',  value: '31',     sub: 'Market avg: 42 days',         trend: 'up'      },
  { label: 'Title Issues Found', value: '2',      sub: '1 lien, 1 easement',          trend: 'down'    },
  { label: 'Escrow Value',       value: '$842k',  sub: 'Across active transactions',  trend: 'up'      },
];

const AI_TIPS: AiTip[] = [
  {
    text: 'Transaction 8220 Maple Ave: Title search reveals an unsatisfied mechanic\'s lien from 2019 ($12,400). Contact lien holder to negotiate release before closing.',
    action: 'Manage Lien',
  },
  {
    text: 'Double closing opportunity: 9901 Oak St seller open to assignment. Recommend connecting with title company for simultaneous close structure.',
    action: 'Structure Deal',
  },
  {
    text: 'Closing on 221 Coral Way scheduled for Apr 10. Weather forecast shows potential hurricane watch — check with title company on force majeure and extension clause.',
    action: 'Review Contract',
  },
  {
    text: 'Title company \'First American — Miami\' has a 4.7 Google rating and specializes in construction-to-permanent loans. Recommend for Project Brickell Ave.',
    action: 'Contact Them',
  },
];

const TRANSACTIONS = [
  { address: '8220 Maple Ave',   type: 'Purchase',           price: '$410,000', closing: '2026-04-18', status: 'Title Ordered'        as const, color: 'blue'  as const },
  { address: '221 Coral Way',    type: 'Construction-to-Perm',price: '$290,000', closing: '2026-04-10', status: 'Cleared for Closing'  as const, color: 'green' as const },
  { address: '9901 Oak St',      type: 'Double Close',       price: '$142,000', closing: '2026-05-02', status: 'Under Contract'       as const, color: 'blue'  as const },
];

const TX_TYPE_CHART = [
  { label: 'Purchase',               value: '40%', pct: 40 },
  { label: 'Construction-to-Perm',   value: '25%', pct: 25 },
  { label: 'Cash Sale',              value: '15%', pct: 15 },
  { label: 'Double Close',           value: '12%', pct: 12 },
  { label: 'Other',                  value: '8%',  pct: 8  },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];
const LIEN_STATUS_OPTIONS = [
  'Not Started','In Progress','Clear','Liens Found — See Notes','Disputed',
];
const TX_TYPE_OPTIONS = [
  'Purchase','Refinance','Double Close / Simultaneous','Wholesale Assignment',
  'Construction-to-Perm','Cash Sale','Short Sale','REO',
];
const STATUS_OPTIONS = [
  'Open','Under Contract','Title Ordered','Cleared for Closing','Closed','Cancelled',
];

const CLOSING_STAGES = [
  'Under Contract',
  'Title Search',
  'Lien Clearance',
  'Loan Approval',
  'Closing Disclosure',
  'Close',
];

const CROSS_LINKS = ['Realtors', 'Attorneys', 'Projects', 'Finance', 'Agreements'];

interface TxForm {
  address: string; city: string; state: string; zip: string;
  titleCompany: string; officerName: string; officerPhone: string; officerEmail: string;
  escrowNo: string; purchasePrice: string; loanAmount: string; titleInsurance: string;
  lienStatus: string; closingDate: string; txType: string;
  buyer: string; seller: string; status: string; notes: string;
}

export default function TitleCompaniesDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<TxForm>({
    address: '', city: '', state: '', zip: '',
    titleCompany: '', officerName: '', officerPhone: '', officerEmail: '',
    escrowNo: '', purchasePrice: '', loanAmount: '', titleInsurance: '',
    lienStatus: '', closingDate: '', txType: '',
    buyer: '', seller: '', status: '', notes: '',
  });
  const [currentStage] = useState(2); // 0-indexed, showing "Lien Clearance" as current

  const set = (k: keyof TxForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DeptShell
      title="Title Companies"
      icon={Building2}
      kpis={KPIS}
      aiTips={AI_TIPS}
      weatherWarning="Hurricane watch potential — review force majeure and closing extension clauses on any scheduled closings in the next 10 days."
      onBack={onBack}
    >
      {/* ── Add Title Transaction ── */}
      <SectionCard title="Add Title Transaction">
        <div className="space-y-4">
          <Field label="Property Address" required fullWidth>
            <Input value={form.address} onChange={e => set('address')(e.target.value)} placeholder="Full property address" />
          </Field>
          <FieldGroup>
            <Field label="City">
              <Input value={form.city} onChange={e => set('city')(e.target.value)} placeholder="City" />
            </Field>
            <Field label="State">
              <SelectField placeholder="Select state" options={US_STATES} value={form.state} onChange={set('state')} />
            </Field>
            <Field label="Zip Code">
              <Input value={form.zip} onChange={e => set('zip')(e.target.value)} placeholder="33101" />
            </Field>
            <Field label="Title Company Name" required>
              <Input value={form.titleCompany} onChange={e => set('titleCompany')(e.target.value)} placeholder="e.g. First American Title" />
            </Field>
            <Field label="Title Officer Name">
              <Input value={form.officerName} onChange={e => set('officerName')(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Title Officer Phone">
              <Input type="tel" value={form.officerPhone} onChange={e => set('officerPhone')(e.target.value)} placeholder="(305) 555-0000" />
            </Field>
            <Field label="Title Officer Email">
              <Input type="email" value={form.officerEmail} onChange={e => set('officerEmail')(e.target.value)} placeholder="officer@titleco.com" />
            </Field>
            <Field label="Escrow / File #">
              <Input value={form.escrowNo} onChange={e => set('escrowNo')(e.target.value)} placeholder="ESC-2026-0042" />
            </Field>
            <Field label="Purchase Price" required>
              <Input type="number" value={form.purchasePrice} onChange={e => set('purchasePrice')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Loan Amount">
              <Input type="number" value={form.loanAmount} onChange={e => set('loanAmount')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Title Insurance Amount" hint="Typically = purchase price">
              <Input type="number" value={form.titleInsurance} onChange={e => set('titleInsurance')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Lien Search Status">
              <SelectField placeholder="Select status" options={LIEN_STATUS_OPTIONS} value={form.lienStatus} onChange={set('lienStatus')} />
            </Field>
            <Field label="Closing Date" required>
              <Input type="date" value={form.closingDate} onChange={e => set('closingDate')(e.target.value)} />
            </Field>
            <Field label="Transaction Type">
              <SelectField placeholder="Select type" options={TX_TYPE_OPTIONS} value={form.txType} onChange={set('txType')} />
            </Field>
            <Field label="Buyer Name">
              <Input value={form.buyer} onChange={e => set('buyer')(e.target.value)} placeholder="Buyer full name" />
            </Field>
            <Field label="Seller Name">
              <Input value={form.seller} onChange={e => set('seller')(e.target.value)} placeholder="Seller full name" />
            </Field>
            <Field label="Status">
              <SelectField placeholder="Select status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} />
            </Field>
          </FieldGroup>

          {/* Upload */}
          <Field label="Upload Title Commitment / HUD" fullWidth>
            <div className="border-2 border-dashed border-orange-400/70 rounded-lg px-4 py-6 flex flex-col items-center gap-2 bg-orange-50/30 dark:bg-orange-950/10 cursor-pointer hover:bg-orange-50/50 transition-colors">
              <Upload className="w-6 h-6 text-orange-400" />
              <p className="text-xs text-muted-foreground text-center">
                Drag &amp; drop title commitment, HUD-1, or closing disclosure, or{' '}
                <span className="text-orange-500 font-medium">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">PDF, PNG — max 20 MB</p>
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
              placeholder="Title issues, lien notes, special instructions..."
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Add Transaction</Button>
            <Button variant="outline" className="text-xs h-8">Request Title Search</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Active Transactions ── */}
      <SectionCard title="Active Transactions">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Address</th>
                <th className="text-left py-2 pr-3 font-medium">Type</th>
                <th className="text-left py-2 pr-3 font-medium">Price</th>
                <th className="text-left py-2 pr-3 font-medium">Closing</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 font-medium">{row.address}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.type}</td>
                  <td className="py-2 pr-3 font-medium text-orange-600">{row.price}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.closing}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Closing Timeline ── */}
      <SectionCard title="Closing Timeline">
        <div className="space-y-2">
          {CLOSING_STAGES.map((stage, i) => {
            const done    = i < currentStage;
            const current = i === currentStage;
            return (
              <div key={stage} className="flex items-center gap-3">
                <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  done ? 'bg-emerald-500' : current ? 'bg-orange-500' : 'bg-muted border border-border/60'
                }`}>
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    : current
                    ? <span className="w-2 h-2 rounded-full bg-white" />
                    : <Circle className="w-3 h-3 text-muted-foreground" />
                  }
                </div>
                <div className={`flex-1 text-[12px] ${
                  done ? 'text-muted-foreground line-through' : current ? 'font-semibold text-foreground' : 'text-muted-foreground'
                }`}>
                  {stage}
                </div>
                {current && (
                  <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded font-medium">In Progress</span>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Transaction Type Distribution ── */}
      <SectionCard title="Transaction Type Distribution">
        <SimpleBarChart data={TX_TYPE_CHART} colorClass="bg-orange-400" />
      </SectionCard>

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
