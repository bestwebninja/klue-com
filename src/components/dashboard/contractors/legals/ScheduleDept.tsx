/**
 * ScheduleDept — Overview > Schedule
 *
 * Weekly calendar view for crews, jobs, and sub appointments.
 * Color-coded by job type. Add/edit job events inline.
 */

import { useState } from 'react';
import {
  DeptShell, KpiItem, SectionCard, StatusBadge,
} from '@/components/dashboard/contractors/DeptShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Users, Clock } from 'lucide-react';

interface JobEvent {
  id: string;
  title: string;
  crew: string;
  type: 'concrete' | 'framing' | 'electrical' | 'plumbing' | 'inspection' | 'other';
  day: number; // 0=Mon…6=Sun
  timeSlot: string;
  hours: number;
  address: string;
}

const TYPE_COLORS: Record<JobEvent['type'], string> = {
  concrete:   'bg-amber-600/80 text-white',
  framing:    'bg-sky-600/80 text-white',
  electrical: 'bg-yellow-500/80 text-slate-900',
  plumbing:   'bg-teal-600/80 text-white',
  inspection: 'bg-purple-600/80 text-white',
  other:      'bg-slate-600/80 text-white',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

const DEMO_EVENTS: JobEvent[] = [
  { id: '1', title: 'Foundation pour — Maple St', crew: 'Crew A (5)', type: 'concrete',   day: 0, timeSlot: '7 AM',  hours: 4, address: '210 Maple St' },
  { id: '2', title: 'Rough framing inspection',  crew: 'Inspector',  type: 'inspection', day: 1, timeSlot: '9 AM',  hours: 2, address: '88 Birch Ave' },
  { id: '3', title: 'Panel upgrade — Oak Rd',    crew: 'Crew C (3)', type: 'electrical', day: 2, timeSlot: '8 AM',  hours: 6, address: '45 Oak Rd'   },
  { id: '4', title: 'Rough plumbing — Pine Dr',  crew: 'Crew B (4)', type: 'plumbing',   day: 3, timeSlot: '7 AM',  hours: 5, address: '12 Pine Dr'  },
  { id: '5', title: 'Wall framing — Cedar Ln',   crew: 'Crew A (5)', type: 'framing',    day: 4, timeSlot: '7 AM',  hours: 8, address: '7 Cedar Ln'  },
  { id: '6', title: 'Concrete flatwork — Day 2', crew: 'Crew D (3)', type: 'concrete',   day: 5, timeSlot: '7 AM',  hours: 6, address: '210 Maple St' },
];

const kpis: KpiItem[] = [
  { label: 'Jobs this week', value: String(DEMO_EVENTS.length), sub: 'Across all crews', trend: 'neutral' },
  { label: 'Crew hours booked', value: '31 h', sub: 'Mon–Sun', trend: 'up' },
  { label: 'Conflicts detected', value: '0', sub: 'No overlaps', trend: 'up' },
  { label: 'Inspections', value: '1', sub: 'Scheduled', trend: 'neutral' },
];

export default function ScheduleDept({ onBack }: { onBack: () => void }) {
  const [events, setEvents] = useState<JobEvent[]>(DEMO_EVENTS);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<JobEvent | null>(null);
  const [form, setForm] = useState<Partial<JobEvent>>({
    type: 'other', day: 0, timeSlot: '8 AM', hours: 4,
  });

  // Week label
  const now = new Date();
  now.setDate(now.getDate() + weekOffset * 7);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekLabel = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  function addEvent() {
    if (!form.title?.trim()) return;
    const e: JobEvent = {
      id: Date.now().toString(),
      title: form.title!,
      crew: form.crew || 'Unassigned',
      type: form.type as JobEvent['type'],
      day: form.day ?? 0,
      timeSlot: form.timeSlot ?? '8 AM',
      hours: form.hours ?? 4,
      address: form.address || '—',
    };
    setEvents(prev => [...prev, e]);
    setShowAdd(false);
    setForm({ type: 'other', day: 0, timeSlot: '8 AM', hours: 4 });
  }

  function removeEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  return (
    <DeptShell
      title="Schedule — Weekly Crew Calendar"
      icon={Calendar}
      kpis={kpis}
      aiTips={[
        { text: 'Crew A has no gap between Maple St concrete (Mon 7 AM) and Cedar Ln framing (Fri 7 AM). Consider a buffer day for equipment transfers.', action: 'Adjust' },
        { text: 'Rain expected Wednesday — consider rescheduling the electrical panel upgrade if it involves outdoor work.', action: 'Check weather' },
      ]}
      onBack={onBack}
    >
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setWeekOffset(w => w - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-slate-100 min-w-[120px] text-center">
            Week of {weekLabel}
          </span>
          <Button size="sm" variant="outline" onClick={() => setWeekOffset(w => w + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setWeekOffset(0)} className="text-xs">
            Today
          </Button>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-amber-400 text-slate-900 hover:bg-amber-300"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-3.5 h-3.5" /> Add Job
        </Button>
      </div>

      {/* Add Job Form */}
      {showAdd && (
        <SectionCard title="Add Job Event">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-300 mb-1 block">Job Title *</label>
              <Input
                placeholder="e.g. Foundation pour — 45 Oak Rd"
                value={form.title ?? ''}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="bg-[#0d294f] border-amber-300/30 text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 mb-1 block">Crew</label>
              <Input
                placeholder="e.g. Crew A (5)"
                value={form.crew ?? ''}
                onChange={e => setForm(f => ({ ...f, crew: e.target.value }))}
                className="bg-[#0d294f] border-amber-300/30 text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 mb-1 block">Address</label>
              <Input
                placeholder="Job site address"
                value={form.address ?? ''}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="bg-[#0d294f] border-amber-300/30 text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 mb-1 block">Day</label>
              <select
                value={form.day}
                onChange={e => setForm(f => ({ ...f, day: Number(e.target.value) }))}
                className="w-full h-9 text-sm border border-amber-300/30 bg-[#0d294f] rounded-md px-3 text-slate-100"
              >
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-300 mb-1 block">Start Time</label>
              <select
                value={form.timeSlot}
                onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))}
                className="w-full h-9 text-sm border border-amber-300/30 bg-[#0d294f] rounded-md px-3 text-slate-100"
              >
                {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-300 mb-1 block">Hours</label>
              <Input
                type="number" min={1} max={12}
                value={form.hours ?? 4}
                onChange={e => setForm(f => ({ ...f, hours: Number(e.target.value) }))}
                className="bg-[#0d294f] border-amber-300/30 text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as JobEvent['type'] }))}
                className="w-full h-9 text-sm border border-amber-300/30 bg-[#0d294f] rounded-md px-3 text-slate-100"
              >
                {Object.keys(TYPE_COLORS).map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-amber-400 text-slate-900 hover:bg-amber-300" onClick={addEvent}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </SectionCard>
      )}

      {/* Calendar Grid */}
      <SectionCard title="Weekly View">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="w-14 text-left text-slate-400 pb-2 pr-2 font-medium">Time</th>
                {DAYS.map(d => (
                  <th key={d} className="text-center text-slate-300 pb-2 px-1 font-semibold min-w-[90px]">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map(slot => (
                <tr key={slot}>
                  <td className="text-slate-400 pr-2 py-1 text-right border-t border-slate-700/40 align-top pt-2">
                    {slot}
                  </td>
                  {DAYS.map((_, dayIdx) => {
                    const cellEvents = events.filter(e => e.day === dayIdx && e.timeSlot === slot);
                    return (
                      <td key={dayIdx} className="border-t border-slate-700/40 px-0.5 py-0.5 align-top min-h-[32px]">
                        {cellEvents.map(ev => (
                          <button
                            key={ev.id}
                            onClick={() => setSelected(ev)}
                            className={`w-full text-left rounded px-1.5 py-1 mb-0.5 text-[10px] leading-tight ${TYPE_COLORS[ev.type]} hover:opacity-90 transition-opacity`}
                          >
                            <div className="font-semibold truncate">{ev.title}</div>
                            <div className="opacity-80">{ev.crew} · {ev.hours}h</div>
                          </button>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Selected event detail */}
      {selected && (
        <SectionCard title="Job Detail">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="text-sm font-semibold text-slate-100">{selected.title}</div>
              <div className="flex gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{selected.crew}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selected.timeSlot} · {selected.hours}h</span>
              </div>
              <div className="text-xs text-slate-400">{selected.address}</div>
              <StatusBadge
                status={selected.type.charAt(0).toUpperCase() + selected.type.slice(1)}
                color={selected.type === 'inspection' ? 'blue' : selected.type === 'concrete' ? 'amber' : 'green'}
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={() => removeEvent(selected.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Crew list */}
      <SectionCard title="Crew Utilization">
        {(['Crew A (5)', 'Crew B (4)', 'Crew C (3)', 'Crew D (3)', 'Inspector'] as const).map(crew => {
          const crewJobs = events.filter(e => e.crew === crew);
          const hours = crewJobs.reduce((sum, e) => sum + e.hours, 0);
          const pct = Math.min(100, Math.round((hours / 40) * 100));
          return (
            <div key={crew} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{crew}</span>
                <span className="text-slate-400">{hours}h / 40h</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </SectionCard>
    </DeptShell>
  );
}
