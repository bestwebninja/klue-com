import { useState } from 'react';
import { Gavel, Upload } from 'lucide-react';
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

const kpis: KpiItem[] = [
  { label: 'Active Cases',    value: '2',      sub: '1 filed this quarter',    trend: 'neutral' },
  { label: 'Total Claims',    value: '$127k',  sub: '↑ $45k from Q4',          trend: 'down'    },
  { label: 'Avg Resolution',  value: '94 days',sub: 'AAA median: 110 days',    trend: 'up'      },
  { label: 'Settlement Rate', value: '67%',    sub: 'Industry avg: 60%',       trend: 'up'      },
];

const aiTips: AiTip[] = [
  {
    text: 'AAA filing fee for claims $75k–$150k is $1,850. Your current case estimate may qualify for expedited arbitration, saving ~45 days.',
    action: 'See Rules',
  },
  {
    text: 'Weather: Severe thunderstorms forecast for project zip 33101 this week. If your dispute involves timeline penalties, flag this with your arbitrator.',
    action: 'Add to Record',
  },
  {
    text: 'Your arbitration clause in Agreement #A-204 references JAMS rules but the contract value triggers AAA threshold. Review recommended.',
    action: 'Open Agreement',
  },
];

const DISPUTE_TYPES = [
  'Contract Breach',
  'Payment Dispute',
  'Scope Creep',
  'Delay / Time Extension',
  'Lien Release',
  'Warranty Claim',
  'Sub Termination',
  'Property Damage',
];

const ARBITRATION_BODIES = [
  'AAA (American Arbitration Association)',
  'JAMS',
  'ICC',
  'NAM',
  'Private / Agreed Arbitrator',
];

const CASE_STATUSES = [
  'Pre-filing',
  'Filed',
  'Discovery',
  'Hearing Scheduled',
  'Award Pending',
  'Settled',
  'Closed',
];

const resolutionData = [
  { label: 'Contract breach',  value: '40%', pct: 40 },
  { label: 'Payment disputes', value: '35%', pct: 35 },
  { label: 'Scope/delay',      value: '25%', pct: 25 },
];

const activeCases = [
  {
    ref: 'ARB-2026-001',
    type: 'Payment Dispute',
    claimant: 'Apex Contractors LLC',
    respondent: 'Metro Build Group',
    amount: '$82,000',
    body: 'AAA',
    status: 'Discovery',
    color: 'blue' as const,
  },
  {
    ref: 'ARB-2025-047',
    type: 'Contract Breach',
    claimant: 'Sunrise Roofing Inc.',
    respondent: 'Clearwater Properties',
    amount: '$45,000',
    body: 'JAMS',
    status: 'Award Pending',
    color: 'amber' as const,
  },
];

const TIMELINE_STAGES = ['Pre-filing', 'Filed', 'Discovery', 'Hearing', 'Award'];

interface ArbitrationForm {
  caseRef: string;
  disputeType: string;
  claimant: string;
  respondent: string;
  arbBody: string;
  arbitratorName: string;
  claimAmount: string;
  filingDate: string;
  hearingDate: string;
  projectLinked: string;
  evidenceSummary: string;
  status: string;
}

const emptyForm: ArbitrationForm = {
  caseRef: 'ARB-2026-',
  disputeType: '',
  claimant: '',
  respondent: '',
  arbBody: '',
  arbitratorName: '',
  claimAmount: '',
  filingDate: '',
  hearingDate: '',
  projectLinked: '',
  evidenceSummary: '',
  status: '',
};

