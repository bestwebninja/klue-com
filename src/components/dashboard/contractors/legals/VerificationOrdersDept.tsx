import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScanSearch, Upload, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

const KPIS: KpiItem[] = [
  { label: 'Verifications Pending', value: '8',      sub: '3 license, 5 background',     trend: 'neutral' },
  { label: 'Pass Rate',             value: '91%',    sub: '↑ 2% from last quarter',       trend: 'up'      },
  { label: 'Fraud Flags',           value: '2',      sub: '1 expired license, 1 OCR anomaly', trend: 'down' },
  { label: 'Avg Turnaround',        value: '1.8 days',sub: 'Instant: license lookups',    trend: 'up'      },
];

const AI_TIPS: AiTip[] = [
  {
    text: "Sub contractor 'Ray's Masonry LLC' CGL certificate uploaded shows policy inception date after the project start date. Possible fraud or late coverage — flag for review.",
    action: 'Review COI',
  },
  {
    text: 'License lookup: Florida Contractor License CGC1524831 — ACTIVE, expires 08/31/2026. Verified via DBPR.',
    action: 'View Record',
  },
  {
    text: 'Background check for new hire James T. pending 6 days — above average. Vendor delay detected. Alternative: Sterling Infosystems (avg 1.2 days in FL).',
    action: 'Switch Vendor',
  },
  {
    text: "AI detected 'double letter typo' in uploaded document: 'Contarctor' appears 4×, 'Agreemnet' appears 2×. Document may be a fraudulent template. Highlighted and flagged.",
    action: 'Review Document',
  },
];

const VERIFICATION_LOG = [
  { subject: 'Ray\'s Masonry LLC',  type: 'Insurance COI Verification',    vendor: 'Kluje Instant Check',  date: '2026-03-20', status: 'Flagged for Review'  as const, color: 'amber' as const },
  { subject: 'CGC1524831 (FL)',      type: 'Contractor License Lookup',      vendor: 'DBPR (FL)',            date: '2026-03-21', status: 'Complete — Passed'   as const, color: 'green' as const },
  { subject: 'James T.',             type: 'Background Check (Individual)',   vendor: 'Checkr',               date: '2026-03-17', status: 'In Progress'         as const, color: 'blue'  as const },
  { subject: 'Martinez Electrical',  type: 'Contractor License Lookup',      vendor: 'DBPR (FL)',            date: '2026-03-19', status: 'Complete — Passed'   as const, color: 'green' as const },
  { subject: 'Oak St Supplier LLC',  type: 'Business / Entity Verification', vendor: 'Sterling Infosystems', date: '2026-03-15', status: 'Complete — Failed'   as const, color: 'red'   as const },
  { subject: 'Anna R. (driver)',     type: 'Driving Record (MVR)',           vendor: 'HireRight',            date: '2026-03-22', status: 'Complete — Passed'   as const, color: 'green' as const },
];

const TYPE_CHART = [
  { label: 'License',     value: '35%', pct: 35 },
  { label: 'Background',  value: '30%', pct: 30 },
  { label: 'COI',         value: '20%', pct: 20 },
  { label: 'Reference',   value: '10%', pct: 10 },
  { label: 'Other',       value: '5%',  pct: 5  },
];

const VERIFICATION_TYPES = [
  'Contractor License Lookup','Background Check (Individual)','Business / Entity Verification',
  'Insurance COI Verification','Reference Check','Sexual Offender Check',
  'Driving Record (MVR)','Drug Screen','Trade Certification (OSHA 10/30, EPA, etc.)','Bond Verification',
];
const SUBJECT_ROLES = [
  'Employee','Subcontractor','Supplier','Partner','Tenant','Buyer/Seller',
];
const TRADE_LICENSE_TYPES = [
  'General Contractor','Electrical','Plumbing','HVAC/Mechanical','Roofing',
  'Masonry','Concrete','Drywall','Flooring','Painting','Landscaping','Other',
];
const VENDOR_OPTIONS = [
  'Kluje Instant Check (license DB)','Sterling Infosystems','Checkr','HireRight',
  'DBPR (FL)','CSLB (CA)','State DOL','Manual Verification',
];
const STATUS_OPTIONS = [
  'Ordered','In Progress','Complete — Passed','Complete — Failed','Flagged for Review','Expired',
];
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];

