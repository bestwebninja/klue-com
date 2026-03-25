import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Upload, ExternalLink } from 'lucide-react';

const KPIS: KpiItem[] = [
  { label: 'Sites Monitored',     value: '4',      sub: '2 with live camera feeds',  trend: 'neutral' },
  { label: 'Incidents MTD',       value: '2',      sub: '1 resolved, 1 open',        trend: 'down'    },
  { label: 'Access Events Today', value: '34',     sub: '31 cleared, 3 flagged',     trend: 'neutral' },
  { label: 'Avg Response Time',   value: '4.2 min',sub: '↓ from 7.1 min',            trend: 'up'      },
];

const AI_TIPS: AiTip[] = [
  {
    text: 'Zone C of Brickell Ave site had 3 after-hours access events this week (9 PM–5 AM). No scheduled crew. AI flags possible unauthorized entry.',
    action: 'Review Log',
  },
  {
    text: 'Security vendor contract for Oak St site expires in 21 days. AI found 2 competing vendors in zip 33101 with higher Google ratings at lower cost.',
    action: 'Compare Vendors',
  },
  {
    text: 'Weather: Tropical storm watch for zip 33101 this weekend. Secure all equipment and materials per site security protocol. Review site insurance coverage.',
    action: 'Review Insurance',
  },
];

const INCIDENT_LOG = [
  { site: 'Brickell Ave Site', type: 'After-Hours Access', date: '2026-03-22 09:14 PM', status: 'Open' as const,     color: 'amber' as const },
  { site: 'Oak St Site',       type: 'Perimeter Breach',   date: '2026-03-18 02:33 AM', status: 'Resolved' as const, color: 'green' as const },
  { site: 'Coral Way Site',    type: 'Equipment Theft',    date: '2026-03-10 11:48 PM', status: 'Resolved' as const, color: 'green' as const },
];

const COVERAGE_CHART = [
  { label: 'Brickell Ave Site', value: '100%', pct: 100 },
  { label: 'Oak St Site',       value: '87%',  pct: 87  },
  { label: 'Coral Way Site',    value: '72%',  pct: 72  },
  { label: 'NW 14th Site',      value: '55%',  pct: 55  },
];

const SECURITY_TYPES = [
  'Guard Service','CCTV / Camera System','Access Control (Card/FOB)',
  'Biometric Access','Motion Sensors','Perimeter Fencing',
  'Alarm System','Drone Surveillance','Combined',
];
const COVERAGE_HOURS = [
  '24/7','Business Hours Only','Nights Only','Weekends Only','Custom',
];
const EVENT_TYPES = [
  'Unauthorized Entry','Equipment Theft','Vandalism','After-Hours Access',
  'Perimeter Breach','Fire/Smoke','Medical Emergency','Near Miss','Routine Check',
];
const STATUS_OPTIONS = [
  'Open','Under Review','Resolved','Escalated to Police','Insurance Claim Filed',
];

const CROSS_LINKS = ['Health & Safety', 'Projects', 'Biometric Access', 'Insurance'];

// Access event timeline hours (24h bar)
const ACCESS_EVENTS = [
  { hour: 7,  label: '07:14', type: 'Cleared' },
  { hour: 8,  label: '08:02', type: 'Cleared' },
  { hour: 9,  label: '09:30', type: 'Cleared' },
  { hour: 12, label: '12:05', type: 'Cleared' },
  { hour: 14, label: '14:17', type: 'Flagged'  },
  { hour: 16, label: '16:44', type: 'Cleared' },
  { hour: 18, label: '18:55', type: 'Cleared' },
  { hour: 21, label: '21:09', type: 'Flagged'  },
  { hour: 23, label: '23:31', type: 'Flagged'  },
];

interface SecurityForm {
  siteName: string; siteAddress: string; zip: string; securityType: string;
  vendorName: string; vendorPhone: string; vendorEmail: string;
  coverageHours: string; monthlyCost: string; cameraCount: string;
  eventDate: string; eventTime: string; eventType: string;
  personnel: string; description: string; status: string;
}