export default function ArbitrationDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<ArbitrationForm>(emptyForm);
  const [currentStage, setCurrentStage] = useState(2); // 0-indexed: Discovery

  const set = (key: keyof ArbitrationForm) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleInputChange = (key: keyof ArbitrationForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key)(e.target.value);

  return (
    <DeptShell
      title="Arbitration"
      icon={Gavel}
      kpis={kpis}
      aiTips={aiTips}
      weatherWarning="Severe thunderstorms forecast for project zip 33101 (Mon–Wed). If active disputes involve schedule penalties or force majeure clauses, document conditions now for your arbitration record."
      onBack={onBack}
    >
      {/* ── Section 1: File Arbitration Case ── */}
      <SectionCard title="File Arbitration Case">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Case Reference #">
              <Input
                className="h-9 text-sm"
                placeholder="ARB-2026-XXX"
                value={form.caseRef}
                onChange={handleInputChange('caseRef')}
              />
            </Field>
            <Field label="Dispute Type">
              <SelectField
                placeholder="Select dispute type"
                options={DISPUTE_TYPES}
                value={form.disputeType}
                onChange={set('disputeType')}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label="Claimant Name" required>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. Apex Contractors LLC"
                value={form.claimant}
                onChange={handleInputChange('claimant')}
              />
            </Field>
            <Field label="Respondent Name" required>
              <Input
                className="h-9 text-sm"
                placeholder="e.g. Metro Build Group"
                value={form.respondent}
                onChange={handleInputChange('respondent')}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label="Arbitration Body">
              <SelectField
                placeholder="Select arbitration body"
                options={ARBITRATION_BODIES}
                value={form.arbBody}
                onChange={set('arbBody')}
              />
            </Field>
            <Field label="Arbitrator Name">
              <Input
                className="h-9 text-sm"
                placeholder="e.g. Hon. Sandra M. Torres (Ret.)"
                value={form.arbitratorName}
                onChange={handleInputChange('arbitratorName')}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label="Claim Amount" required>
              <Input
                className="h-9 text-sm"
                type="number"
                placeholder="82000"
                value={form.claimAmount}
                onChange={handleInputChange('claimAmount')}
              />
            </Field>
            <Field label="Filing Date" required>
              <Input
                className="h-9 text-sm"
                type="date"
                value={form.filingDate}
                onChange={handleInputChange('filingDate')}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label="Hearing Date">
              <Input
                className="h-9 text-sm"
                type="date"
                value={form.hearingDate}
                onChange={handleInputChange('hearingDate')}
              />
            </Field>
            <Field label="Project Linked" hint="Link to a project in your Projects department">
              <Input
                className="h-9 text-sm"
                placeholder="e.g. PRJ-2025-044 · Bayfront Renovation"
                value={form.projectLinked}
                onChange={handleInputChange('projectLinked')}
              />
            </Field>
          </FieldGroup>

          <Field label="Evidence Summary" fullWidth>
            <textarea
              className="w-full min-h-[80px] text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Summarize the key facts, timeline of events, and relevant contract clauses..."
              value={form.evidenceSummary}
              onChange={handleInputChange('evidenceSummary')}
            />
          </Field>

          {/* Upload Evidence */}
          <Field label="Upload Evidence" fullWidth>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border/60 rounded-lg cursor-pointer hover:border-orange-400/60 hover:bg-orange-50/20 dark:hover:bg-orange-950/10 transition-colors group">
              <Upload className="w-5 h-5 text-muted-foreground group-hover:text-orange-500 mb-1.5 transition-colors" />
              <span className="text-xs text-muted-foreground">
                Drop files here or{' '}
                <span className="text-orange-500 font-medium">browse</span>
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                PDF, DOCX, JPG, PNG up to 25MB
              </span>
              <input type="file" className="hidden" multiple accept=".pdf,.docx,.jpg,.png" />
            </label>
          </Field>

          <OcrBanner />

          <FieldGroup>
            <Field label="Status">
              <SelectField
                placeholder="Select status"
                options={CASE_STATUSES}
                value={form.status}
                onChange={set('status')}
              />
            </Field>
            <div /> {/* spacer */}
          </FieldGroup>

          <div className="flex items-center gap-3 pt-1">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm h-9 px-5"
              onClick={() => {}}
            >
              Submit Case
            </Button>
            <Button
              variant="outline"
              className="text-sm h-9 px-5"
              onClick={() => {}}
            >
              Save Draft
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Section 2: Active Cases ── */}
      <SectionCard title="Active Cases">
        <div className="space-y-3">
          {activeCases.map((c, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 border-b border-border/40 last:border-0"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    {c.ref}
                  </span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {c.type}
                  </span>
                  <StatusBadge status={c.status} color={c.color} />
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {c.claimant} <span className="text-muted-foreground font-normal text-xs">vs.</span> {c.respondent}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {c.amount} · {c.body}
                </div>
              </div>
              <Button variant="outline" className="text-xs h-7 px-3 shrink-0">
                Open
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Section 3: Timeline Tracker ── */}
      <SectionCard title="Case Stage Timeline">
        <div className="flex items-start gap-0 py-2">
          {TIMELINE_STAGES.map((stage, i) => {
            const isActive = i === currentStage;
            const isPast = i < currentStage;
            const isLast = i === TIMELINE_STAGES.length - 1;
            return (
              <div key={stage} className="flex-1 flex flex-col items-center relative">
                {/* connector line left */}
                {i > 0 && (
                  <div
                    className={`absolute top-[9px] right-1/2 w-full h-0.5 ${
                      isPast || isActive ? 'bg-orange-400' : 'bg-border/60'
                    }`}
                  />
                )}
                {/* dot */}
                <button
                  onClick={() => setCurrentStage(i)}
                  className={`relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActive
                      ? 'border-orange-500 bg-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.2)]'
                      : isPast
                      ? 'border-orange-400 bg-orange-400'
                      : 'border-border/60 bg-background'
                  }`}
                >
                  {isPast && !isActive && (
                    <span className="text-white text-[8px] font-bold">✓</span>
                  )}
                </button>
                <span
                  className={`text-[10px] mt-1.5 text-center leading-tight ${
                    isActive
                      ? 'text-orange-500 font-semibold'
                      : isPast
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          Click a stage to update the active case position. Current stage:{' '}
          <span className="text-orange-500 font-medium">{TIMELINE_STAGES[currentStage]}</span>
        </p>
      </SectionCard>

      {/* ── Section 4: Resolution Stats ── */}
      <SectionCard title="Resolution by Dispute Type">
        <SimpleBarChart data={resolutionData} colorClass="bg-orange-400" />
      </SectionCard>

      {/* ── Section 5: Cross-links ── */}
      <SectionCard title="Related Departments">
        <div className="flex flex-wrap gap-2">
          {['Attorneys', 'Agreements', 'Projects', 'Insurance'].map((link) => (
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
