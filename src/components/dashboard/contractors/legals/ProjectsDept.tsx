import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FolderKanban, ExternalLink, CalendarDays, Sparkles, MapPin } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];

const KPIS: KpiItem[] = [
  { label: 'Active Projects',   value: '7',      sub: '3 residential, 4 commercial', trend: 'up'   },
  { label: 'Pipeline Value',    value: '$2.38M', sub: '↑ $340k this month',          trend: 'up'   },
  { label: 'On-Budget Rate',    value: '71%',    sub: '↓ 3% from Q4',               trend: 'down' },
  { label: 'On-Time Rate',      value: '68%',    sub: 'Weather delays: 2 projects',  trend: 'down' },
];

const AI_TIPS: AiTip[] = [
  {
    text: 'Project Brickell Ave is 12% over budget at milestone 3. AI projects final overrun of $28k if current spend rate continues. Adjust subcontractor invoicing now.',
    action: 'Review Budget',
  },
  {
    text: 'Zip 90210 (Project Beverly Hills): Seismic zone 4. Confirm structural engineering sign-off before drywall start.',
    action: 'Check Reports',
  },
  {
    text: 'Project Maple Ave: Property at 8220 Maple Ave (Zillow est. $485k, last sold $310k in 2020) may qualify as fix-and-flip opportunity. Suggest to client or self-invest?',
    action: 'Run ROI Calc',
  },
  {
    text: 'Project Oak St has 3 subcontractors with expired insurance certificates. Work-stoppage risk.',
    action: 'Send Requests',
  },
];

const WEATHER_WARNING =
  'Tropical storm watch active for ZIP 33101 (Project Coral Gables). 72-hr delay risk. Review milestone dates and notify client of potential extension per contract clause 14.2.';

// Kanban board data
const KANBAN_COLUMNS = [
  {
    label: 'In Progress',
    color: 'blue' as const,
    projects: [
      { name: 'Project Brickell Ave', type: 'Commercial Office', value: '$480k', pct: 62 },
      { name: 'Project Oak St',       type: 'Single Family',     value: '$215k', pct: 38 },
      { name: 'Project Coral Gables', type: 'Multi-Family',      value: '$730k', pct: 51 },
    ],
  },
  {
    label: 'On Hold',
    color: 'amber' as const,
    projects: [
      { name: 'Project Beverly Hills', type: 'Commercial Retail', value: '$320k', pct: 28 },
      { name: 'Project Harbor Lofts',  type: 'Condo / Townhouse', value: '$195k', pct: 15 },
    ],
  },
  {
    label: 'Completed',
    color: 'green' as const,
    projects: [
      { name: 'Project Maple Ave',  type: 'Single Family', value: '$145k', pct: 100 },
      { name: 'Project NW 5th St',  type: 'Light Rehab',   value: '$68k',  pct: 100 },
    ],
  },
];

const BUDGET_CHART = [
  { label: 'Brickell Ave — Budget',  value: '$480k', pct: 100 },
  { label: 'Brickell Ave — Actual',  value: '$538k', pct: 112 },
  { label: 'Oak St — Budget',        value: '$215k', pct: 100 },
  { label: 'Oak St — Actual',        value: '$208k', pct: 97  },
  { label: 'Coral Gables — Budget',  value: '$730k', pct: 100 },
  { label: 'Coral Gables — Actual',  value: '$744k', pct: 102 },
];

const MILESTONES = [
  { date: 'Mar 27', project: 'Project Oak St',       milestone: 'Framing inspection', days: 2  },
  { date: 'Apr 1',  project: 'Project Brickell Ave', milestone: 'Electrical rough-in complete', days: 7 },
  { date: 'Apr 3',  project: 'Project Coral Gables', milestone: 'Foundation pour', days: 9      },
  { date: 'Apr 8',  project: 'Project Harbor Lofts', milestone: 'Permit approval expected', days: 14 },
];

const CROSS_LINKS = ['Quotes', 'Realtors', 'Insurance', 'Title Companies', 'Agreements', 'Finance'];

