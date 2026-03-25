import { useState } from 'react';
import { Scale } from 'lucide-react';
import {
  DeptShell,
  KpiItem,
  AiTip,
  FieldGroup,
  Field,
  SelectField,
  SimpleBarChart,
  SectionCard,
  StatusBadge,
  OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois',
  'Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts',
  'Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota',
  'Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
  'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington',
  'West Virginia','Wisconsin','Wyoming',
];

const SPECIALTIES = [
  'Construction Law',
  'Real Estate Law',
  'Labor & Employment',
  'Corporate',
  'Lien & Collections',
  'Insurance Defense',
  'Environmental',
  'Arbitration/Mediation',
];

const kpis: KpiItem[] = [
  { label: 'Active Cases',        value: '4',      sub: '↑ 1 this month',      trend: 'up'     },
  { label: 'Legal Fees MTD',      value: '$6,800', sub: 'Avg $3.2k retainer',  trend: 'neutral' },
  { label: 'Avg Response',        value: '3.1 hrs',sub: '↓ from 4.2 hrs',      trend: 'up'     },
  { label: 'Docs Pending Review', value: '7',      sub: '2 flagged by OCR',    trend: 'down'   },
];

const aiTips: AiTip[] = [
  {
    text: '3 of your active contractor agreements lack arbitration clauses — exposure risk flagged.',
    action: 'Review Agreements',
  },
  {
    text: "Your construction attorney's bar license expires in 47 days. Renewal reminder sent.",
    action: 'Verify License',
  },
  {
    text: 'Based on your zip code (detected), James Harrington at HBL Law ranks #1 on Google Reviews for construction lien disputes.',
    action: 'View Profile',
  },
  {
    text: 'Avg construction attorney retainer in your area: $3,000–$5,000. Current retainer is on par.',
    action: 'Compare Rates',
  },
];

const feeData = [
  { label: 'Retainer fees',    value: '$4,200', pct: 62 },
  { label: 'Hourly billing',   value: '$1,900', pct: 28 },
  { label: 'Court/filing fees',value: '$700',   pct: 10 },
];

const activeCases = [
  {
    type: 'Lien dispute',
    name: 'Harrison v. Metro Build',
    filed: 'Filed Jan 2026',
    claim: '$45,000 claim',
    status: 'In Discovery',
    color: 'blue' as const,
  },
  {
    type: 'Contract breach',
    name: 'Oakside LLC',
    filed: 'Filed Dec 2025',
    claim: '$12,500 claim',
    status: 'Resolved',
    color: 'green' as const,
  },
  {
    type: 'Labor dispute',
    name: 'Sub agreement',
    filed: 'Filed Mar 2026',
    claim: '$8,200 claim',
    status: 'Review needed',
    color: 'amber' as const,
  },
];

interface AttorneyForm {
  fullName: string;
  firmName: string;
  barNumber: string;
  state: string;
  specialty: string;
  phone: string;
  email: string;
  retainer: string;
  hourlyRate: string;
  googleRating: string;
  notes: string;
}

const emptyForm: AttorneyForm = {
  fullName: '', firmName: '', barNumber: '', state: '', specialty: '',
  phone: '', email: '', retainer: '', hourlyRate: '', googleRating: '', notes: '',
};

export default function AttorneysDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<AttorneyForm>(emptyForm);

  const set = (key: keyof AttorneyForm) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleInputChange = (key: keyof AttorneyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key)(e.target.value);

  return (
    <DeptShell
      title="Attorneys"
      icon={Scale}
      kpis={kpis}
      aiTips={aiTips}
      onBack={onBack}
    >
      {/* ── Section 1: Add / Search Attorney ── */}
      <SectionCard title="Add / Search Attorney">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Attorney Full Name" required>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. James Harrington"
                value={form.fullName}
                onChange={handleInputChange('fullName')}
              />
            </Field>
            <Field label="Law Firm Name">
              <Input
                className="h-9 text-sm"
                placeholder="e.g. HBL Law Group"
                value={form.firmName}
                onChange={handleInputChange('firmName')}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label="Bar Number" required hint="Verify at your state bar website">
              <Input
                className="h-9 text-sm"
                placeholder="e.g. 12345678"
                value={form.barNumber}
                onChange={handleInputChange('barNumber')}
              />
            </Field>
            <Field label="State">
              <SelectField
                placeholder="Select state"
                options={US_STATES}
                value={form.state}
                onChange={set('state')}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label="Specialty">
              <SelectField
                placeholder="Select specialty"
                options={SPECIALTIES}
                value={form.specialty}
                onChange={set('specialty')}
              />
            </Field>
            <Field label="Phone">
              <Input
                className="h-9 text-sm"
                type="tel"
                placeholder="(305) 555-0100"
                value={form.phone}
                onChange={handleInputChange('phone')}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label="Email">
              <Input
                className="h-9 text-sm"
                type="email"
                placeholder="attorney@hbllaw.com"
                value={form.email}
                onChange={handleInputChange('email')}
              />
            </Field>
            <Field label="Retainer Amount" hint="Typical range $2,500–$8,000">
              <Input
                className="h-9 text-sm"
                type="number"
                placeholder="3000"
                value={form.retainer}
                onChange={handleInputChange('retainer')}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label="Hourly Rate" hint="US avg $250–$450/hr for construction law">
              <Input
                className="h-9 text-sm"
                type="number"
                placeholder="325"
                value={form.hourlyRate}
                onChange={handleInputChange('hourlyRate')}
              />
            </Field>
            <Field label="Google Review Rating">
              <Input
                className="h-9 text-sm"
                type="number"
                min={1}
                max={5}
                placeholder="4.8"
                value={form.googleRating}
                onChange={handleInputChange('googleRating')}
              />
            </Field>
          </FieldGroup>

          <Field label="Notes" fullWidth>
            <textarea
              className="w-full min-h-[80px] text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Additional notes about this attorney..."
              value={form.notes}
              onChange={handleInputChange('notes')}
            />
          </Field>

          <OcrBanner />

          <div className="flex items-center gap-3 pt-1">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm h-9 px-5"
              onClick={() => {}}
            >
              Save Attorney
            </Button>
            <Button
              variant="outline"
              className="text-sm h-9 px-5"
              onClick={() => setForm(emptyForm)}
            >
              Clear
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Section 2: Active Cases ── */}
      <SectionCard
        title="Active Cases"
        action={{ label: 'Log New Case', onClick: () => {} }}
      >
        <div className="space-y-3">
          {activeCases.map((c, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 border-b border-border/40 last:border-0"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {c.type}
                  </span>
                  <StatusBadge status={c.status} color={c.color} />
                </div>
                <div className="text-sm font-semibold text-foreground">{c.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {c.filed} · {c.claim}
                </div>
              </div>
              <Button variant="outline" className="text-xs h-7 px-3 shrink-0">
                View
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Section 3: Fee Distribution ── */}
      <SectionCard title="Fee Distribution (MTD)">
        <SimpleBarChart data={feeData} colorClass="bg-orange-400" />
      </SectionCard>

      {/* ── Section 4: Cross-links ── */}
      <SectionCard title="Related Departments">
        <div className="flex flex-wrap gap-2">
          {['Agreements', 'Arbitration', 'Verification Orders', 'Insurance'].map((link) => (
            <button
              key={link}
              className="text-[11px] font-medium px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
            >
              {link} →
            </button>
          ))}
        </div>
      </SectionCard>
    </DeptShell>
  );
}
