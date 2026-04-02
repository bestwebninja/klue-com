import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PenTool, Upload, Info, ExternalLink } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];

const KPIS: KpiItem[] = [
  { label: 'Active Projects',    value: '6',       sub: '2 drawings pending approval',  trend: 'neutral' },
  { label: 'Avg Approval Time',  value: '12 days', sub: '↓ from 18 days',               trend: 'up'      },
  { label: 'Revision Cycles',    value: '2.4 avg', sub: 'Industry avg: 3.1',             trend: 'up'      },
  { label: 'Open RFIs',          value: '9',       sub: '3 unanswered >5 days',          trend: 'down'    },
];

const AI_TIPS: AiTip[] = [
  { text: 'Drawing revision for Project #P-204 (East Wing addition) is on rev 4 — above average. Schedule design coordination meeting.', action: 'Schedule' },
  { text: 'Architect license for Reynolds Design Group expires in 62 days in FL. Renewal notice auto-sent.', action: 'Verify' },
  { text: 'AI detected mismatched door schedule dimensions on uploaded PDF — Sheet A2.3. Yellow highlight applied to flagged section.', action: 'Review' },
  { text: 'Avg architectural fee for residential renovation in your zip: 8–12% of construction cost. Current fee at 9.5% is on par.', action: 'Compare' },
];

const SAMPLE_DRAWINGS = [
  { sheet: 'A2.1', project: 'Project Maple Ave', rev: 'Rev 3', date: '2026-03-10', status: 'Approved'   as const, color: 'green'  as const },
  { sheet: 'A2.3', project: 'East Wing Addition', rev: 'Rev 4', date: '2026-03-18', status: 'In Review'  as const, color: 'amber'  as const },
  { sheet: 'S1.0', project: 'Harbor Lofts Unit B', rev: 'Rev 1', date: '2026-03-22', status: 'Draft'     as const, color: 'gray'   as const },
];

const APPROVAL_CHART = [
  { label: 'Approved',             value: '58%', pct: 58 },
  { label: 'In Review',            value: '25%', pct: 25 },
  { label: 'Rejected / Revised',   value: '17%', pct: 17 },
];

const CROSS_LINKS = ['Engineers', 'Projects', 'Town Planning', 'Agreements'];

interface DrawingForm {
  architectName: string; firmName: string; licenseNo: string; licenseState: string;
  projectName: string; projectAddress: string; drawingType: string; sheetNumber: string;
  revisionNo: string; scale: string; drawingDate: string; approvalDeadline: string;
  status: string; notes: string;
}

export default function ArchitectsDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<DrawingForm>({
    architectName: '', firmName: '', licenseNo: '', licenseState: '',
    projectName: '', projectAddress: '', drawingType: '', sheetNumber: '',
    revisionNo: '', scale: '', drawingDate: '', approvalDeadline: '',
    status: '', notes: '',
  });

  const set = (k: keyof DrawingForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DeptShell
      title="Architects Department"
      icon={PenTool}
      kpis={KPIS}
      aiTips={AI_TIPS}
      onBack={onBack}
    >
      {/* ── Add Drawing / Project ── */}
      <SectionCard title="Add Drawing / Project">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Architect Name" required>
              <Input value={form.architectName} onChange={e => set('architectName')(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Firm Name" required>
              <Input value={form.firmName} onChange={e => set('firmName')(e.target.value)} placeholder="e.g. Reynolds Design Group" />
            </Field>
            <Field label="License #" required>
              <Input value={form.licenseNo} onChange={e => set('licenseNo')(e.target.value)} placeholder="State license number" />
            </Field>
            <Field label="License State" required>
              <SelectField
                placeholder="Select state"
                options={US_STATES}
                value={form.licenseState}
                onChange={set('licenseState')}
              />
            </Field>
            <Field label="Project Name" required>
              <Input value={form.projectName} onChange={e => set('projectName')(e.target.value)} placeholder="Project name" />
            </Field>
            <Field label="Project Address" fullWidth>
              <Input value={form.projectAddress} onChange={e => set('projectAddress')(e.target.value)} placeholder="Full street address" />
            </Field>
            <Field label="Drawing Type">
              <SelectField
                placeholder="Select type"
                options={['Floor Plan','Elevation','Section','Structural','MEP (Mechanical/Electrical/Plumbing)','Site Plan','Foundation','Roof Plan','Details','As-Built']}
                value={form.drawingType}
                onChange={set('drawingType')}
              />
            </Field>
            <Field label="Sheet Number" hint="e.g. A2.1, S1.0">
              <Input value={form.sheetNumber} onChange={e => set('sheetNumber')(e.target.value)} placeholder="A2.1" />
            </Field>
            <Field label="Revision #" hint="e.g. Rev 0, Rev 1A">
              <Input value={form.revisionNo} onChange={e => set('revisionNo')(e.target.value)} placeholder="Rev 0" />
            </Field>
            <Field label="Scale">
              <SelectField
                placeholder="Select scale"
                options={["1/8\" = 1'-0\"","1/4\" = 1'-0\"","1/16\" = 1'-0\"",'NTS','1:100','1:50']}
                value={form.scale}
                onChange={set('scale')}
              />
            </Field>
            <Field label="Drawing Date" required>
              <Input type="date" value={form.drawingDate} onChange={e => set('drawingDate')(e.target.value)} />
            </Field>
            <Field label="Approval Deadline">
              <Input type="date" value={form.approvalDeadline} onChange={e => set('approvalDeadline')(e.target.value)} />
            </Field>
          </FieldGroup>

          {/* Upload Drawing — drag-drop zone */}
          <Field label="Upload Drawing" fullWidth>
            <div className="contractor-upload-zone">
              <Upload className="w-6 h-6 text-orange-400" />
              <p className="text-xs text-muted-foreground text-center">
                Drag &amp; drop drawing file here, or <span className="text-orange-500 font-medium">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">PDF, DWG, DXF, PNG — max 50 MB</p>
              <p className="text-[10px] text-orange-500/80 font-medium">Copyright watermark with firm logo auto-applied on share</p>
            </div>
          </Field>

          <FieldGroup>
            <Field label="Status">
              <SelectField
                placeholder="Select status"
                options={['Draft','In Review','Approved','Rejected','Superseded']}
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

          {/* Copyright info box */}
          <div className="flex items-start gap-2.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 rounded-lg px-3.5 py-2.5">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Copyright Notice:</span> All drawings shared via Kluje are watermarked with the architect's firm name and license number. Internal view only.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Save Drawing</Button>
            <Button variant="outline" className="text-xs h-8">Request Approval</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Drawings Library ── */}
      <SectionCard title="Drawings Library">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-4 font-medium">Sheet</th>
                <th className="text-left py-2 pr-4 font-medium">Project</th>
                <th className="text-left py-2 pr-4 font-medium">Revision</th>
                <th className="text-left py-2 pr-4 font-medium">Date</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_DRAWINGS.map(row => (
                <tr key={row.sheet} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-4 font-mono font-medium">{row.sheet}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.project}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.rev}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.date}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Approval Status Chart ── */}
      <SectionCard title="Approval Status">
        <SimpleBarChart data={APPROVAL_CHART} />
      </SectionCard>

      {/* ── OCR Banner ── */}
      <OcrBanner />

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
