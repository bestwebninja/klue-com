import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Flame, Upload, ExternalLink, BookOpen, AlertTriangle, ClipboardCheck, Phone } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];

const KPIS: KpiItem[] = [
  { label: 'Active Permits',       value: '5',   sub: '2 inspections this week',       trend: 'neutral' },
  { label: 'Pending Inspections',  value: '3',   sub: 'Next: Apr 3 Site A',             trend: 'down'    },
  { label: 'Compliance Score',     value: '91%', sub: '↑ 4% since Q1',                 trend: 'up'      },
  { label: 'Open Violations',      value: '1',   sub: 'Minor — sprinkler clearance',    trend: 'down'    },
];

const AI_TIPS: AiTip[] = [
  {
    text: 'Fire sprinkler permit for Project Oak St expires in 14 days. Renewal requires updated hydraulic calc.',
    action: 'Renew Permit',
  },
  {
    text: 'Jurisdiction Miami-Dade requires 72-hr advance notice for fire inspection scheduling. Project Brickell Ave inspection is in 48 hrs — call now.',
    action: 'Schedule Call',
  },
  {
    text: 'AI found inconsistency in uploaded fire egress plan: Exit B marked as 36" on drawing but code requires 44" minimum for occupancy >50. Flag raised.',
    action: 'Review Drawing',
  },
];

const PERMIT_LOG = [
  { type: 'Sprinkler System',     project: 'Project Oak St',       expiry: '2026-04-08', status: 'Approved'          as const, color: 'green' as const },
  { type: 'Fire Alarm',           project: 'Brickell Ave Complex',  expiry: '2026-05-20', status: 'Inspection Scheduled' as const, color: 'blue'  as const },
  { type: 'Hood & Duct',          project: 'Harbor Lofts Unit B',   expiry: '2026-03-31', status: 'Under Review'      as const, color: 'amber' as const },
  { type: 'Occupancy / CO',       project: 'Maple Ave Residence',   expiry: '2025-12-15', status: 'Expired'           as const, color: 'red'   as const },
];

const COMPLIANCE_CHART = [
  { label: 'Q2 2025', value: '78%', pct: 78 },
  { label: 'Q3 2025', value: '83%', pct: 83 },
  { label: 'Q4 2025', value: '88%', pct: 88 },
  { label: 'Q1 2026', value: '91%', pct: 91 },
];

const VIOLATION_LOG = [
  { code: 'NFPA 13 §8.3.1', site: 'Project Oak St',       description: 'Sprinkler head clearance <18" from storage',     status: 'Open'     as const, color: 'amber' as const },
  { code: 'IBC §1005.1',    site: 'Brickell Ave Complex', description: 'Exit corridor width reduced to 36" by equipment', status: 'Resolved' as const, color: 'green' as const },
];

const AHJ_CONTACTS = [
  { jurisdiction: 'Miami-Dade Fire Rescue',     phone: '(786) 331-4100', email: 'permits@miamidade.gov'   },
  { jurisdiction: 'City of Miami Fire Dept',    phone: '(305) 416-1600', email: 'fire@miamigov.com'       },
  { jurisdiction: 'Broward County Fire Safety', phone: '(954) 831-8200', email: 'firesafety@broward.org'  },
];

const INSPECTION_CHECKLIST = [
  { item: 'Sprinkler heads unobstructed and within clearance spec', done: true  },
  { item: 'Fire alarm panel functional — all zones tested',         done: true  },
  { item: 'Egress routes marked and unobstructed',                  done: false },
  { item: 'Fire extinguisher inspection tags current (<1 year)',    done: false },
  { item: 'Knox box installed and accessible at main entry',        done: true  },
  { item: 'Hydraulic calculations stamped and on-site',             done: false },
];

const CROSS_LINKS = ['Health & Safety', 'Architects', 'Engineers', 'Town Planning'];

interface PermitForm {
  permitType: string; permitNo: string; projectName: string; projectAddress: string;
  jurisdiction: string; state: string; zipCode: string; inspectorName: string;
  inspectorPhone: string; applicationDate: string; inspectionDate: string;
  expiryDate: string; feePaid: string; status: string; notes: string;
}