const CROSS_LINKS = ['Agreements', 'Insurance', 'Health & Safety', 'Attorneys', 'Projects'];

const FRAUD_CHECKS = [
  'Duplicate signatures',
  'Transposed figures',
  'Expired dates',
  'Formatting inconsistencies',
  'Photocopy detection',
  'Double-letter typos',
];

interface VerificationForm {
  verificationType: string; subjectName: string; subjectRole: string;
  licenseId: string; licenseState: string; tradeLicenseType: string;
  dateOrdered: string; vendor: string; expectedReturnDate: string;
  status: string; resultSummary: string; validUntil: string;
}

interface QuickCheckForm {
  state: string; licenseNumber: string;
}

export default function VerificationOrdersDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<VerificationForm>({
    verificationType: '', subjectName: '', subjectRole: '',
    licenseId: '', licenseState: '', tradeLicenseType: '',
    dateOrdered: '', vendor: '', expectedReturnDate: '',
    status: '', resultSummary: '', validUntil: '',
  });
  const [quickCheck, setQuickCheck] = useState<QuickCheckForm>({ state: '', licenseNumber: '' });

  const set  = (k: keyof VerificationForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const setQ = (k: keyof QuickCheckForm)   => (v: string) => setQuickCheck(f => ({ ...f, [k]: v }));

  return (
    <DeptShell
      title="Verification Orders"
      icon={ScanSearch}
      kpis={KPIS}
      aiTips={AI_TIPS}
      onBack={onBack}
    >
      {/* ── Order Verification Form ── */}
      <SectionCard title="Order Verification">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Verification Type">
              <SelectField placeholder="Select type" options={VERIFICATION_TYPES} value={form.verificationType} onChange={set('verificationType')} />
            </Field>
            <Field label="Subject Name" required>
              <Input value={form.subjectName} onChange={e => set('subjectName')(e.target.value)} placeholder="Person or entity name" />
            </Field>
            <Field label="Subject Role">
              <SelectField placeholder="Select role" options={SUBJECT_ROLES} value={form.subjectRole} onChange={set('subjectRole')} />
            </Field>
            <Field label="License / ID #" hint="For license lookups — state license number">
              <Input value={form.licenseId} onChange={e => set('licenseId')(e.target.value)} placeholder="e.g. CGC1524831" />
            </Field>
            <Field label="License State">
              <SelectField placeholder="Select state" options={US_STATES} value={form.licenseState} onChange={set('licenseState')} />
            </Field>
            <Field label="Trade / License Type">
              <SelectField placeholder="Select trade" options={TRADE_LICENSE_TYPES} value={form.tradeLicenseType} onChange={set('tradeLicenseType')} />
            </Field>
            <Field label="Date Ordered" required>
              <Input type="date" value={form.dateOrdered} onChange={e => set('dateOrdered')(e.target.value)} />
            </Field>
            <Field label="Vendor / Source">
              <SelectField placeholder="Select vendor" options={VENDOR_OPTIONS} value={form.vendor} onChange={set('vendor')} />
            </Field>
            <Field label="Expected Return Date">
              <Input type="date" value={form.expectedReturnDate} onChange={e => set('expectedReturnDate')(e.target.value)} />
            </Field>
            <Field label="Status">
              <SelectField placeholder="Select status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} />
            </Field>
            <Field label="Valid Until">
              <Input type="date" value={form.validUntil} onChange={e => set('validUntil')(e.target.value)} />
            </Field>
          </FieldGroup>

          {/* OCR Fraud Upload — prominent */}
          <Field label="Upload Document for OCR Fraud Check" fullWidth>
            <div className="border-2 border-dashed border-orange-400/70 rounded-lg px-4 py-6 flex flex-col items-center gap-2 bg-orange-50/30 dark:bg-orange-950/10 cursor-pointer hover:bg-orange-50/50 transition-colors">
              <Upload className="w-6 h-6 text-orange-400" />
              <p className="text-xs font-medium text-foreground">Drop document for AI Fraud Scan</p>
              <p className="text-xs text-muted-foreground text-center">
                COIs, licenses, agreements, certificates — AI checks for anomalies, expired dates, and formatting inconsistencies
              </p>
              <p className="text-[10px] text-muted-foreground">PDF, PNG, JPG — max 20 MB</p>
            </div>
            <div className="mt-2">
              <OcrBanner />
            </div>
          </Field>

          <Field label="Result Summary" fullWidth hint="Auto-populated when complete">
            <textarea
              value={form.resultSummary}
              onChange={e => set('resultSummary')(e.target.value)}
              rows={3}
              className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Verification result details, notes, flags..."
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Order Verification</Button>
            <Button
              variant="outline"
              className="text-xs h-8 border-orange-400 text-orange-500 hover:bg-orange-50 animate-pulse"
              style={{ animationDuration: '2s' }}
            >
              Run Instant License Check
            </Button>
            <Button variant="secondary" className="text-xs h-8">Upload for Fraud Scan</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── AI Fraud Detection Engine ── */}
      <div className="rounded-lg border border-red-200/60 dark:border-red-800/40 bg-red-50/30 dark:bg-red-950/10 px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <div className="text-[12px] font-semibold text-foreground">AI Fraud Detection Engine</div>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Running
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground mb-3">Active checks on every uploaded document:</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {FRAUD_CHECKS.map(check => (
            <div key={check} className="flex items-center gap-2 text-[11px] text-foreground">
              <ShieldCheck className="w-3 h-3 text-orange-500 shrink-0" />
              {check}
            </div>
          ))}
        </div>
      </div>

      {/* ── Verification Log ── */}
      <SectionCard title="Verification Log">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Subject</th>
                <th className="text-left py-2 pr-3 font-medium">Type</th>
                <th className="text-left py-2 pr-3 font-medium">Vendor</th>
                <th className="text-left py-2 pr-3 font-medium">Date</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {VERIFICATION_LOG.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 font-medium">{row.subject}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.type}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.vendor}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.date}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Verification Type Breakdown ── */}
      <SectionCard title="Verification Type Breakdown">
        <SimpleBarChart data={TYPE_CHART} colorClass="bg-orange-400" />
      </SectionCard>

      {/* ── State License Lookup Quick Panel ── */}
      <SectionCard title="State License Lookup — Quick Panel">
        <div className="space-y-3">
          <p className="text-[11px] text-muted-foreground">
            Enter a state license number + state to instantly verify via public records (DBPR, CSLB, and 40+ state databases).
          </p>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="w-36">
              <SelectField
                placeholder="State"
                options={US_STATES}
                value={quickCheck.state}
                onChange={setQ('state')}
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <Input
                value={quickCheck.licenseNumber}
                onChange={e => setQ('licenseNumber')(e.target.value)}
                placeholder="License number, e.g. CGC1524831"
                className="h-9 text-sm"
              />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9 shrink-0">
              Verify Now
            </Button>
          </div>
          {quickCheck.licenseNumber && quickCheck.state && (
            <div className="rounded-md bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-3 text-[12px]">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold text-foreground">License Verified</span>
                <StatusBadge status="Active" color="green" />
              </div>
              <div className="text-muted-foreground space-y-0.5">
                <div><span className="font-medium text-foreground">License #:</span> {quickCheck.licenseNumber}</div>
                <div><span className="font-medium text-foreground">State:</span> {quickCheck.state}</div>
                <div><span className="font-medium text-foreground">Status:</span> Active</div>
                <div><span className="font-medium text-foreground">Expires:</span> 08/31/2026</div>
                <div><span className="font-medium text-foreground">Source:</span> State Public Records</div>
              </div>
            </div>
          )}
        </div>
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
