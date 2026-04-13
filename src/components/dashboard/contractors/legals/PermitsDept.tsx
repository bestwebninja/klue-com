/**
 * PermitsDept — Legals > Permits
 *
 * Tracks building permits, inspections, and compliance deadlines.
 * Status pipeline: Applied → Under Review → Approved → Active → Final Inspection → Closed
 */

import { useState } from 'react';
import {
  DeptShell, KpiItem, SectionCard, StatusBadge,
} from '@/components/dashboard/contractors/DeptShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileCheck, Plus, ChevronRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

type PermitStatus = 'Applied' | 'Under Review' | 'Approved' | 'Active' | 'Final Inspection' | 'Closed' | 'Rejected';

interface Permit {
  id: string;
  number: string;
  type: string;
  address: string;
  status: PermitStatus;
  appliedDate: string;
  expiresDate: string;
  inspector: string;
  nextInspection: string;
  notes: string;
}

const STATUS_COLOR: Record<PermitStatus, 'green' | 'amber' | 'red' | 'blue' | 'gray'> = {
  Applied: 'blue',
  'Under Review': 'amber',
  Approved: 'green',
  Active: 'green',
  'Final Inspection': 'amber',
  Closed: 'gray',
  Rejected: 'red',
};

const STATUS_PIPELINE: PermitStatus[] = [
  'Applied', 'Under Review', 'Approved', 'Active', 'Final Inspection', 'Closed',
];

const DEMO_PERMITS: Permit[] = [
  {
    id: '1',
    number: 'BP-2024-04210',
    type: 'Building — New Construction',
    address: '210 Maple Street',
    status: 'Active',
    appliedDate: '2024-01-15',
    expiresDate: '2025-01-15',
    inspector: 'Tom Bradley',
    nextInspection: 'Rough framing — 2024-04-18',
    notes: 'Foundation passed. Framing in progress.',
  },
  {
    id: '2',
    number: 'EP-2024-00871',
    type: 'Electrical — Panel Upgrade',
    address: '45 Oak Road',
    status: 'Approved',
    appliedDate: '2024-03-02',
    expiresDate: '2024-09-02',
    inspector: 'Sarah Chen',
    nextInspection: 'Rough electrical — 2024-04-22',
    notes: 'Permit approved. Work can begin.',
  },
  {
    id: '3',
    number: 'PP-2024-00330',
    type: 'Plumbing — New Rough',
    address: '12 Pine Drive',
    status: 'Under Review',
    appliedDate: '2024-04-01',
    expiresDate: '—',
    inspector: 'TBD',
    nextInspection: '—',
    notes: 'Awaiting review from city plumbing dept.',
  },
  {
    id: '4',
    number: 'RP-2023-09941',
    type: 'Roofing — Re-roof',
    address: '7 Cedar Lane',
    status: 'Final Inspection',
    appliedDate: '2023-11-10',
    expiresDate: '2024-05-10',
    inspector: 'Mark Lopez',
    nextInspection: 'Final — 2024-04-20',
    notes: 'Shingles done. Final inspection pending.',
  },
];

const kpis: KpiItem[] = [
  { label: 'Active permits', value: '2', sub: 'Across all sites', trend: 'neutral' },
  { label: 'Inspections this week', value: '2', sub: 'Framing + Electrical', trend: 'neutral' },
  { label: 'Expiring within 90 days', value: '1', sub: 'Cedar Ln roofing', trend: 'down' },
  { label: 'Under review', value: '1', sub: 'Avg 10–15 days', trend: 'neutral' },
];