export default function FireDeptDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<PermitForm>({
    permitType: '', permitNo: '', projectName: '', projectAddress: '',
    jurisdiction: '', state: '', zipCode: '', inspectorName: '',
    inspectorPhone: '', applicationDate: '', inspectionDate: '',
    expiryDate: '', feePaid: '', status: '', notes: '',
  });

  const set = (k: keyof PermitForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DeptShell
      title="Fire Department"
      icon={Flame}
      kpis={KPIS}
      aiTips={AI_TIPS}
      onBack={onBack}
    >
      {/* ── Add Fire Permit / Inspection ── */}
      <SectionCard title="Add Fire Permit / Inspection">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Permit Type" required>
              <SelectField
                placeholder="Select permit type"
                options={[
                  'Building Permit — Fire','Sprinkler System','Fire Alarm',
                  'Suppression System','Hood & Duct','Special Hazard',
                  'Occupancy / CO','Annual Inspection','Variance',
                ]}
                value={form.permitType}
                onChange={set('permitType')}
              />
            </Field>
            <Field label="Permit #">
              <Input value={form.permitNo} onChange={e => set('permitNo')(e.target.value)} placeholder="e.g. FP-2026-00421" />
            </Field>
            <Field label="Project Name" required>
              <Input value={form.projectName} onChange={e => set('projectName')(e.target.value)} placeholder="Project name" />
            </Field>
            <Field label="Project Address" fullWidth>
              <Input value={form.projectAddress} onChange={e => set('projectAddress')(e.target.value)} placeholder="Full street address" />
            </Field>
            <Field label="Jurisdiction / AHJ" hint="Authority Having Jurisdiction (city, county fire marshal)">
              <Input value={form.jurisdiction} onChange={e => set('jurisdiction')(e.target.value)} placeholder="e.g. Miami-Dade Fire Rescue" />
            </Field>
            <Field label="State">
              <SelectField
                placeholder="Select state"
                options={US_STATES}
                value={form.state}
                onChange={set('state')}
              />
            </Field>
            <Field label="Zip Code" required hint="Used for weather & jurisdiction lookup">
              <Input value={form.zipCode} onChange={e => set('zipCode')(e.target.value)} placeholder="e.g. 33101" />
            </Field>
            <Field label="Inspector Name">
              <Input value={form.inspectorName} onChange={e => set('inspectorName')(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Inspector Phone">
              <Input type="tel" value={form.inspectorPhone} onChange={e => set('inspectorPhone')(e.target.value)} placeholder="(305) 555-0000" />
            </Field>
            <Field label="Application Date" required>
              <Input type="date" value={form.applicationDate} onChange={e => set('applicationDate')(e.target.value)} />
            </Field>
            <Field label="Inspection Date">
              <Input type="date" value={form.inspectionDate} onChange={e => set('inspectionDate')(e.target.value)} />
            </Field>
            <Field label="Expiry Date">
              <Input type="date" value={form.expiryDate} onChange={e => set('expiryDate')(e.target.value)} />
            </Field>
            <Field label="Fee Paid">
              <Input type="number" value={form.feePaid} onChange={e => set('feePaid')(e.target.value)} placeholder="0.00" />
            </Field>
          </FieldGroup>

          {/* Upload Permit / Plans drag-drop zone */}
          <Field label="Upload Permit / Plans" fullWidth>
            <div className="border-2 border-dashed border-orange-400/70 rounded-lg px-4 py-6 flex flex-col items-center gap-2 bg-orange-50/30 dark:bg-orange-950/10 cursor-pointer hover:bg-orange-50/50 transition-colors">
              <Upload className="w-6 h-6 text-orange-400" />
              <p className="text-xs text-muted-foreground text-center">
                Drag &amp; drop permit or plans here, or <span className="text-orange-500 font-medium">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">PDF, PNG, DWG — max 50 MB</p>
            </div>
            <div className="mt-2">
              <OcrBanner />
            </div>
          </Field>

          <FieldGroup>
            <Field label="Status">
              <SelectField
                placeholder="Select status"
                options={[
                  'Application Submitted','Under Review','Approved',
                  'Inspection Scheduled','Passed','Failed — Re-inspection Required',
                  'Expired','Closed',
                ]}
                value={form.status}
                onChange={set('status')}
              />
            </Field>
          </FieldGroup>

          <Field label="Notes" fullWidth>
            <textarea
              value={form.notes}
              onChange={e => set('notes')(e.target.value)}
              rows={3}
              className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Additional notes, conditions, or special requirements..."
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Save Permit</Button>
            <Button variant="outline" className="text-xs h-8">Schedule Inspection</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Permit Log ── */}
      <SectionCard title="Permit Log">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-4 font-medium">Permit Type</th>
                <th className="text-left py-2 pr-4 font-medium">Project</th>
                <th className="text-left py-2 pr-4 font-medium">Expiry</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {PERMIT_LOG.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-4 font-medium">{row.type}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.project}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.expiry}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Compliance Trend ── */}
      <SectionCard title="Compliance Trend">
        <SimpleBarChart data={COMPLIANCE_CHART} colorClass="bg-orange-400" />
      </SectionCard>

      {/* ── Violations Log ── */}
      <SectionCard title="Open Violations">
        <div className="space-y-2">
          {VIOLATION_LOG.map((v, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-md border border-border/40 hover:bg-muted/20 transition-colors">
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${v.status === 'Open' ? 'text-amber-500' : 'text-emerald-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground font-mono">{v.code}</span>
                  <StatusBadge status={v.status} color={v.color} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{v.site} — {v.description}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Pre-Inspection Checklist ── */}
      <SectionCard title="Pre-Inspection Readiness Checklist" action={{ label: 'Export PDF', onClick: () => {} }}>
        <div className="space-y-2">
          {INSPECTION_CHECKLIST.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 py-2 px-3 rounded-md border transition-colors ${
                item.done
                  ? 'border-emerald-200/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-border/40 hover:bg-muted/20'
              }`}
            >
              <ClipboardCheck className={`w-3.5 h-3.5 shrink-0 ${item.done ? 'text-emerald-500' : 'text-muted-foreground'}`} />
              <span className={`text-xs flex-1 ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {item.item}
              </span>
              <span className={`text-[10px] font-medium shrink-0 ${item.done ? 'text-emerald-600' : 'text-amber-600'}`}>
                {item.done ? 'Ready' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/40">
          {INSPECTION_CHECKLIST.filter(c => c.done).length} of {INSPECTION_CHECKLIST.length} items confirmed ready.
        </p>
      </SectionCard>

      {/* ── AHJ Contact Directory ── */}
      <SectionCard title="AHJ Contact Directory">
        <div className="space-y-2">
          {AHJ_CONTACTS.map((ahj, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-md border border-border/40 hover:bg-muted/20 transition-colors">
              <Phone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{ahj.jurisdiction}</p>
                <p className="text-[11px] text-muted-foreground">{ahj.phone} · {ahj.email}</p>
              </div>
              <button className="text-[10px] text-orange-500 hover:text-orange-600 font-medium shrink-0">Call ↗</button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Code Reference ── */}
      <div className="flex items-start gap-2.5 bg-muted/40 border border-border/60 rounded-lg px-4 py-3">
        <BookOpen className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-semibold text-foreground mb-0.5">Code References</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            NFPA 101 Life Safety Code &nbsp;|&nbsp; NFPA 13 Sprinkler Systems &nbsp;|&nbsp; NFPA 72 Fire Alarm &nbsp;|&nbsp; IBC 2021 &nbsp;|&nbsp; Local AHJ amendments apply
          </p>
        </div>
      </div>

      {/* ── Upcoming Inspections ── */}
      <SectionCard title="Upcoming Inspections" action={{ label: 'Add Inspection', onClick: () => {} }}>
        <div className="space-y-2">
          {[
            { site: 'Project Oak St',       type: 'Sprinkler Final',       date: 'Apr 3, 2026',  inspector: 'Insp. Ramirez', confirmed: true  },
            { site: 'Brickell Ave Complex', type: 'Fire Alarm Rough-in',   date: 'Apr 8, 2026',  inspector: 'Insp. Torres',  confirmed: true  },
            { site: 'Harbor Lofts Unit B',  type: 'Hood & Duct Pre-final', date: 'Apr 15, 2026', inspector: 'TBD',           confirmed: false },
          ].map((insp, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                insp.confirmed
                  ? 'border-blue-200/60 bg-blue-50/20 dark:bg-blue-950/10'
                  : 'border-border/40 hover:bg-muted/20'
              }`}
            >
              <div className="flex flex-col items-center justify-center bg-orange-500/10 rounded-md w-10 h-10 shrink-0">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[8px] text-orange-600 font-semibold mt-0.5 leading-none text-center">INSP</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-foreground">{insp.type}</p>
                  <StatusBadge
                    status={insp.confirmed ? 'Confirmed' : 'Pending'}
                    color={insp.confirmed ? 'blue' : 'amber'}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{insp.site} · {insp.date} · {insp.inspector}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border/40">
          Miami-Dade AHJ requires 72-hr advance scheduling notice. Kluje auto-sends confirmation emails.
        </p>
      </SectionCard>

      {/* ── Permit Renewal Reminders ── */}
      <SectionCard title="Permit Renewal Reminders">
        <div className="space-y-2.5">
          {[
            { permit: 'Sprinkler System — Project Oak St', daysLeft: 14, urgent: true  },
            { permit: 'Hood & Duct — Harbor Lofts',        daysLeft: 6,  urgent: true  },
            { permit: 'Fire Alarm — Brickell Ave',         daysLeft: 56, urgent: false },
          ].map((r, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-muted-foreground">{r.permit}</span>
                <span className={`font-semibold ${r.urgent ? 'text-red-600' : 'text-emerald-600'}`}>
                  {r.daysLeft}d left
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${r.urgent ? 'bg-red-400' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.max(5, 100 - Math.round(r.daysLeft / 180 * 100))}%` }}
                />
              </div>
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
