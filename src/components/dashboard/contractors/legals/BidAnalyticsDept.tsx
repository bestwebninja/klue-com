/**
 * BidAnalyticsDept — Finance › Bid Analytics
 * Win/loss tracking, close rate trends, revenue pipeline charts.
 * Uses Recharts (already installed).
 */
import { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

// ── Demo data (replace with Supabase query against quote_requests) ────────────
const MONTHLY = [
  { month: 'Oct', sent: 8, won: 3, lost: 5, revenue: 9200 },
  { month: 'Nov', sent: 11, won: 5, lost: 6, revenue: 14800 },
  { month: 'Dec', sent: 7, won: 2, lost: 5, revenue: 5400 },
  { month: 'Jan', sent: 14, won: 7, lost: 7, revenue: 22100 },
  { month: 'Feb', sent: 10, won: 6, lost: 4, revenue: 18300 },
  { month: 'Mar', sent: 16, won: 9, lost: 7, revenue: 27500 },
];

const BY_SERVICE = [
  { name: 'Commercial Clean', won: 18, lost: 9 },
  { name: 'Residential',       won: 14, lost: 5 },
  { name: 'Post-Construction', won: 6,  lost: 8 },
  { name: 'Medical Facility',  won: 4,  lost: 3 },
  { name: 'Landscaping',       won: 9,  lost: 4 },
];

const CLOSE_TREND = MONTHLY.map(m => ({
  month: m.month,
  rate: Math.round(m.won / m.sent * 100),
}));

const WIN_LOSS_PIE = [
  { name: 'Won', value: MONTHLY.reduce((s, m) => s + m.won, 0) },
  { name: 'Lost', value: MONTHLY.reduce((s, m) => s + m.lost, 0) },
];

const PIE_COLORS = ['#f59e0b', '#ef4444'];
const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-amber-300/30 bg-[#0d294f] p-2 text-xs text-slate-200 shadow-lg">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.name === 'revenue' ? fmt(p.value) : p.value}</p>
      ))}
    </div>
  );
};

export default function BidAnalyticsDept({ onBack }: { onBack: () => void }) {
  const [activeChart, setActiveChart] = useState<'bar'|'line'|'pie'>('bar');

  const totalSent = MONTHLY.reduce((s, m) => s + m.sent, 0);
  const totalWon  = MONTHLY.reduce((s, m) => s + m.won, 0);
  const totalRev  = MONTHLY.reduce((s, m) => s + m.revenue, 0);
  const closeRate = Math.round(totalWon / totalSent * 100);
  const avgDeal   = Math.round(totalRev / totalWon);

  const kpis = [
    { label: 'Close Rate',    value: `${closeRate}%`, icon: Target,     color: 'text-amber-300', trend: '+4% vs last quarter' },
    { label: 'Total Won',     value: String(totalWon), icon: Award,     color: 'text-emerald-300', trend: `${totalSent} quotes sent` },
    { label: 'Revenue Won',   value: fmt(totalRev),   icon: TrendingUp, color: 'text-sky-300', trend: 'Last 6 months' },
    { label: 'Avg Deal Size', value: fmt(avgDeal),    icon: TrendingDown, color: 'text-orange-300', trend: 'Per won quote' },
  ];

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-slate-100">Bid Analytics</h3>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="rounded-lg bg-[#0d294f] border border-amber-300/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={cn('h-3.5 w-3.5', color)} />
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</span>
            </div>
            <p className={cn('text-xl font-bold', color)}>{value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{trend}</p>
          </div>
        ))}
      </div>

      {/* Chart selector */}
      <div className="flex gap-2">
        {(['bar','line','pie'] as const).map(c => (
          <button key={c} onClick={() => setActiveChart(c)}
            className={cn('text-[11px] px-3 py-1 rounded-full border transition-all',
              activeChart === c
                ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                : 'border-slate-600 text-slate-400 hover:border-amber-400/50')}>
            {c === 'bar' ? 'Won / Lost' : c === 'line' ? 'Close Rate' : 'Win/Loss Split'}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="rounded-lg border border-amber-300/20 bg-[#0d294f] p-4">
        {activeChart === 'bar' && (
          <>
            <p className="text-[11px] text-slate-400 mb-3 font-medium">Monthly Won vs Lost</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="won"  fill="#f59e0b" radius={[3,3,0,0]} name="won" />
                <Bar dataKey="lost" fill="#ef4444" radius={[3,3,0,0]} name="lost" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
        {activeChart === 'line' && (
          <>
            <p className="text-[11px] text-slate-400 mb-3 font-medium">Close Rate % Trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={CLOSE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="rate" />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
        {activeChart === 'pie' && (
          <>
            <p className="text-[11px] text-slate-400 mb-3 font-medium">Overall Win / Loss Split</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={WIN_LOSS_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={4}>
                  {WIN_LOSS_PIE.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: '#cbd5e1', fontSize: 11 }}>{v}</span>} />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* By service type table */}
      <div className="rounded-lg border border-amber-300/20 bg-[#0d294f] overflow-hidden">
        <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wide px-4 py-2 border-b border-amber-300/15">By Service Type</p>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-amber-300/10">
            {['Service', 'Won', 'Lost', 'Rate'].map(h => (
              <th key={h} className="px-4 py-2 text-left text-[10px] uppercase text-slate-500">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {BY_SERVICE.map((row, i) => {
              const rate = Math.round(row.won / (row.won + row.lost) * 100);
              return (
                <tr key={row.name} className={cn('border-b border-amber-300/10', i % 2 && 'bg-[#07182f]/40')}>
                  <td className="px-4 py-2.5 text-slate-200">{row.name}</td>
                  <td className="px-4 py-2.5 text-emerald-300 font-semibold">{row.won}</td>
                  <td className="px-4 py-2.5 text-red-400">{row.lost}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${rate}%` }} />
                      </div>
                      <span className="text-amber-300 font-semibold w-8">{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
