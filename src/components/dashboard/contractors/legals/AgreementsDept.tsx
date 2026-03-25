import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Upload, AlertTriangle, ExternalLink } from 'lucide-react';

const KPIS: KpiItem[] = [
  { label: 'Active Agreements',  value: '18',     sub: '↑ 3 this month',              trend: 'up'      },
  { label: 'Pipeline Value',     value: '$1.24M', sub: 'Under active contract',        trend: 'up'      },
  { label: 'Expiring in 30d',    value: '4',      sub: 'Renewal action needed',        trend: 'down'    },
  { label: 'Avg Contract Term',  value: '8.3 mo', sub: 'Across all agreement types',   trend: 'neutral' },
];

const AI_TIPS: AiTip[] = [
  { text: 'Agreement #A-119 (Sub — Martinez Electrical) has no liquidated damages clause. AI recommends adding standard LDs before next renewal.', action: 'Edit Agreement' },
  { text: '4 agreements expire within 30 days. Auto-renewal reminders sent to counterparties.', action: 'View Expiring' },
  { text: 'Agreement #A-204 references 2021 AIA contract language — updated 2024 AIA A201 now in effect. Update recommended.', action: 'Update Template' },
  { text: "AI detected a misspelling 'contarctor' (×3) and inconsistent party name formatting in uploaded Agreement #A-221. Yellow highlights applied.", action: 'Review Doc' },
];

const SAMPLE_AGREEMENTS = [
  { no: 'A-2026-101', type: 'Subcontractor Agreement', party: 'Martinez Electrical LLC', value: '$148,000', status: 'Active'        as const, color: 'green' as const },
  { no: 'A-2026-088', type: 'GC-Owner Contract',       party: 'Lakeside Dev. Group',     value: '$620,000', status: 'Signed'        as const, color: 'blue'  as const },
  { no: 'A-2026-115', type: 'Material Supply',         party: 'Pacific Steel Supply',    value: '$83,500',  status: 'Active'        as const, color: 'green' as const },
  { no: 'A-2026-119', type: 'NDA / Confidentiality',   party: 'Orion Architecture Inc.', value: 'N/A',      status: 'Sent for Review' as const, color: 'amber' as const },
];

const VALUE_CHART = [
  { label: 'Subcontractor',      value: '42%', pct: 42 },
  { label: 'GC-Owner contracts', value: '35%', pct: 35 },
  { label: 'Supply agreements',  value: '15%', pct: 15 },
  { label: 'Other',              value: '8%',  pct: 8  },
];

const EXPIRING_SOON = [
  { no: 'A-2025-077', party: 'Valley Roofing Co.',     daysLeft: 4  },
  { no: 'A-2025-082', party: 'Summit HVAC Services',   daysLeft: 11 },
  { no: 'A-2025-091', party: 'Blue Ridge Concrete',    daysLeft: 19 },
  { no: 'A-2026-003', party: 'Ironwood Framing LLC',   daysLeft: 28 },
];

const CROSS_LINKS = ['E-Signature', 'Attorneys', 'Projects', 'Verification Orders'];

interface AgreementForm {
  agreementType: string; agreementNo: string; partyA: string; partyB: string;
  contractValue: string; startDate: string; endDate: string; paymentTerms: string;
  scopeSummary: string; arbitration: string; liquidatedDamages: string;
  retention: string; status: string;
}