interface ProjectForm {
  projectName: string; clientName: string; clientPhone: string; clientEmail: string;
  propertyAddress: string; city: string; state: string; zipCode: string;
  propertyType: string; projectScope: string; contractValue: string;
  estimatedMaterials: string; estimatedLabor: string; startDate: string;
  targetCompletion: string; leadSource: string; weatherRiskZone: string;
  status: string; notes: string;
}

export default function ProjectsDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<ProjectForm>({
    projectName: '', clientName: '', clientPhone: '', clientEmail: '',
    propertyAddress: '', city: '', state: '', zipCode: '',
    propertyType: '', projectScope: '', contractValue: '',
    estimatedMaterials: '', estimatedLabor: '', startDate: '',
    targetCompletion: '', leadSource: '', weatherRiskZone: '',
    status: '', notes: '',
  });

  const set = (k: keyof ProjectForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  // Compute a mock ROI display based on contractValue entry
  const contractNum = parseFloat(form.contractValue) || 0;
  const mockArv = contractNum > 0 ? Math.round(contractNum * 1.42) : null;
  const mockRoi = contractNum > 0 ? Math.round(((contractNum * 0.42) / (contractNum * 0.65)) * 100) : null;

  return (
    <DeptShell
      title="Projects Department"
      icon={FolderKanban}
      kpis={KPIS}
      aiTips={AI_TIPS}
      weatherWarning={WEATHER_WARNING}
      onBack={onBack}
    >
      {/* ── New Project Form ── */}
      <SectionCard title="New Project">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Project Name" required>
              <Input value={form.projectName} onChange={e => set('projectName')(e.target.value)} placeholder="e.g. Project Brickell Ave" />
            </Field>
            <Field label="Client Name" required>
              <Input value={form.clientName} onChange={e => set('clientName')(e.target.value)} placeholder="Full name or company" />
            </Field>
            <Field label="Client Phone">
              <Input type="tel" value={form.clientPhone} onChange={e => set('clientPhone')(e.target.value)} placeholder="(305) 555-0000" />
            </Field>
            <Field label="Client Email">
              <Input type="email" value={form.clientEmail} onChange={e => set('clientEmail')(e.target.value)} placeholder="client@email.com" />
            </Field>
            <Field label="Property Address" required fullWidth>
              <Input value={form.propertyAddress} onChange={e => set('propertyAddress')(e.target.value)} placeholder="Full street address" />
            </Field>
            <Field label="City">
              <Input value={form.city} onChange={e => set('city')(e.target.value)} placeholder="City" />
            </Field>
            <Field label="State">
              <SelectField
                placeholder="Select state"
                options={US_STATES}
                value={form.state}
                onChange={set('state')}
              />
            </Field>
            <Field label="Zip Code">
              <Input value={form.zipCode} onChange={e => set('zipCode')(e.target.value)} placeholder="e.g. 33101" />
            </Field>
            <Field label="Property Type">
              <SelectField
                placeholder="Select property type"
                options={[
                  'Single Family Residential','Multi-Family','Condo / Townhouse',
                  'Commercial Retail','Commercial Office','Industrial / Warehouse',
                  'Mixed-Use','Land / Lot',
                ]}
                value={form.propertyType}
                onChange={set('propertyType')}
              />
            </Field>
            <Field label="Project Scope">
              <SelectField
                placeholder="Select scope"
                options={[
                  'New Construction','Light Rehab (<$50k)','Medium Rehab ($50k–$200k)',
                  'Heavy Rehab (>$200k)','Addition / Expansion','Repair / Maintenance',
                ]}
                value={form.projectScope}
                onChange={set('projectScope')}
              />
            </Field>
            <Field label="Contract Value" required>
              <Input type="number" value={form.contractValue} onChange={e => set('contractValue')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Estimated Materials Cost">
              <Input type="number" value={form.estimatedMaterials} onChange={e => set('estimatedMaterials')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Estimated Labor Cost">
              <Input type="number" value={form.estimatedLabor} onChange={e => set('estimatedLabor')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Start Date" required>
              <Input type="date" value={form.startDate} onChange={e => set('startDate')(e.target.value)} />
            </Field>
            <Field label="Target Completion Date" required>
              <Input type="date" value={form.targetCompletion} onChange={e => set('targetCompletion')(e.target.value)} />
            </Field>
            <Field label="Lead Source">
              <SelectField
                placeholder="Select lead source"
                options={[
                  'Kluje Platform','Referral','Angi / HomeAdvisor',
                  'Direct Client','Realtor Partner','Repeat Client','Other',
                ]}
                value={form.leadSource}
                onChange={set('leadSource')}
              />
            </Field>
            <Field label="Weather Risk Zone" hint="Auto-suggested based on zip code entered above">
              <Input
                value={form.weatherRiskZone}
                onChange={e => set('weatherRiskZone')(e.target.value)}
                placeholder="e.g. Hurricane Zone D, Seismic Zone 2B"
              />
            </Field>
          </FieldGroup>

          {/* AI ROI Estimate Box */}
          <div className="flex items-start gap-3 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/40 rounded-lg px-4 py-3">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 mb-1">AI ROI Estimate</p>
              {mockArv ? (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Based on zip data, estimated ARV:{' '}
                  <span className="font-semibold text-foreground">${mockArv.toLocaleString()}</span>
                  {' '}· Potential return if bought &amp; renovated:{' '}
                  <span className="font-semibold text-emerald-600">{mockRoi}%</span>
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">Enter contract value above to see AI ROI projection for this property.</p>
              )}
            </div>
          </div>

          <FieldGroup>
            <Field label="Status">
              <SelectField
                placeholder="Select status"
                options={['Estimating','Signed','In Progress','On Hold','Completed','Cancelled']}
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
              placeholder="Project overview, special conditions, client requirements..."
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Create Project</Button>
            <Button variant="outline" className="text-xs h-8">Generate Quote</Button>
            <Button variant="secondary" className="text-xs h-8">Save Draft</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Projects Board (Kanban) ── */}
      <SectionCard title="Projects Board">
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-[640px] pb-1">
            {KANBAN_COLUMNS.map(col => (
              <div key={col.label} className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`w-2 h-2 rounded-full ${
                    col.color === 'blue' ? 'bg-blue-500' :
                    col.color === 'amber' ? 'bg-amber-400' : 'bg-emerald-500'
                  }`} />
                  <span className="text-[11px] font-semibold text-foreground">{col.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">{col.projects.length}</span>
                </div>
                <div className="space-y-2">
                  {col.projects.map(p => (
                    <div
                      key={p.name}
                      className="rounded-md border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors p-2.5 cursor-pointer"
                    >
                      <p className="text-[12px] font-medium text-foreground leading-tight">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{p.type}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] font-semibold text-foreground">{p.value}</span>
                        <span className="text-[10px] text-muted-foreground">{p.pct}%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            col.color === 'blue' ? 'bg-blue-400' :
                            col.color === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Budget vs Actual ── */}
      <SectionCard title="Budget vs Actual — Top 3 Active Projects">
        <SimpleBarChart data={BUDGET_CHART} colorClass="bg-orange-400" />
        <p className="text-[11px] text-muted-foreground mt-3">
          Bars exceeding 100% indicate cost overrun. Brickell Ave currently at 112% of budget.
        </p>
      </SectionCard>

      {/* ── Milestone Calendar ── */}
      <SectionCard title="Upcoming Milestones — Next 14 Days">
        <div className="space-y-2">
          {MILESTONES.map((m, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
              <div className="flex flex-col items-center justify-center bg-orange-500/10 rounded-md w-10 h-10 shrink-0">
                <CalendarDays className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[9px] text-orange-600 font-semibold mt-0.5">{m.date}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground leading-tight">{m.milestone}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{m.project}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 mt-1">in {m.days}d</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Investment Property Intelligence ── */}
      <div className="flex items-start gap-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-lg px-4 py-3">
        <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 mb-1">
            AI Property Intelligence
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Tap any project address to see Zestimate-equivalent, neighborhood comps, and fix-and-flip ROI projection.
            Kluje cross-references MLS data, permit history, and local market trends to surface investment opportunities.
          </p>
        </div>
      </div>

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