export default function SecurityDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<SecurityForm>({
    siteName: '', siteAddress: '', zip: '', securityType: '',
    vendorName: '', vendorPhone: '', vendorEmail: '',
    coverageHours: '', monthlyCost: '', cameraCount: '',
    eventDate: '', eventTime: '', eventType: '',
    personnel: '', description: '', status: '',
  });

  const set = (k: keyof SecurityForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <DeptShell
      title="Site Security"
      icon={ShieldAlert}
      kpis={KPIS}
      aiTips={AI_TIPS}
      weatherWarning="Tropical storm watch active for zip 33101 this weekend. Secure all materials and verify perimeter fencing on exposed sites."
      onBack={onBack}
    >
      {/* ── Add Security Event / Setup ── */}
      <SectionCard title="Add Security Event / Setup">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Site / Project Name" required>
              <Input value={form.siteName} onChange={e => set('siteName')(e.target.value)} placeholder="Site name or project" />
            </Field>
            <Field label="Zip Code">
              <Input value={form.zip} onChange={e => set('zip')(e.target.value)} placeholder="33101" />
            </Field>
            <Field label="Site Address" fullWidth>
              <Input value={form.siteAddress} onChange={e => set('siteAddress')(e.target.value)} placeholder="Full site address" />
            </Field>
            <Field label="Security Type">
              <SelectField placeholder="Select type" options={SECURITY_TYPES} value={form.securityType} onChange={set('securityType')} />
            </Field>
            <Field label="Vendor Name">
              <Input value={form.vendorName} onChange={e => set('vendorName')(e.target.value)} placeholder="Security vendor company" />
            </Field>
            <Field label="Vendor Phone">
              <Input type="tel" value={form.vendorPhone} onChange={e => set('vendorPhone')(e.target.value)} placeholder="(305) 555-0000" />
            </Field>
            <Field label="Vendor Email">
              <Input type="email" value={form.vendorEmail} onChange={e => set('vendorEmail')(e.target.value)} placeholder="vendor@security.com" />
            </Field>
            <Field label="Coverage Hours">
              <SelectField placeholder="Select coverage" options={COVERAGE_HOURS} value={form.coverageHours} onChange={set('coverageHours')} />
            </Field>
            <Field label="Monthly Cost">
              <Input type="number" value={form.monthlyCost} onChange={e => set('monthlyCost')(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Camera Count">
              <Input type="number" value={form.cameraCount} onChange={e => set('cameraCount')(e.target.value)} placeholder="0" />
            </Field>
          </FieldGroup>

          <div className="border-t border-border/40 pt-4">
            <div className="text-[12px] font-semibold text-foreground mb-3">Log Security Event</div>
            <FieldGroup>
              <Field label="Event Date">
                <Input type="date" value={form.eventDate} onChange={e => set('eventDate')(e.target.value)} />
              </Field>
              <Field label="Event Time">
                <Input type="time" value={form.eventTime} onChange={e => set('eventTime')(e.target.value)} />
              </Field>
              <Field label="Event Type">
                <SelectField placeholder="Select event type" options={EVENT_TYPES} value={form.eventType} onChange={set('eventType')} />
              </Field>
              <Field label="Personnel Involved">
                <Input value={form.personnel} onChange={e => set('personnel')(e.target.value)} placeholder="Names or badge IDs" />
              </Field>
              <Field label="Status">
                <SelectField placeholder="Select status" options={STATUS_OPTIONS} value={form.status} onChange={set('status')} />
              </Field>
            </FieldGroup>
            <Field label="Description" fullWidth>
              <textarea
                value={form.description}
                onChange={e => set('description')(e.target.value)}
                rows={3}
                className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
                placeholder="Describe the incident or security setup details..."
              />
            </Field>
          </div>

          {/* Evidence Upload */}
          <Field label="Upload Evidence / Photos" fullWidth>
            <div className="border-2 border-dashed border-orange-400/70 rounded-lg px-4 py-6 flex flex-col items-center gap-2 bg-orange-50/30 dark:bg-orange-950/10 cursor-pointer hover:bg-orange-50/50 transition-colors">
              <Upload className="w-6 h-6 text-orange-400" />
              <p className="text-xs text-muted-foreground text-center">
                Drag &amp; drop photos or video clips, or <span className="text-orange-500 font-medium">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">JPG, PNG, MP4 — max 50 MB</p>
            </div>
            <div className="mt-2">
              <OcrBanner />
            </div>
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Log Event</Button>
            <Button variant="outline" className="text-xs h-8">Add Site Setup</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Incident Log ── */}
      <SectionCard title="Incident Log">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Site</th>
                <th className="text-left py-2 pr-3 font-medium">Incident Type</th>
                <th className="text-left py-2 pr-3 font-medium">Date / Time</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {INCIDENT_LOG.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 font-medium">{row.site}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.type}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.date}</td>
                  <td className="py-2"><StatusBadge status={row.status} color={row.color} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Access Event Timeline ── */}
      <SectionCard title="Access Event Timeline — Today">
        <div className="space-y-3">
          <div className="text-[11px] text-muted-foreground">24-hour access log across all monitored sites</div>
          <div className="relative h-8 bg-muted/40 rounded-full overflow-hidden border border-border/40">
            {ACCESS_EVENTS.map((ev, i) => (
              <div
                key={i}
                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background ${
                  ev.type === 'Flagged' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ left: `${(ev.hour / 24) * 100}%` }}
                title={`${ev.label} — ${ev.type}`}
              />
            ))}
            {/* Hour labels */}
            {[0, 6, 12, 18, 24].map(h => (
              <span
                key={h}
                className="absolute bottom-0 text-[9px] text-muted-foreground -translate-x-1/2"
                style={{ left: `${(h / 24) * 100}%` }}
              >
                {h === 24 ? '' : `${h.toString().padStart(2,'0')}:00`}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Cleared (31)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Flagged (3)</span>
          </div>
        </div>
      </SectionCard>

      {/* ── Site Coverage Status ── */}
      <SectionCard title="Site Coverage Status (% Hours Monitored)">
        <SimpleBarChart data={COVERAGE_CHART} colorClass="bg-orange-400" />
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
