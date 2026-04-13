/**
 * ClientProjectPortal — /project/:id
 *
 * Client-facing project status page (shareable link, no login required).
 * Shows: project milestone timeline, photo uploads, documents, payment status,
 * weather at job site, and a message thread.
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2, Circle, Clock, FileText, Camera, MessageSquare,
  CloudSun, DollarSign, MapPin, Phone, Mail, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWeather } from '@/hooks/useWeather';

// ─── Demo project data ──────────────────────────────────────────────────────

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'upcoming';
  date: string;
}

interface PaymentLine {
  label: string;
  amount: number;
  due: string;
  paid: boolean;
}

interface Doc {
  name: string;
  type: 'contract' | 'permit' | 'insurance' | 'invoice';
  date: string;
}

interface ThreadMsg {
  id: string;
  author: string;
  role: 'contractor' | 'client';
  text: string;
  time: string;
}

const DEMO_PROJECT = {
  id: 'proj-001',
  name: 'Kitchen & Master Bath Remodel',
  address: '210 Maple Street, Austin, TX 78701',
  zip: '78701',
  contractor: 'Apex Construction Co.',
  phone: '(512) 555-0101',
  email: 'info@apexconstruction.com',
  startDate: '2024-03-01',
  estEndDate: '2024-05-15',
  totalContractValue: 78500,
  milestones: [
    { id: 'm1', title: 'Contract Signed', description: 'Project agreement executed by both parties.', status: 'completed' as const, date: '2024-02-28' },
    { id: 'm2', title: 'Demo & Site Prep', description: 'Demolition of existing kitchen and bath. Dumpster on-site.', status: 'completed' as const, date: '2024-03-08' },
    { id: 'm3', title: 'Rough Framing & Plumbing', description: 'New layout framed, rough plumbing relocated for new island.', status: 'completed' as const, date: '2024-03-22' },
    { id: 'm4', title: 'Electrical Rough-In', description: 'New panel circuits, recessed lighting rough-in.', status: 'active' as const, date: '2024-04-05' },
    { id: 'm5', title: 'Drywall & Tile', description: 'Drywall installation, tile in master bath.', status: 'upcoming' as const, date: '2024-04-19' },
    { id: 'm6', title: 'Cabinets & Countertops', description: 'Custom cabinets delivered and installed, stone counters.', status: 'upcoming' as const, date: '2024-05-01' },
    { id: 'm7', title: 'Final Finishes & Punch List', description: 'Paint, fixtures, trim, final walk-through.', status: 'upcoming' as const, date: '2024-05-12' },
    { id: 'm8', title: 'Project Complete', description: 'Final inspection passed, keys returned.', status: 'upcoming' as const, date: '2024-05-15' },
  ],
  payments: [
    { label: 'Deposit (10%)', amount: 7850, due: '2024-02-28', paid: true },
    { label: 'Milestone 1 — Demo (25%)', amount: 19625, due: '2024-03-10', paid: true },
    { label: 'Milestone 2 — Rough-In (30%)', amount: 23550, due: '2024-04-01', paid: false },
    { label: 'Milestone 3 — Finishes (25%)', amount: 19625, due: '2024-05-01', paid: false },
    { label: 'Final (10%)', amount: 7850, due: '2024-05-15', paid: false },
  ],
  docs: [
    { name: 'Signed Contract', type: 'contract' as const, date: '2024-02-28' },
    { name: 'Building Permit BP-2024-04210', type: 'permit' as const, date: '2024-03-05' },
    { name: 'Liability Insurance Certificate', type: 'insurance' as const, date: '2024-03-01' },
    { name: 'Invoice #1043 — Milestone 1', type: 'invoice' as const, date: '2024-03-10' },
  ],
  messages: [
    { id: 'msg1', author: 'Apex Construction', role: 'contractor' as const, text: 'Hi! Project kicked off today. Demo is complete and debris removed. Plumbing rough-in starts Monday.', time: 'Mar 8, 9:12 AM' },
    { id: 'msg2', author: 'You', role: 'client' as const, text: 'Thanks for the update! Will we be able to see the new island layout this week?', time: 'Mar 8, 11:45 AM' },
    { id: 'msg3', author: 'Apex Construction', role: 'contractor' as const, text: 'Absolutely — I\'ll send over updated framing photos by Wednesday once the new walls are up.', time: 'Mar 8, 12:10 PM' },
    { id: 'msg4', author: 'Apex Construction', role: 'contractor' as const, text: 'Electrical rough-in starts this week. Inspector scheduled for April 5th at 9 AM. Please ensure site access is available.', time: 'Apr 1, 8:30 AM' },
  ],
};

const DOC_COLORS: Record<Doc['type'], string> = {
  contract: 'bg-blue-600/80 text-white',
  permit: 'bg-purple-600/80 text-white',
  insurance: 'bg-teal-600/80 text-white',
  invoice: 'bg-amber-600/80 text-slate-900',
};

const MILESTONE_STATUS_ICON = {
  completed: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
  active: <div className="w-5 h-5 rounded-full border-2 border-amber-400 bg-amber-400/20 shrink-0 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /></div>,
  upcoming: <Circle className="w-5 h-5 text-slate-600 shrink-0" />,
};

export default function ClientProjectPortal() {
  const { id } = useParams<{ id: string }>();
  const project = DEMO_PROJECT; // In production: fetch by `id`

  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const [messages, setMessages] = useState<ThreadMsg[]>(project.messages);
  const [msgInput, setMsgInput] = useState('');

  const { weather, loading: weatherLoading } = useWeather(project.zip);

  const displayedMilestones = showAllMilestones ? project.milestones : project.milestones.slice(0, 5);
  const completedCount = project.milestones.filter(m => m.status === 'completed').length;
  const progressPct = Math.round((completedCount / project.milestones.length) * 100);

  const totalPaid = project.payments.filter(p => p.paid).reduce((s, p) => s + p.amount, 0);
  const totalDue = project.payments.filter(p => !p.paid).reduce((s, p) => s + p.amount, 0);

  function sendMessage() {
    const text = msgInput.trim();
    if (!text) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      author: 'You',
      role: 'client',
      text,
      time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    }]);
    setMsgInput('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07182f] via-[#081f38] to-[#07182f] text-slate-100">
      {/* Header */}
      <div className="bg-[#081f3b]/95 border-b border-amber-300/20 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs text-amber-300 font-medium mb-0.5 uppercase tracking-wide">Project Portal</div>
            <h1 className="text-xl font-bold text-slate-100">{project.name}</h1>
            <div className="flex items-center gap-1.5 text-sm text-slate-300 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {project.address}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">{project.contractor}</div>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
              <Phone className="w-3 h-3" />{project.phone}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Mail className="w-3 h-3" />{project.email}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Progress + Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="sm:col-span-2 border-amber-300/20 bg-[#0a2344]">
            <CardContent className="p-4">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Overall Progress</span>
                <span className="font-semibold text-amber-200">{progressPct}%</span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                <span>{completedCount} of {project.milestones.length} milestones complete</span>
                <span>{project.startDate} → {project.estEndDate}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-300/20 bg-[#0a2344]">
            <CardContent className="p-4 text-center">
              <div className="text-[10px] text-slate-400 mb-1">Contract Value</div>
              <div className="text-2xl font-bold text-amber-300">${project.totalContractValue.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-400 mt-1">Paid: ${totalPaid.toLocaleString()}</div>
              <div className="text-[10px] text-amber-300">Remaining: ${totalDue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Weather */}
        {(weather || weatherLoading) && (
          <Card className="border-sky-500/20 bg-[#0a2344]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-300 mb-2">
                <CloudSun className="w-4 h-4" />
                Job Site Weather — {project.zip}
              </div>
              {weatherLoading ? (
                <p className="text-xs text-slate-400">Loading weather…</p>
              ) : weather ? (
                <div className="flex gap-6 text-sm">
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{weather.current.tempF}°F</div>
                    <div className="text-xs text-slate-400">{weather.current.condition}</div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-0.5">
                    <div>Wind: {weather.current.windMph} mph {weather.current.windDir}</div>
                    <div>Humidity: {weather.current.humidity}%</div>
                    <div>Risk: <span className={`font-semibold ${weather.riskFlags.level === 'high' ? 'text-red-400' : weather.riskFlags.level === 'moderate' ? 'text-amber-300' : 'text-emerald-400'}`}>{weather.riskFlags.level.toUpperCase()}</span></div>
                  </div>
                  {weather.riskFlags.summary !== 'Conditions are suitable for all exterior work.' && (
                    <div className="text-[11px] text-amber-200 border border-amber-300/25 rounded px-2 py-1.5 bg-amber-900/20 flex-1">
                      ⚠ {weather.riskFlags.summary}
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Milestones */}
          <Card className="border-amber-300/20 bg-[#0a2344]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="relative pl-5 space-y-4">
                {displayedMilestones.map((m, i) => (
                  <div key={m.id} className="relative">
                    {i < displayedMilestones.length - 1 && (
                      <div className={`absolute left-[-14px] top-5 bottom-[-16px] w-px ${m.status === 'completed' ? 'bg-emerald-700' : 'bg-slate-700'}`} />
                    )}
                    <div className="absolute left-[-17px] top-0.5">
                      {MILESTONE_STATUS_ICON[m.status]}
                    </div>
                    <div className={`${m.status === 'upcoming' ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${m.status === 'active' ? 'text-amber-200' : 'text-slate-100'}`}>
                          {m.title}
                        </span>
                        {m.status === 'active' && (
                          <Badge className="text-[9px] px-1.5 py-0 h-4 bg-amber-400 text-slate-900">In Progress</Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.description}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.date}</div>
                    </div>
                  </div>
                ))}
              </div>
              {project.milestones.length > 5 && (
                <button
                  onClick={() => setShowAllMilestones(v => !v)}
                  className="mt-4 text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1"
                >
                  {showAllMilestones ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {project.milestones.length} milestones</>}
                </button>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {/* Payment Schedule */}
            <Card className="border-amber-300/20 bg-[#0a2344]">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Payment Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {project.payments.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/40 last:border-0">
                      <div>
                        <div className="text-slate-200">{p.label}</div>
                        <div className="text-[10px] text-slate-500">Due: {p.due}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-100">${p.amount.toLocaleString()}</div>
                        <div className={`text-[10px] font-medium ${p.paid ? 'text-emerald-400' : 'text-amber-300'}`}>
                          {p.paid ? '✓ Paid' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="border-amber-300/20 bg-[#0a2344]">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  Project Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {project.docs.map((d, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${DOC_COLORS[d.type]}`}>
                        {d.type.toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-200 truncate">{d.name}</div>
                        <div className="text-[10px] text-slate-500">{d.date}</div>
                      </div>
                      <button className="text-[10px] text-amber-300 hover:text-amber-200 shrink-0">View ↗</button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message Thread */}
        <Card className="border-amber-300/20 bg-[#0a2344]">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Project Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === 'client'
                      ? 'bg-amber-400 text-slate-900 rounded-tr-sm'
                      : 'bg-[#0d294f] text-slate-200 border border-amber-300/15 rounded-tl-sm'
                  }`}>
                    <div className="font-semibold mb-0.5">{m.author}</div>
                    <div>{m.text}</div>
                    <div className={`text-[9px] mt-1 ${m.role === 'client' ? 'text-slate-700' : 'text-slate-500'}`}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Send a message to your contractor…"
                className="flex-1 bg-[#0d294f] border-amber-300/25 text-slate-100 placeholder:text-slate-400 text-sm"
              />
              <Button
                onClick={sendMessage}
                disabled={!msgInput.trim()}
                className="bg-amber-400 text-slate-900 hover:bg-amber-300 gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Send
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-[11px] text-slate-500 text-center pb-4">
          Powered by <span className="text-amber-300 font-medium">Kluje</span> · This link was shared privately by {project.contractor}
        </p>
      </div>
    </div>
  );
}