export default function AgreementsDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<AgreementForm>({
    agreementType: '', agreementNo: '', partyA: 'Kluje Contracting LLC', partyB: '',
    contractValue: '', startDate: '', endDate: '', paymentTerms: '',
    scopeSummary: '', arbitration: '', liquidatedDamages: '',
    retention: '', status: '',
  });

  const set = (k: keyof AgreementForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DeptShell
      title="Agreements Department"
      icon={FileText}
      kpis={KPIS}
      aiTips={AI_TIPS}
      onBack={onBack}
    >
      {/* ── New Agreement ── */}
      <SectionCard title="New Agreement">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Agreement Type" required>
              <SelectField
                placeholder="Select type"
                options={['Subcontractor Agreement','General Contract (GC-Owner)','Material Supply','NDA / Confidentiality','JV / Partnership','Consulting','Lease / Equipment Rental','Maintenance','Warranty','Letter of Intent']}
                value={form.agreementType}
                onChange={set('agreementType')}
              />
            </Field>
            <Field label="Agreement #" hint="e.g. A-2026-045">
              <Input value={form.agreementNo} onChange={e => set('agreementNo')(e.target.value)} placeholder="A-2026-045" />
            </Field>
            <Field label="Party A — Your Company">
              <Input value={form.partyA} onChange={e => set('partyA')(e.target.value)} />
            </Field>
            <Field label="Party B — Counterparty" required>
              <Input value={form.partyB} onChange={e => set('partyB')(e.target.value)} placeholder="Counterparty legal name" />
            </Field>
            <Field label="Contract Value ($)" required>
              <Input type="number" value={form.contractValue} onChange={e => set('contractValue')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Payment Terms">
              <SelectField
                placeholder="Select terms"
                options={['Net 7','Net 15','Net 30','Net 45','Net 60','Progress Billing','Milestone-based','50/50 Split','Retainage 10%']}
                value={form.paymentTerms}
                onChange={set('paymentTerms')}
              />
            </Field>
            <Field label="Start Date" required>
              <Input type="date" value={form.startDate} onChange={e => set('startDate')(e.target.value)} />
            </Field>
            <Field label="End Date" required>
              <Input type="date" value={form.endDate} onChange={e => set('endDate')(e.target.value)} />
            </Field>
          </FieldGroup>

          <Field label="Scope of Work Summary" fullWidth>
            <textarea
              value={form.scopeSummary}
              onChange={e => set('scopeSummary')(e.target.value)}
              rows={3}
              className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Brief description of scope..."
            />
          </Field>

          <FieldGroup>
            <Field label="Arbitration Clause">
              <SelectField
                placeholder="Select"
                options={['AAA','JAMS','None','Custom']}
                value={form.arbitration}
                onChange={set('arbitration')}
              />
            </Field>
            <Field label="Liquidated Damages">
              <SelectField
                placeholder="Select"
                options={['Yes — specify amount','No']}
                value={form.liquidatedDamages}
                onChange={set('liquidatedDamages')}
              />
            </Field>
            <Field label="Retention %" hint="Typically 5–10%">
              <Input type="number" value={form.retention} onChange={e => set('retention')(e.target.value)} placeholder="10" />
            </Field>
            <Field label="Status">
              <SelectField
                placeholder="Select status"
                options={['Draft','Sent for Review','Signed','Active','On Hold','Expired','Terminated']}
                value={form.status}
                onChange={set('status')}
              />
            </Field>
          </FieldGroup>

          {/* Upload Signed Agreement — drag-drop zone */}
          <Field label="Upload Signed Agreement" fullWidth>
            <div className="border-2 border-dashed border-orange-400/70 rounded-lg px-4 py-6 flex flex-col items-center gap-2 bg-orange-50/30 dark:bg-orange-950/10 cursor-pointer hover:bg-orange-50/50 transition-colors">
              <Upload className="w-6 h-6 text-orange-400" />
              <p className="text-xs text-muted-foreground text-center">
                Drag &amp; drop signed agreement, or <span className="text-orange-500 font-medium">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">PDF, DOCX — max 25 MB</p>
            </div>
          </Field>

          <OcrBanner />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Save Agreement</Button>
            <Button variant="outline" className="text-xs h-8">Send for E-Signature ↗</Button>
            <Button variant="secondary" className="text-xs h-8">Use Template</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Active Agreements Table ── */}
      <SectionCard title="Active Agreements">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-4 font-medium">Agreement #</th>
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 pr-4 font-medium">Party B</th>
                <th className="text-left py-2 pr-4 font-medium">Value</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_AGREEMENTS.map(row => (
                <tr key={row.no} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-4 font-mono font-medium">{row.no}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.type}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.party}</td>
                  <td className="py-2 pr-4 font-medium">{row.value}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Agreement Value by Type ── */}
      <SectionCard title="Agreement Value by Type">
        <SimpleBarChart data={VALUE_CHART} />
      </SectionCard>

      {/* ── Expiry Calendar Alert ── */}
      <SectionCard title="Expiring Soon">
        <div className="space-y-2">
          {EXPIRING_SOON.map(item => (
            <div key={item.no} className="flex items-center justify-between rounded-md border border-border/40 px-3 py-2 bg-amber-50/30 dark:bg-amber-950/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div>
                  <span className="text-xs font-medium text-foreground">{item.no}</span>
                  <span className="text-[11px] text-muted-foreground ml-2">{item.party}</span>
                </div>
              </div>
              <span className={`text-[11px] font-semibold ${item.daysLeft <= 7 ? 'text-red-600' : 'text-amber-600'}`}>
                {item.daysLeft}d left
              </span>
            </div>
          ))}
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