export default function PermitsDept({ onBack }: { onBack: () => void }) {
  const [permits, setPermits] = useState<Permit[]>(DEMO_PERMITS);
  const [selected, setSelected] = useState<Permit | null>(DEMO_PERMITS[0]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Permit>>({ status: 'Applied' });

  function addPermit() {
    if (!form.number?.trim() || !form.address?.trim()) return;
    const p: Permit = {
      id: Date.now().toString(),
      number: form.number!,
      type: form.type || 'Building',
      address: form.address!,
      status: form.status as PermitStatus ?? 'Applied',
      appliedDate: form.appliedDate || new Date().toISOString().slice(0, 10),
      expiresDate: form.expiresDate || '—',
      inspector: form.inspector || 'TBD',
      nextInspection: form.nextInspection || '—',
      notes: form.notes || '',
    };
    setPermits(prev => [p, ...prev]);
    setSelected(p);
    setShowAdd(false);
    setForm({ status: 'Applied' });
  }

  function advanceStatus(permit: Permit) {
    const idx = STATUS_PIPELINE.indexOf(permit.status);
    if (idx < 0 || idx >= STATUS_PIPELINE.length - 1) return;
    const next = STATUS_PIPELINE[idx + 1];
    setPermits(prev => prev.map(p => p.id === permit.id ? { ...p, status: next } : p));
    setSelected(prev => prev?.id === permit.id ? { ...prev, status: next } : prev);
  }

  const upcoming = permits.filter(p => p.nextInspection !== '—' && p.status !== 'Closed');

  return (
    <DeptShell
      title="Permit & Inspection Tracker"
      icon={FileCheck}
      kpis={kpis}
      aiTips={[
        { text: 'Cedar Lane roofing permit expires in < 90 days. Schedule final inspection now to avoid lapse.', action: 'Schedule' },
        { text: 'Pine Drive plumbing review is at day 12. City avg is 10–15 days — follow up tomorrow if no response.', action: 'Follow up' },
      ]}
      onBack={onBack}
    >
      {/* Permit List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* List */}
        <SectionCard
          title="All Permits"
          action={{ label: '+ New', onClick: () => setShowAdd(true) }}
        >
          <div className="space-y-2">
            {permits.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  selected?.id === p.id
                    ? 'border-amber-300/50 bg-amber-300/10'
                    : 'border-slate-700/40 bg-[#0a1e3c] hover:border-amber-300/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-100 font-mono">{p.number}</span>
                  <StatusBadge status={p.status} color={STATUS_COLOR[p.status]} />
                </div>
                <div className="text-[11px] text-slate-300 mb-0.5">{p.type}</div>
                <div className="text-[11px] text-slate-400">{p.address}</div>
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-3 gap-1.5 border-amber-300/30 text-amber-200"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Add Permit
          </Button>
        </SectionCard>

        {/* Detail */}
        <div className="space-y-3">
          {selected ? (
            <SectionCard title="Permit Detail">
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] text-slate-400 mb-0.5">Permit Number</div>
                  <div className="text-sm font-mono font-semibold text-amber-200">{selected.number}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 mb-0.5">Type</div>
                    <div className="text-slate-100">{selected.type}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-0.5">Address</div>
                    <div className="text-slate-100">{selected.address}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-0.5">Applied</div>
                    <div className="text-slate-100">{selected.appliedDate}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-0.5">Expires</div>
                    <div className={selected.expiresDate !== '—' ? 'text-amber-300' : 'text-slate-100'}>{selected.expiresDate}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-0.5">Inspector</div>
                    <div className="text-slate-100">{selected.inspector}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-0.5">Next Inspection</div>
                    <div className="text-slate-100">{selected.nextInspection}</div>
                  </div>
                </div>
                {selected.notes && (
                  <div className="rounded bg-[#0d294f] border border-slate-700/40 px-3 py-2 text-[11px] text-slate-300">
                    {selected.notes}
                  </div>
                )}

                {/* Pipeline progress */}
                <div>
                  <div className="text-[10px] text-slate-400 mb-2">Status Pipeline</div>
                  <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
                    {STATUS_PIPELINE.map((s, i) => (
                      <div key={s} className="flex items-center">
                        <div className={`text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap font-medium ${
                          s === selected.status
                            ? 'bg-amber-400 text-slate-900'
                            : STATUS_PIPELINE.indexOf(selected.status) > i
                            ? 'bg-emerald-700/50 text-emerald-300'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}>
                          {s}
                        </div>
                        {i < STATUS_PIPELINE.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selected.status !== 'Closed' && selected.status !== 'Rejected' && (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-amber-400 text-slate-900 hover:bg-amber-300"
                    onClick={() => advanceStatus(selected)}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    Advance to: {STATUS_PIPELINE[STATUS_PIPELINE.indexOf(selected.status) + 1] ?? 'Final'}
                  </Button>
                )}
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Permit Detail">
              <p className="text-sm text-slate-400 text-center py-6">Select a permit to view details.</p>
            </SectionCard>
          )}
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <SectionCard title="Add New Permit">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Permit Number *</label>
              <Input
                placeholder="BP-2024-XXXXX"
                value={form.number ?? ''}
                onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Type</label>
              <Input
                placeholder="Building, Electrical, Plumbing…"
                value={form.type ?? ''}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Address *</label>
              <Input
                placeholder="Job site address"
                value={form.address ?? ''}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as PermitStatus }))}
                className="w-full h-8 text-xs border border-amber-300/20 bg-[#0d294f] rounded-md px-2 text-slate-100"
              >
                {STATUS_PIPELINE.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Applied Date</label>
              <Input
                type="date"
                value={form.appliedDate ?? ''}
                onChange={e => setForm(f => ({ ...f, appliedDate: e.target.value }))}
                className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Expires Date</label>
              <Input
                type="date"
                value={form.expiresDate ?? ''}
                onChange={e => setForm(f => ({ ...f, expiresDate: e.target.value }))}
                className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Inspector</label>
              <Input
                placeholder="Inspector name"
                value={form.inspector ?? ''}
                onChange={e => setForm(f => ({ ...f, inspector: e.target.value }))}
                className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Next Inspection</label>
              <Input
                placeholder="e.g. Rough framing — 2024-04-18"
                value={form.nextInspection ?? ''}
                onChange={e => setForm(f => ({ ...f, nextInspection: e.target.value }))}
                className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-amber-400 text-slate-900 hover:bg-amber-300" onClick={addPermit}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </SectionCard>
      )}

      {/* Upcoming inspections */}
      <SectionCard title="Upcoming Inspections">
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No upcoming inspections.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded border border-slate-700/40 px-3 py-2 bg-[#0a1e3c]">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  p.status === 'Final Inspection' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-100">{p.nextInspection}</div>
                  <div className="text-[10px] text-slate-400">{p.address} · {p.number}</div>
                </div>
                <StatusBadge status={p.status} color={STATUS_COLOR[p.status]} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </DeptShell>
  );
}
