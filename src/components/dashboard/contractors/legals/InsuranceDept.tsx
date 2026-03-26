import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Upload, ExternalLink, AlertCircle, FileCheck2, TrendingUp, Info } from 'lucide-react';

const KPIS: KpiItem[] = [
  { label: 'Active Policies',    value: '6',       sub: 'GL, WC, PL, Umbrella + 2',        trend: 'neutral' },
  { label: 'Annual Premium',     value: '$28,400', sub: '↓ $1,200 vs last year',            trend: 'up'      },
  { label: 'Expiring in 60d',    value: '2',       sub: "Workers Comp & Builder's Risk",    trend: 'down'    },
  { label: 'Open Claims',        value: '1',       sub: 'Slip-fall filed Dec 2025',         trend: 'neutral' },
];

const AI_TIPS: AiTip[] = [
  {
    text: 'Workers Comp policy expires in 38 days. AI recommends getting 3 quotes now — typical renewal increase in construction sector: 4–7%.',
    action: 'Get Quotes',
  },
  {
    text: 'Your GL policy limit is $1M per occurrence. Three active projects exceed this threshold individually. Umbrella or project-specific policy recommended.',
    action: 'Review Coverage',
  },
  {
    text: 'Certificate of Insurance for sub Martinez Electrical expires in 22 days. Auto-request for updated COI sent.',
    action: 'View COI',
  },
  {
    text: "Based on your zip and project type mix, Builder's Risk self-insured retention of $10k is above average for your revenue tier — consider lowering to $5k.",
    action: 'Compare Plans',
  },
];

const POLICY_PORTFOLIO = [
  { type: 'General Liability',         provider: 'Travelers',    limit: '$2M / $4M',   expiry: '2026-11-01', status: 'Active'           as const, color: 'green' as const },
  { type: 'Workers Compensation',       provider: 'Zurich',       limit: 'Statutory',   expiry: '2026-05-15', status: 'Pending Renewal'  as const, color: 'amber' as const },
  { type: 'Professional Liability',     provider: 'CNA',          limit: '$1M / $2M',   expiry: '2026-09-30', status: 'Active'           as const, color: 'green' as const },
  { type: "Builder's Risk",             provider: 'Liberty Mutual',limit: '$3.5M',       expiry: '2026-06-01', status: 'Pending Renewal'  as const, color: 'amber' as const },
  { type: 'Umbrella / Excess',          provider: 'Berkley',      limit: '$5M',         expiry: '2026-11-01', status: 'Active'           as const, color: 'green' as const },
  { type: 'Commercial Auto',            provider: 'Progressive',  limit: '$1M CSL',     expiry: '2025-12-31', status: 'Expired'          as const, color: 'red'   as const },
];

const PREMIUM_CHART = [
  { label: 'Workers Comp',       value: '38%', pct: 38 },
  { label: 'General Liability',  value: '28%', pct: 28 },
  { label: "Builder's Risk",     value: '18%', pct: 18 },
  { label: 'Umbrella',           value: '10%', pct: 10 },
  { label: 'Other',              value: '6%',  pct: 6  },
];

const SUB_COI_TRACKER = [
  { sub: 'Martinez Electrical LLC',  glExp: '2026-04-17', wcExp: '2026-07-01', status: 'Expiring Soon' as const, color: 'amber' as const },
  { sub: "Ray's Masonry LLC",        glExp: '2026-09-30', wcExp: '2026-09-30', status: 'Active'        as const, color: 'green' as const },
  { sub: 'Sunstate Plumbing Inc',    glExp: '2025-12-01', wcExp: '2025-12-01', status: 'Expired'       as const, color: 'red'   as const },
  { sub: 'Premier Roofing Co',       glExp: '2026-08-15', wcExp: '2026-08-15', status: 'Active'        as const, color: 'green' as const },
];

const COVERAGE_GAPS = [
  {
    gap: 'Cyber Liability not covered',
    risk: 'High',
    note: 'Kluje platform stores client PII. Data breach exposure uninsured.',
    color: 'red' as const,
  },
  {
    gap: 'Commercial Auto policy expired',
    risk: 'High',
    note: 'Fleet vehicles currently uninsured. Renew immediately.',
    color: 'red' as const,
  },
  {
    gap: 'Equipment Floater missing',
    risk: 'Medium',
    note: '$85k in tools & equipment on active sites without inland marine coverage.',
    color: 'amber' as const,
  },
];

