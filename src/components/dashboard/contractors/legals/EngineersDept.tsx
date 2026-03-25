import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HardHat, Upload, ExternalLink } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];

const KPIS: KpiItem[] = [
  { label: 'Active Reports',    value: '8',    sub: '3 structural, 5 MEP',          trend: 'neutral' },
  { label: 'Inspections Due',   value: '3',    sub: 'Next: Apr 2 — Site B',         trend: 'down'    },
  { label: 'Compliance Rate',   value: '94%',  sub: '↑ 2% from last quarter',       trend: 'up'      },
  { label: 'Avg Cert. Time',    value: '7 days', sub: 'State avg: 11 days',         trend: 'up'      },
];

const AI_TIPS: AiTip[] = [
  { text: 'Geotechnical report for Project Maple Ave is 14 months old. Most jurisdictions require updated soil reports for permits >12 months old.', action: 'Request Update' },
  { text: 'Two PE stamps on file expire within 90 days. Reminder sent to engineers.', action: 'View Stamps' },
  { text: 'Severe weather alert for zip 90210: ground saturation risk this week. Schedule soil bearing re-check before foundation pour.', action: 'Log Risk' },
  { text: 'AI detected a transposed figure in structural load calc upload — Page 7, Table 3.2. Review with engineer before permit submission.', action: 'Flag Doc' },
];

const SAMPLE_REPORTS = [
  { engineer: 'Dr. A. Santos, PE',   discipline: 'Structural',    project: 'Harbor Lofts',    date: '2026-03-05', status: 'Approved'     as const, color: 'green' as const },
  { engineer: 'M. Petrov, PE',       discipline: 'Geotechnical',  project: 'Maple Ave',       date: '2026-03-14', status: 'In Progress'  as const, color: 'amber' as const },
  { engineer: 'L. Chen, PE',         discipline: 'MEP',           project: 'East Wing Add.',  date: '2026-03-20', status: 'Submitted'    as const, color: 'blue'  as const },
];

const REPORT_CHART = [
  { label: 'Structural',    value: '37%', pct: 37 },
  { label: 'Geotechnical',  value: '22%', pct: 22 },
  { label: 'MEP',           value: '28%', pct: 28 },
  { label: 'Other',         value: '13%', pct: 13 },
];

const CROSS_LINKS = ['Architects', 'Town Planning', 'Projects', 'Fire Dept'];

interface EngForm {
  engineerName: string; peLicense: string; discipline: string; licenseState: string;
  firmName: string; phone: string; email: string; projectLinked: string;
  reportType: string; inspectionDate: string; certificationDate: string;
  expiryDate: string; status: string; notes: string;
}

export default function EngineersDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<EngForm>({
    engineerName: '', peLicense: '', discipline: '', licenseState: '',
    firmName: '', phone: '', email: '', projectLinked: '',
    reportType: '', inspectionDate: '', certificationDate: '',
    expiryDate: '', status: '', notes: '',
  });

  const set = (k: keyof EngForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DeptShell
      title="Engineers Department"
      icon={HardHat}
      kpis={KPIS}
      aiTips={AI_TIPS}
      onBack={onBack}
    >
      {/* ── Add Engineer / Report ── */}
      <SectionCard title="Add Engineer / Report">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Engineer Name" required>
              <Input value={form.engineerName} onChange={e => set('engineerName')(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="PE License #" required>
              <Input value={form.peLicense} onChange={e => set('peLicense')(e.target.value)} placeholder="State PE license number" />
            </Field>
            <Field label="Discipline" required>
              <SelectField
                placeholder="Select discipline"
                options={['Structural','Civil','Geotechnical','Mechanical','Electrical','Plumbing','Environmental','Fire Protection']}
                value={form.discipline}
                onChange={set('discipline')}
              />
            </Field>
            <Field label="License State">
              <SelectField
                placeholder="Select state"
                options={US_STATES}
                value={form.licenseState}
                onChange={set('licenseState')}
              />
            </Field>
            <Field label="Firm Name">
              <Input value={form.firmName} onChange={e => set('firmName')(e.target.value)} placeholder="Engineering firm name" />
            </Field>
            <Field label="Phone">
              <Input type="tel" value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="(555) 000-0000" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={e => set('email')(e.target.value)} placeholder="engineer@firm.com" />
            </Field>
            <Field label="Project Linked">
              <Input value={form.projectLinked} onChange={e => set('projectLinked')(e.target.value)} placeholder="Project name or ID" />
            </Field>
            <Field label="Report Type">
              <SelectField
                placeholder="Select report type"
                options={['Structural Calc','Geotechnical / Soils','MEP Design','Fire Protection','Energy Compliance (Title 24 / IECC)','Site Civil','Drainage','As-Built Certification']}
                value={form.reportType}
                onChange={set('reportType')}
              />
            </Field>
            <Field label="Inspection Date">
              <Input type="date" value={form.inspectionDate} onChange={e => set('inspectionDate')(e.target.value)} />
            </Field>
            <Field label="Certification Date">
              <Input type="date" value={form.certificationDate} onChange={e => set('certificationDate')(e.target.value)} />
            </Field>
            <Field label="Expiry / Re-inspection Date">
              <Input type="date" value={form.expiryDate} onChange={e => set('expiryDate')(e.target.value)} />
            </Field>
          </FieldGroup>

          {/* Upload Report — drag-drop zone */}
          <Field label="Upload Report" fullWidth>
            <div className="border-2 border-dashed border-orange-400/70 rounded-lg px-4 py-6 flex flex-col items-center gap-2 bg-orange-50/30 dark:bg-orange-950/10 cursor-pointer hover:bg-orange-50/50 transition-colors">
              <Upload className="w-6 h-6 text-orange-400" />
              <p className="text-xs text-muted-foreground text-center">
                Drag &amp; drop report file here, or <span className="text-orange-500 font-medium">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">PDF, DOCX — max 50 MB</p>
            </div>
          </Field>

          <OcrBanner />

          <FieldGroup>
            <Field label="Status">
              <SelectField
                placeholder="Select status"
                options={['Ordered','In Progress','Submitted','Approved','Rejected','Expired']}
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
              placeholder="Additional notes..."
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Save</Button>
            <Button variant="outline" className="text-xs h-8">Request Report</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Reports Log ── */}
      <SectionCard title="Reports Log">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-4 font-medium">Engineer</th>
                <th className="text-left py-2 pr-4 font-medium">Discipline</th>
                <th className="text-left py-2 pr-4 font-medium">Project</th>
                <th className="text-left py-2 pr-4 font-medium">Date</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_REPORTS.map(row => (
                <tr key={row.engineer} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-4 font-medium">{row.engineer}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.discipline}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.project}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.date}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Report Type Distribution ── */}
      <SectionCard title="Report Type Distribution">
        <SimpleBarChart data={REPORT_CHART} />
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
