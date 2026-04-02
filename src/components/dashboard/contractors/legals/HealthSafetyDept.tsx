import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Upload, ExternalLink, ClipboardList, CheckSquare, Square, GraduationCap, Info } from 'lucide-react';

const KPIS: KpiItem[] = [
  { label: 'Days w/o Incident',       value: '47',   sub: 'Record: 93 days',           trend: 'up'      },
  { label: 'OSHA Recordable Rate',     value: '2.1',  sub: 'Industry avg: 2.3',         trend: 'up'      },
  { label: 'Open Corrective Actions',  value: '3',    sub: 'Due within 7 days',          trend: 'down'    },
  { label: 'Training Compliance',      value: '88%',  sub: 'Target: 100%',              trend: 'neutral' },
];

const AI_TIPS: AiTip[] = [
  {
    text: 'OSHA 300A summary posting deadline is Feb 1. Your 2025 log shows 2 recordable incidents — ensure posted at each job site by deadline.',
    action: 'View OSHA 300',
  },
  {
    text: 'Severe weather alert for project zip 33142: High winds >35 mph forecast Fri–Sat. OSHA 1926.502 requires fall protection review when winds exceed threshold.',
    action: 'Issue Safety Alert',
  },
  {
    text: "Subcontractor Ray's Masonry LLC has not submitted toolbox talk sign-in sheets for the past 3 weeks. Compliance risk.",
    action: 'Send Reminder',
  },
  {
    text: "Based on your incident history, slips/trips on scaffolding account for 60% of near-misses. AI recommends weekly scaffold inspection log.",
    action: 'Add Checklist',
  },
];

const INCIDENT_LOG = [
  { type: 'Near Miss',        site: 'Project Oak St',       date: '2026-03-14', status: 'Closed'                          as const, color: 'gray'  as const },
  { type: 'OSHA Recordable',  site: 'Brickell Ave Complex', date: '2026-02-28', status: 'Corrective Action in Progress'   as const, color: 'amber' as const },
  { type: 'First Aid',        site: 'Harbor Lofts Unit B',  date: '2026-03-05', status: 'Closed'                          as const, color: 'gray'  as const },
  { type: 'Near Miss',        site: 'Maple Ave Residence',  date: '2026-03-20', status: 'Open'                            as const, color: 'red'   as const },
];

const INCIDENT_CHART = [
  { label: 'Slips / Trips / Falls', value: '38%', pct: 38 },
  { label: 'Tool / Equipment',      value: '27%', pct: 27 },
  { label: 'Material Handling',     value: '22%', pct: 22 },
  { label: 'Other',                 value: '13%', pct: 13 },
];

const TOOLBOX_TOPICS = [
  { topic: 'Fall Protection & Scaffold Inspection',  done: true  },
  { topic: 'PPE Requirements — Hand & Eye Safety',   done: true  },
  { topic: 'Electrical Hazard Awareness',            done: false },
  { topic: 'Heat Illness Prevention Protocol',       done: false },
];

const TRAINING_RECORDS = [
  { name: 'Carlos Rivera',    role: 'Foreman',       osha10: true,  osha30: true,  firstAid: true,  hazcom: true  },
  { name: 'James Tompkins',   role: 'Carpenter',     osha10: true,  osha30: false, firstAid: true,  hazcom: false },
  { name: 'Luis Mendez',      role: 'Mason — Sub',   osha10: false, osha30: false, firstAid: false, hazcom: false },
  { name: 'Asha Williams',    role: 'Site Supervisor',osha10: true, osha30: true,  firstAid: true,  hazcom: true  },
];

const CORRECTIVE_ACTIONS = [
  { action: 'Install additional fall protection netting — Brickell Level 3', assignee: 'C. Rivera', due: '2026-03-28', done: false },
  { action: 'Replace frayed extension cord — Oak St electrical room',        assignee: 'J. Tompkins', due: '2026-03-26', done: true  },
  { action: 'Submit updated scaffold inspection log — all sites',            assignee: 'A. Williams', due: '2026-04-01', done: false },
];

const CROSS_LINKS = ['Verification Orders', 'Projects', 'Insurance', 'Security'];

interface IncidentForm {
  reportType: string; incidentDate: string; incidentTime: string;
  locationSite: string; injuredPartyName: string; injuredPartyRole: string;
  description: string; oshaRecordable: string; daysAway: string;
  rootCause: string; correctiveAction: string; correctiveActionDue: string;
  assignedTo: string; status: string;
}