const RENEWAL_TIMELINE: { policy: string; daysLeft: number; color: 'amber' | 'blue' | 'green' | 'red' }[] = [
  { policy: 'Workers Compensation', daysLeft: 38, color: 'amber' },
  { policy: "Builder's Risk",       daysLeft: 68, color: 'blue' },
  { policy: 'General Liability',    daysLeft: 220, color: 'green' },
  { policy: 'Umbrella / Excess',    daysLeft: 220, color: 'green' },
];

const CROSS_LINKS = ['Health & Safety', 'Attorneys', 'Projects', 'Verification Orders', 'Finance'];

interface PolicyForm {
  policyType: string; provider: string; policyNo: string; agentName: string;
  agentPhone: string; agentEmail: string; coverageAmount: string; annualPremium: string;
  deductible: string; startDate: string; expiryDate: string; certHolder: string;
  status: string; renewalReminder: string; notes: string;
}

export default function InsuranceDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<PolicyForm>({
    policyType: '', provider: '', policyNo: '', agentName: '',
    agentPhone: '', agentEmail: '', coverageAmount: '', annualPremium: '',
    deductible: '', startDate: '', expiryDate: '', certHolder: '',
    status: '', renewalReminder: '', notes: '',
  });

  const set = (k: keyof PolicyForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DeptShell
      title="Insurance Department"
      icon={ShieldCheck}
      kpis={KPIS}
      aiTips={AI_TIPS}
      onBack={onBack}
    >
      {/* ── Add / Renew Policy ── */}
      <SectionCard title="Add / Renew Policy">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Policy Type" required>
              <SelectField
                placeholder="Select policy type"
                options={[
                  'General Liability (GL)','Workers Compensation (WC)',
                  'Professional Liability / E&O','Commercial Auto',
                  "Builder's Risk",'Umbrella / Excess',
                  "Contractor's Equipment",'Pollution Liability',
                  'Surety Bond','EPLI',
                ]}
                value={form.policyType}
                onChange={set('policyType')}
              />
            </Field>
            <Field label="Insurance Provider" required>
              <Input value={form.provider} onChange={e => set('provider')(e.target.value)} placeholder="e.g. Travelers, Zurich, CNA" />
            </Field>
            <Field label="Policy #" required>
              <Input value={form.policyNo} onChange={e => set('policyNo')(e.target.value)} placeholder="e.g. GL-2026-00192" />
            </Field>
            <Field label="Agent Name">
              <Input value={form.agentName} onChange={e => set('agentName')(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Agent Phone">
              <Input type="tel" value={form.agentPhone} onChange={e => set('agentPhone')(e.target.value)} placeholder="(305) 555-0000" />
            </Field>
            <Field label="Agent Email">
              <Input type="email" value={form.agentEmail} onChange={e => set('agentEmail')(e.target.value)} placeholder="agent@insurer.com" />
            </Field>
            <Field label="Coverage Amount" required hint="Per occurrence limit in USD">
              <Input type="number" value={form.coverageAmount} onChange={e => set('coverageAmount')(e.target.value)} placeholder="1000000" />
            </Field>
            <Field label="Annual Premium">
              <Input type="number" value={form.annualPremium} onChange={e => set('annualPremium')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Deductible / SIR">
              <Input type="number" value={form.deductible} onChange={e => set('deductible')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Policy Start Date" required>
              <Input type="date" value={form.startDate} onChange={e => set('startDate')(e.target.value)} />
            </Field>
            <Field label="Policy Expiry Date" required>
              <Input type="date" value={form.expiryDate} onChange={e => set('expiryDate')(e.target.value)} />
            </Field>
            <Field label="Certificate Holder" hint="e.g. Project owner, lender, municipality">
              <Input value={form.certHolder} onChange={e => set('certHolder')(e.target.value)} placeholder="Certificate holder name" />
            </Field>
          </FieldGroup>

          {/* Upload Policy / COI drag-drop zone */}
          <Field label="Upload Policy / COI" fullWidth>
            <div className="border-2 border-dashed border-orange-400/70 rounded-lg px-4 py-6 flex flex-col items-center gap-2 bg-orange-50/30 dark:bg-orange-950/10 cursor-pointer hover:bg-orange-50/50 transition-colors">
              <Upload className="w-6 h-6 text-orange-400" />
              <p className="text-xs text-muted-foreground text-center">
                Drag &amp; drop policy declaration or COI here, or <span className="text-orange-500 font-medium">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">PDF, PNG — max 20 MB</p>
            </div>
            <div className="mt-2">
              <OcrBanner />
            </div>
          </Field>

          <FieldGroup>
            <Field label="Status">
              <SelectField
                placeholder="Select status"
                options={['Active','Pending Renewal','Expired','Cancelled','Claim Open']}
                value={form.status}
                onChange={set('status')}
              />
            </Field>
            <Field label="Renewal Reminder">
              <SelectField
                placeholder="Select reminder"
                options={['90 days before','60 days before','30 days before','None']}
                value={form.renewalReminder}
                onChange={set('renewalReminder')}
              />
            </Field>
          </FieldGroup>

          <Field label="Notes" fullWidth>
            <textarea
              value={form.notes}
              onChange={e => set('notes')(e.target.value)}
              rows={3}
              className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Coverage notes, exclusions, special endorsements..."
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Save Policy</Button>
            <Button variant="outline" className="text-xs h-8">Request COI</Button>
            <Button variant="secondary" className="text-xs h-8">Log Claim</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Policy Portfolio ── */}
      <SectionCard title="Policy Portfolio">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Policy Type</th>
                <th className="text-left py-2 pr-3 font-medium">Provider</th>
                <th className="text-left py-2 pr-3 font-medium">Limit</th>
                <th className="text-left py-2 pr-3 font-medium">Expiry</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {POLICY_PORTFOLIO.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 font-medium">{row.type}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.provider}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.limit}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.expiry}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Premium Distribution ── */}
      <SectionCard title="Premium Distribution">
        <SimpleBarChart data={PREMIUM_CHART} colorClass="bg-orange-400" />
      </SectionCard>

      {/* ── Claims Log ── */}
      <SectionCard title="Claims Log">
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-md border border-amber-200/60 bg-amber-50/30 dark:bg-amber-950/10">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground">Slip-fall injury — Brickell Ave site</span>
                <StatusBadge status="Open" color="amber" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Filed: Dec 14, 2025 · Claimant: David Ruiz · GL policy claim #CLM-2025-0041</p>
            </div>
          </div>
          <div className="flex items-center gap-2 py-2 px-3 rounded-md bg-muted/20 border border-border/30">
            <span className="text-[11px] text-muted-foreground">No additional open claims.</span>
            <span className="ml-auto text-[10px] text-emerald-600 font-medium">All Clear</span>
          </div>
        </div>
      </SectionCard>

      {/* ── Subcontractor COI Tracker ── */}
      <SectionCard title="Subcontractor COI Tracker" action={{ label: 'Send All Requests', onClick: () => {} }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Subcontractor</th>
                <th className="text-left py-2 pr-3 font-medium">GL Expiry</th>
                <th className="text-left py-2 pr-3 font-medium">WC Expiry</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {SUB_COI_TRACKER.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 font-medium">
                    <div className="flex items-center gap-1.5">
                      <FileCheck2 className="w-3 h-3 text-muted-foreground" />
                      {row.sub}
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.glExp}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.wcExp}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border/40">
          Kluje auto-requests updated COIs 30 days before expiry. Expired COIs trigger work-stoppage alert to Project Dept.
        </p>
      </SectionCard>

      {/* ── Coverage Gap Analysis ── */}
      <SectionCard title="Coverage Gap Analysis — AI Detected">
        <div className="space-y-2">
          {COVERAGE_GAPS.map((gap, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                gap.color === 'red'
                  ? 'border-red-200/60 bg-red-50/20 dark:bg-red-950/10'
                  : 'border-amber-200/60 bg-amber-50/20 dark:bg-amber-950/10'
              }`}
            >
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${gap.color === 'red' ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">{gap.gap}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    gap.color === 'red'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>{gap.risk} Risk</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{gap.note}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Renewal Timeline ── */}
      <SectionCard title="Renewal Timeline">
        <div className="space-y-3">
          {RENEWAL_TIMELINE.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" />
                  {item.policy}
                </span>
                <span className={`font-medium ${
                  item.daysLeft < 45 ? 'text-red-600' :
                  item.daysLeft < 90 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {item.daysLeft}d remaining
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.color === 'red' ? 'bg-red-400' :
                    item.color === 'amber' ? 'bg-amber-400' :
                    item.color === 'blue' ? 'bg-blue-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((365 - item.daysLeft) / 365 * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Info Box ── */}
      <div className="flex items-start gap-2.5 bg-muted/40 border border-border/60 rounded-lg px-4 py-3">
        <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-semibold text-foreground mb-0.5">Insurance Best Practice — Kluje AI</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Maintain certificates for all active subs before work begins. Ensure your umbrella policy layers properly over your GL and WC policies. Review project-specific endorsements for any job exceeding $500k in contract value.
          </p>
        </div>
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
