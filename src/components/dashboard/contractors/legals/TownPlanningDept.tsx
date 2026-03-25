import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Upload, ExternalLink, Search } from 'lucide-react';

const KPIS: KpiItem[] = [
  { label: 'Active Permits',      value: '11',      sub: '7 building, 4 specialty',       trend: 'up'     },
  { label: 'Avg Approval Time',   value: '22 days', sub: 'Jurisdiction avg: 31 days',     trend: 'up'     },
  { label: 'Approval Rate',       value: '87%',     sub: '↑ 5% this year',                trend: 'up'     },
  { label: 'Fees Paid YTD',       value: '$14,800', sub: 'Across all permits',            trend: 'neutral'},
];

const AI_TIPS: AiTip[] = [
  {
    text: 'Building permit for 221 Oak St has been pending 34 days — above average for Miami-Dade (28-day target). AI recommends following up with plan examiner.',
    action: 'Call Examiner',
  },
  {
    text: 'Zoning lookup for 8820 Brickell Ave (zip 33131): Currently zoned T6-8 (Urban Center). Mixed-use development permitted by right. AI flags development opportunity.',
    action: 'View Zoning',
  },
  {
    text: 'Permit for electrical at Coral Way project: requires licensed Master Electrician pull per FL statute 489. Verify subcontractor EC license on file.',
    action: 'Check License',
  },
  {
    text: 'Weather: Heavy rain forecast for zip 33101 this week. Grading permits typically require dry conditions — notify inspector to reschedule if needed.',
    action: 'Contact Inspector',
  },
];

const PERMIT_TABLE = [
  { type: 'Building Permit',   jurisdiction: 'Miami-Dade County', submitted: '2026-02-19', status: 'Under Review'         as const, color: 'blue'  as const },
  { type: 'Electrical',        jurisdiction: 'City of Miami',     submitted: '2026-03-01', status: 'Corrections Required' as const, color: 'amber' as const },
  { type: 'Plumbing',          jurisdiction: 'City of Miami',     submitted: '2026-03-05', status: 'Approved'             as const, color: 'green' as const },
  { type: 'Roofing',           jurisdiction: 'Miami Beach',       submitted: '2026-03-10', status: 'Submitted'            as const, color: 'blue'  as const },
  { type: 'Zoning Variance',   jurisdiction: 'Coral Gables',     submitted: '2026-02-28', status: 'Under Review'         as const, color: 'blue'  as const },
];

const PERMIT_TYPE_CHART = [
  { label: 'Building',   value: '42%', pct: 42 },
  { label: 'Electrical', value: '18%', pct: 18 },
  { label: 'Plumbing',   value: '15%', pct: 15 },
  { label: 'Specialty',  value: '25%', pct: 25 },
];

const JURISDICTION_CHART = [
  { label: 'City of Miami (fastest)',  value: '18 days', pct: 60  },
  { label: 'Miami-Dade County',        value: '28 days', pct: 90  },
  { label: 'Coral Gables (slowest)',   value: '41 days', pct: 100 },
];

const PERMIT_TYPES = [
  'Building Permit','Demolition','Grading / Earthwork','Electrical','Plumbing',
  'Mechanical / HVAC','Roofing','Zoning Variance','Special Exception',
  'Environmental / Wetlands','Sign Permit','Temporary Structures','Certificate of Occupancy',
];
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];
const STATUS_OPTIONS = [
  'Draft / Not Submitted','Submitted','Under Review','Corrections Required',
  'Approved','Issued','Inspection Pending','Final / CO Issued','Expired','Denied',
];

const CROSS_LINKS = ['Fire Dept', 'Engineers', 'Architects', 'Health & Safety', 'Projects'];

interface PermitForm {
  permitType: string; applicationNo: string; projectName: string;
  projectAddress: string; city: string; state: string; zip: string;
  jurisdiction: string; examiner: string; examinerPhone: string;
  submissionDate: string; approvalDate: string; expiryDate: string;
  permitFee: string; valuation: string; zoningDistrict: string;
  status: string; notes: string;
}

