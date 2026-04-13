/**
 * CRMPipelineDept — Overview › CRM Pipeline
 * Kanban-style deal pipeline: Lead → Quoted → Accepted → Active → Completed.
 * Click any card to move it forward or backward.
 */
import { useState } from 'react';
import { Plus, ChevronRight, ChevronLeft, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Stage = 'Lead' | 'Quoted' | 'Accepted' | 'Active' | 'Completed';

interface Deal {
  id: string;
  clientName: string;
  serviceType: string;
  value: number;
  stage: Stage;
  notes: string;
  createdAt: number;
}

const STAGES: Stage[] = ['Lead', 'Quoted', 'Accepted', 'Active', 'Completed'];

const STAGE_COLOR: Record<Stage, string> = {
  Lead:      'border-slate-500/40 bg-slate-500/10',
  Quoted:    'border-sky-500/40 bg-sky-500/10',
  Accepted:  'border-amber-400/40 bg-amber-400/10',
  Active:    'border-orange-500/40 bg-orange-500/10',
  Completed: 'border-emerald-500/40 bg-emerald-500/10',
};

const STAGE_BADGE: Record<Stage, string> = {
  Lead:      'bg-slate-700 text-slate-300',
  Quoted:    'bg-sky-900/50 text-sky-300',
  Accepted:  'bg-amber-900/40 text-amber-300',
  Active:    'bg-orange-900/40 text-orange-300',
  Completed: 'bg-emerald-900/40 text-emerald-300',
};

function genId() { return Math.random().toString(36).slice(2, 9); }
const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

const DEMO_DEALS: Deal[] = [
  { id: '1', clientName: 'Acme Corp', serviceType: 'Commercial Clean', value: 1200, stage: 'Lead', notes: '', createdAt: Date.now() - 86400000 * 5 },
  { id: '2', clientName: 'Tech Hub LLC', serviceType: 'Office Cleaning', value: 3400, stage: 'Quoted', notes: 'Awaiting decision', createdAt: Date.now() - 86400000 * 3 },
  { id: '3', clientName: 'Green Spaces', serviceType: 'Landscape Maint.', value: 800, stage: 'Accepted', notes: '', createdAt: Date.now() - 86400000 },
  { id: '4', clientName: 'Metro Medical', serviceType: 'Medical Facility', value: 5500, stage: 'Active', notes: '2x/week schedule', createdAt: Date.now() - 86400000 * 10 },
];

export default function CRMPipelineDept({ onBack }: { onBack: () => void }) {
  const [deals, setDeals] = useState<Deal[]>(DEMO_DEALS);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ clientName: '', serviceType: '', value: '', notes: '' });

  const setF = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const addDeal = () => {
    if (!form.clientName) return;
    setDeals(p => [...p, {
      id: genId(), clientName: form.clientName, serviceType: form.serviceType,
      value: parseFloat(form.value) || 0, notes: form.notes,
      stage: 'Lead', createdAt: Date.now(),
    }]);
    setForm({ clientName: '', serviceType: '', value: '', notes: '' });
    setAdding(false);
  };

  const advance = (id: string) => setDeals(p => p.map(d => {
    if (d.id !== id) return d;
    const idx = STAGES.indexOf(d.stage);
    return idx < STAGES.length - 1 ? { ...d, stage: STAGES[idx + 1] } : d;
  }));

  const retreat = (id: string) => setDeals(p => p.map(d => {
    if (d.id !== id) return d;
    const idx = STAGES.indexOf(d.stage);
    return idx > 0 ? { ...d, stage: STAGES[idx - 1] } : d;
  }));

  const remove = (id: string) => setDeals(p => p.filter(d => d.id !== id));

  const pipelineValue = deals.filter(d => d.stage !== 'Completed').reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'Completed').reduce((s, d) => s + d.value, 0);
  const closeRate = deals.length > 0
    ? Math.round(deals.filter(d => d.stage === 'Completed').length / deals.length * 100)
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-slate-100">CRM Pipeline</h3>
        <Button size="sm" onClick={() => setAdding(v => !v)}
          className="text-xs gap-1.5 bg-amber-400 text-[#1f3455] hover:bg-amber-300">
          <Plus className="h-3.5 w-3.5" /> Add Deal
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[['Pipeline', fmt(pipelineValue), 'text-amber-300'],
          ['Won', fmt(wonValue), 'text-emerald-300'],
          ['Close Rate', `${closeRate}%`, 'text-sky-300']].map(([l, v, c]) => (
          <div key={l} className="rounded-lg bg-[#0d294f] border border-amber-300/20 p-3 text-center">
            <p className={`text-lg font-bold ${c}`}>{v}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Add deal form */}
      {adding && (
        <div className="rounded-lg border border-amber-300/30 bg-[#0d294f] p-4 space-y-3">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide">New Deal</p>
          <div className="grid grid-cols-2 gap-3">
            {([['clientName','Client Name','Acme Corp'],['serviceType','Service Type','Commercial Clean'],
               ['value','Est. Value $','2500'],['notes','Notes','']] as const).map(([k, label, ph]) => (
              <div key={k} className="space-y-1.5">
                <Label className="text-[11px] text-slate-400">{label}</Label>
                <Input value={form[k]} onChange={e => setF(k, e.target.value)} placeholder={ph}
                  className="h-8 text-xs bg-[#07182f] border-amber-300/25 text-slate-100" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addDeal} className="text-xs bg-amber-400 text-[#1f3455] hover:bg-amber-300">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-xs text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', STAGE_BADGE[stage])}>
                  {stage.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400">{stageDeals.length} · {fmt(stageValue)}</span>
              </div>
              <div className="space-y-2 min-h-16">
                {stageDeals.map(deal => (
                  <div key={deal.id} className={cn('rounded-lg border p-3 space-y-1.5 text-xs', STAGE_COLOR[stage])}>
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-semibold text-slate-100 leading-tight">{deal.clientName}</p>
                      <button onClick={() => remove(deal.id)} className="text-slate-500 hover:text-red-400 flex-shrink-0">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-slate-400">{deal.serviceType}</p>
                    <p className="text-amber-300 font-semibold flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />{deal.value.toLocaleString()}
                    </p>
                    {deal.notes && <p className="text-slate-400 text-[10px]">{deal.notes}</p>}
                    <div className="flex gap-1 pt-1">
                      {stage !== 'Lead' && (
                        <button onClick={() => retreat(deal.id)}
                          className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-500/30 rounded px-1.5 py-0.5">
                          <ChevronLeft className="h-2.5 w-2.5" />
                        </button>
                      )}
                      {stage !== 'Completed' && (
                        <button onClick={() => advance(deal.id)}
                          className="flex items-center gap-0.5 text-[10px] text-amber-300 hover:text-amber-200 border border-amber-400/30 rounded px-1.5 py-0.5">
                          <ChevronRight className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="border border-dashed border-slate-600/40 rounded-lg h-12 flex items-center justify-center">
                    <span className="text-[10px] text-slate-600">Empty</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