export default function HealthSafetyDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<IncidentForm>({
    reportType: '', incidentDate: '', incidentTime: '',
    locationSite: '', injuredPartyName: '', injuredPartyRole: '',
    description: '', oshaRecordable: '', daysAway: '',
    rootCause: '', correctiveAction: '', correctiveActionDue: '',
    assignedTo: '', status: '',
  });

  const set = (k: keyof IncidentForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DeptShell
      title="Health & Safety Department"
      icon={ShieldAlert}
      kpis={KPIS}
      aiTips={AI_TIPS}
      onBack={onBack}
    >
      {/* ── Report Incident / Near Miss ── */}
      <SectionCard title="Report Incident / Near Miss">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Report Type" required>
              <SelectField
                placeholder="Select report type"
                options={[
                  'Near Miss','First Aid','OSHA Recordable','Lost Time Injury',
                  'Fatality','Property Damage','Environmental Spill',
                ]}
                value={form.reportType}
                onChange={set('reportType')}
              />
            </Field>
            <Field label="Incident Date" required>
              <Input type="date" value={form.incidentDate} onChange={e => set('incidentDate')(e.target.value)} />
            </Field>
            <Field label="Incident Time" required>
              <Input type="time" value={form.incidentTime} onChange={e => set('incidentTime')(e.target.value)} />
            </Field>
            <Field label="Location / Site" required>
              <Input value={form.locationSite} onChange={e => set('locationSite')(e.target.value)} placeholder="e.g. Project Oak St — Level 2" />
            </Field>
            <Field label="Injured Party Name">
              <Input value={form.injuredPartyName} onChange={e => set('injuredPartyName')(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Injured Party Role">
              <SelectField
                placeholder="Select role"
                options={['Employee','Subcontractor','Visitor','Public']}
                value={form.injuredPartyRole}
                onChange={set('injuredPartyRole')}
              />
            </Field>
          </FieldGroup>

          <Field label="Description of Incident" required fullWidth>
            <textarea
              value={form.description}
              onChange={e => set('description')(e.target.value)}
              rows={4}
              className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Describe what happened, sequence of events, conditions present..."
            />
          </Field>

          <FieldGroup>
            <Field label="OSHA Recordable?">
              <SelectField
                placeholder="Select"
                options={['Yes','No','Under Review']}
                value={form.oshaRecordable}
                onChange={set('oshaRecordable')}
              />
            </Field>
            <Field label="Days Away from Work">
              <Input type="number" value={form.daysAway} onChange={e => set('daysAway')(e.target.value)} placeholder="0" />
            </Field>
            <Field label="Root Cause">
              <SelectField
                placeholder="Select root cause"
                options={[
                  'Equipment Failure','Human Error','Inadequate Training',
                  'PPE Non-compliance','Weather/Environmental',
                  'Unsafe Condition','Procedure Not Followed',
                ]}
                value={form.rootCause}
                onChange={set('rootCause')}
              />
            </Field>
          </FieldGroup>

          <Field label="Corrective Action Required" fullWidth>
            <textarea
              value={form.correctiveAction}
              onChange={e => set('correctiveAction')(e.target.value)}
              rows={3}
              className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Describe corrective or preventive actions to be taken..."
            />
          </Field>

          <FieldGroup>
            <Field label="Corrective Action Due Date">
              <Input type="date" value={form.correctiveActionDue} onChange={e => set('correctiveActionDue')(e.target.value)} />
            </Field>
            <Field label="Assigned To">
              <Input value={form.assignedTo} onChange={e => set('assignedTo')(e.target.value)} placeholder="Name or team" />
            </Field>
          </FieldGroup>

          {/* Upload Incident Photos / Forms */}
          <Field label="Upload Incident Photos / Forms" fullWidth>
            <div className="contractor-upload-zone border-red-500/70 dark:border-red-400/60 bg-white/95 dark:bg-slate-900 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50/60 dark:hover:bg-red-950/20">
              <Upload className="w-6 h-6 text-red-400" />
              <p className="text-xs text-muted-foreground text-center">
                Drag &amp; drop photos or OSHA forms here, or <span className="text-orange-500 font-medium">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG — max 50 MB</p>
            </div>
            <div className="mt-2">
              <OcrBanner />
            </div>
          </Field>

          <FieldGroup>
            <Field label="Status">
              <SelectField
                placeholder="Select status"
                options={['Open','Under Investigation','Corrective Action in Progress','Closed']}
                value={form.status}
                onChange={set('status')}
              />
            </Field>
          </FieldGroup>

          <div className="flex gap-2 pt-1">
            <Button className="bg-red-600 hover:bg-red-700 text-white text-xs h-8">Submit Report</Button>
            <Button variant="outline" className="text-xs h-8">Save Draft</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Incident Log ── */}
      <SectionCard title="Incident Log">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 pr-4 font-medium">Site</th>
                <th className="text-left py-2 pr-4 font-medium">Date</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {INCIDENT_LOG.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-4 font-medium">{row.type}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.site}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.date}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Incident Type Breakdown ── */}
      <SectionCard title="Incident Type Breakdown">
        <SimpleBarChart data={INCIDENT_CHART} colorClass="bg-red-400" />
      </SectionCard>

      {/* ── OSHA 300 Summary ── */}
      <SectionCard title="OSHA 300 Summary">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Recordables', value: '2' },
            { label: 'Days Away',          value: '5' },
            { label: 'Restricted Work',    value: '1' },
          ].map(item => (
            <div key={item.label} className="text-center bg-muted/30 rounded-lg py-3 px-2">
              <div className="text-[22px] font-semibold text-foreground leading-none">{item.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1 leading-tight">{item.label}</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
          OSHA 300A annual summary required to be posted at each jobsite from Feb 1 – Apr 30.
        </p>
      </SectionCard>

      {/* ── Toolbox Talk Tracker ── */}
      <SectionCard title="Toolbox Talk Tracker" action={{ label: 'Add Topic', onClick: () => {} }}>
        <div className="space-y-2">
          {TOOLBOX_TOPICS.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 px-3 rounded-md border border-border/40 hover:bg-muted/30 transition-colors"
            >
              {item.done
                ? <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                : <Square className="w-4 h-4 text-muted-foreground shrink-0" />
              }
              <span className={`text-xs flex-1 ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {item.topic}
              </span>
              {item.done
                ? <span className="text-[10px] text-emerald-600 font-medium">Completed</span>
                : <span className="text-[10px] text-amber-600 font-medium">Pending</span>
              }
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
          <ClipboardList className="w-3.5 h-3.5 text-orange-500" />
          <p className="text-[11px] text-muted-foreground">Sign-in sheets required per subcontractor per weekly session.</p>
        </div>
      </SectionCard>

      {/* ── Training Compliance Matrix ── */}
      <SectionCard title="Training Compliance Matrix" action={{ label: 'Export Matrix', onClick: () => {} }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Name</th>
                <th className="text-left py-2 pr-3 font-medium">Role</th>
                <th className="text-center py-2 pr-3 font-medium">OSHA 10</th>
                <th className="text-center py-2 pr-3 font-medium">OSHA 30</th>
                <th className="text-center py-2 pr-3 font-medium">First Aid</th>
                <th className="text-center py-2 font-medium">HAZCOM</th>
              </tr>
            </thead>
            <tbody>
              {TRAINING_RECORDS.map((row, i) => {
                const cell = (val: boolean) => (
                  <td key={String(val) + i} className="py-2 pr-3 text-center">
                    {val
                      ? <span className="text-emerald-500 font-bold">✓</span>
                      : <span className="text-red-400 font-bold">✗</span>
                    }
                  </td>
                );
                return (
                  <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-2 pr-3 font-medium">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3 h-3 text-muted-foreground" />
                        {row.name}
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{row.role}</td>
                    {cell(row.osha10)}
                    {cell(row.osha30)}
                    {cell(row.firstAid)}
                    {cell(row.hazcom)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border/40">
          All field workers must hold OSHA 10 minimum. OSHA 30 required for supervisors and foremen.
        </p>
      </SectionCard>

      {/* ── Open Corrective Actions ── */}
      <SectionCard title="Open Corrective Actions">
        <div className="space-y-2">
          {CORRECTIVE_ACTIONS.map((ca, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                ca.done
                  ? 'border-emerald-200/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-border/40 hover:bg-muted/20'
              }`}
            >
              {ca.done
                ? <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                : <Square className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${ca.done ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                  {ca.action}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Assigned: {ca.assignee} · Due: {ca.due}
                </p>
              </div>
              <span className={`text-[10px] font-medium shrink-0 ${ca.done ? 'text-emerald-600' : 'text-amber-600'}`}>
                {ca.done ? 'Closed' : 'Open'}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── OSHA Info Box ── */}
      <div className="flex items-start gap-2.5 bg-muted/40 border border-border/60 rounded-lg px-4 py-3">
        <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-semibold text-foreground mb-0.5">OSHA Recordkeeping — Quick Reference</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            OSHA 300 log must be maintained for all work-related injuries. OSHA 300A must be posted Feb 1–Apr 30. OSHA 301 incident report due within 7 days of recordable event. Fatalities must be reported within 8 hours.
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