export default function TownPlanningDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<PermitForm>({
    permitType: '', applicationNo: '', projectName: '',
    projectAddress: '', city: '', state: '', zip: '',
    jurisdiction: '', examiner: '', examinerPhone: '',
    submissionDate: '', approvalDate: '', expiryDate: '',
    permitFee: '', valuation: '', zoningDistrict: '',
    status: '', notes: '',
  });
  const [zoningZip, setZoningZip] = useState('');

  const set = (k: keyof PermitForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DeptShell
      title="Town Planning & Permits"
      icon={MapPin}
      kpis={KPIS}
      aiTips={AI_TIPS}
      weatherWarning="Heavy rain forecast for zip 33101 this week. Grading inspections may be delayed — contact your plan examiner proactively."
      onBack={onBack}
    >
      {/* ── Add Permit Application ── */}
      <SectionCard title="Add Permit Application">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Permit Type">
              <SelectField placeholder="Select permit type" options={PERMIT_TYPES} value={form.permitType} onChange={set('permitType')} />
            </Field>
            <Field label="Application #">
              <Input value={form.applicationNo} onChange={e => set('applicationNo')(e.target.value)} placeholder="e.g. BLD-2026-00441" />
            </Field>
            <Field label="Project Name" required>
              <Input value={form.projectName} onChange={e => set('projectName')(e.target.value)} placeholder="Project name" />
            </Field>
            <Field label="Jurisdiction / Municipality">
              <Input value={form.jurisdiction} onChange={e => set('jurisdiction')(e.target.value)} placeholder="e.g. Miami-Dade County" />
            </Field>
            <Field label="Project Address" fullWidth>
              <Input value={form.projectAddress} onChange={e => set('projectAddress')(e.target.value)} placeholder="Full project address" />
            </Field>
            <Field label="City">
              <Input value={form.city} onChange={e => set('city')(e.target.value)} placeholder="City" />
            </Field>
            <Field label="State">
              <SelectField placeholder="Select state" options={US_STATES} value={form.state} onChange={set('state')} />
            </Field>
            <Field label="Zip Code" required>
              <Input value={form.zip} onChange={e => set('zip')(e.target.value)} placeholder="33101" />
            </Field>
            <Field label="Assigned Plan Examiner">
              <Input value={form.examiner} onChange={e => set('examiner')(e.target.value)} placeholder="Examiner full name" />
            </Field>
            <Field label="Plan Examiner Phone">
              <Input type="tel" value={form.examinerPhone} onChange={e => set('examinerPhone')(e.target.value)} placeholder="(305) 555-0000" />
            </Field>
            <Field label="Submission Date" required>
              <Input type="date" value={form.submissionDate} onChange={e => set('submissionDate')(e.target.value)} />
            </Field>
            <Field label="Approval / Issuance Date">
              <Input type="date" value={form.approvalDate} onChange={e => set('approvalDate')(e.target.value)} />
            </Field>
            <Field label="Permit Expiry Date">
              <Input type="date" value={form.expiryDate} onChange={e => set('expiryDate')(e.target.value)} />
            </Field>
            <Field label="Permit Fee">
              <Input type="number" value={form.permitFee} onChange={e => set('permitFee')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Valuation" hint="Project value for fee calculation">
              <Input type="number" value={form.valuation} onChange={e => set('valuation')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Linked Zoning District" hint="e.g. R-1, C-2, T5-O — auto-suggested by zip">
              <Input value={form.zoningDistrict} onChange={e => set('zoningDistrict')(e.target.value)} placeholder="T6-8, R-1, C-2..." />
            </Field>
            <Field label="Status">
              <SelectField placeholder="Select status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} />
            </Field>
          </FieldGroup>

          {/* Upload Plans */}
          <Field label="Upload Plans / Application Documents" fullWidth>
            <div className="border-2 border-dashed border-orange-400/70 rounded-lg px-4 py-6 flex flex-col items-center gap-2 bg-orange-50/30 dark:bg-orange-950/10 cursor-pointer hover:bg-orange-50/50 transition-colors">
              <Upload className="w-6 h-6 text-orange-400" />
              <p className="text-xs text-muted-foreground text-center">
                Drag &amp; drop architectural plans, applications, or supporting documents, or{' '}
                <span className="text-orange-500 font-medium">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">PDF, DWG, PNG — max 50 MB</p>
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
              placeholder="Permit conditions, corrections required, inspector notes..."
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Submit Application</Button>
            <Button variant="outline" className="text-xs h-8">Track Status</Button>
            <Button variant="secondary" className="text-xs h-8">Schedule Inspection</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Permit Tracker ── */}
      <SectionCard title="Permit Tracker">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Permit Type</th>
                <th className="text-left py-2 pr-3 font-medium">Jurisdiction</th>
                <th className="text-left py-2 pr-3 font-medium">Submitted</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {PERMIT_TABLE.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 font-medium">{row.type}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.jurisdiction}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.submitted}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Permit Type Distribution ── */}
      <SectionCard title="Permit Type Distribution">
        <SimpleBarChart data={PERMIT_TYPE_CHART} colorClass="bg-orange-400" />
      </SectionCard>

      {/* ── Processing Time by Jurisdiction ── */}
      <SectionCard title="Processing Time by Jurisdiction">
        <SimpleBarChart data={JURISDICTION_CHART} colorClass="bg-blue-400" />
      </SectionCard>

      {/* ── Zoning Lookup ── */}
      <SectionCard title="Zoning Lookup">
        <div className="space-y-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Enter any US zip code to see zoning district, permitted uses, and density allowances (powered by open municipal data).
          </p>
          <div className="flex gap-2">
            <Input
              value={zoningZip}
              onChange={e => setZoningZip(e.target.value)}
              placeholder="Enter zip code, e.g. 33131"
              className="h-9 text-sm max-w-xs"
            />
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              Look Up Zoning
            </Button>
          </div>
          {zoningZip.length === 5 && (
            <div className="rounded-md bg-muted/30 border border-border/40 px-4 py-3 text-[12px]">
              <div className="font-semibold text-foreground mb-1">Zip {zoningZip} — Sample Result</div>
              <div className="text-muted-foreground space-y-1">
                <div><span className="font-medium text-foreground">Zoning District:</span> T6-8 (Urban Center)</div>
                <div><span className="font-medium text-foreground">Permitted Uses:</span> Mixed-use, Residential, Retail, Office by right</div>
                <div><span className="font-medium text-foreground">Max Density:</span> 150 units/acre</div>
                <div><span className="font-medium text-foreground">Max Height:</span> 8 stories (no bonus)</div>
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
