import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Phone, Package, Lock, BookOpen, TrendingUp, TrendingDown,
  Mic, Mail, ClipboardList, Send, BarChart3, MapPin, Calendar,
  MessageSquare, Bot, Factory, Archive, DollarSign, Users,
  Clock, Receipt, Ruler, FileText
} from 'lucide-react';

const tabs = ["Today's Snapshot", 'Active Jobs (4)', 'Materials Queue', 'AI Activity'];

const kpis = [
  { label: 'On-site today', value: '14', sub: '↑ 2 from yesterday', trend: 'up' },
  { label: 'Open orders', value: '6', sub: '3 awaiting delivery', trend: 'neutral' },
  { label: 'Pending invoices', value: '$48.2k', sub: '↓ 2 overdue', trend: 'down' },
  { label: 'AI actions today', value: '31', sub: 'Calls, orders, quotes', trend: 'neutral' },
];

const calls = [
  { initials: 'HD', name: 'Home Depot Pro — order confirm', meta: 'AI handled · 9:14 AM · 2 min', status: 'Resolved', color: 'green' },
  { initials: 'MP', name: 'Mike Plumbing — reschedule req.', meta: 'AI escalated · 10:42 AM · 4 min', status: 'Review needed', color: 'amber' },
  { initials: 'UN', name: 'Unknown — new quote inquiry', meta: 'AI qualified · 11:05 AM · 6 min', status: 'Quote started', color: 'blue' },
];

const materials = [
  { name: 'Portland cement · 500 bags', sub: 'Home Depot Pro · Est. Thu', status: 'In transit', color: 'blue' },
  { name: 'Rebar #4 · 200 sticks', sub: 'Fastenal · Est. Fri', status: 'Delayed', color: 'amber' },
  { name: '2x6x16 lumber · 80 pcs', sub: '84 Lumber · Ordered today', status: 'Confirmed', color: 'green' },
];

const biometrics = [
  { name: 'Carlos Rivera — Electrical sub', sub: 'Zone B · Level 2 · since 7:42 AM', status: 'Cleared', ok: true },
  { name: 'Dana Frye — Framing crew', sub: 'Zone A · Ground · since 8:10 AM', status: 'Cleared', ok: true },
  { name: 'Ray Gomez — Masonry sub', sub: 'Zone C · Restricted · flagged 11:30', status: 'Review', ok: false },
];

const accounting = [
  { label: 'Revenue this month', value: '$182,400' },
  { label: 'Materials spent', value: '$64,100' },
  { label: 'Labor / sub costs', value: '$51,200' },
  { label: 'Net margin', value: '$67,100 (36.8%)', positive: true },
  { label: 'Outstanding A/R', value: '$48,200', negative: true },
];

const sidebarSections = [
  {
    label: 'Overview',
    items: [
      { icon: BarChart3, name: 'Dashboard', badge: null },
      { icon: MapPin, name: 'Site Map', badge: 'Live', badgeType: 'green' },
      { icon: Calendar, name: 'Schedule', badge: null },
    ],
  },
  {
    label: 'Communications',
    items: [
      { icon: Phone, name: 'Inbound Calls', badge: '3', badgeType: 'red' },
      { icon: Mail, name: 'Email Inbox', badge: '7', badgeType: 'default' },
      { icon: MessageSquare, name: 'Sub Messaging', badge: null },
      { icon: Bot, name: 'Agent Log', badge: null },
    ],
  },
  {
    label: 'Materials',
    items: [
      { icon: Package, name: 'Orders', badge: null },
      { icon: Factory, name: 'Suppliers', badge: null },
      { icon: Archive, name: 'Inventory', badge: null },
      { icon: DollarSign, name: 'Quote Builder', badge: null },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { icon: Users, name: 'Subcontractors', badge: null },
      { icon: Lock, name: 'Biometric Access', badge: 'New', badgeType: 'green' },
      { icon: MapPin, name: 'Site Tracking', badge: null },
      { icon: Clock, name: 'Timesheets', badge: null },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: BookOpen, name: 'Accounting', badge: null },
      { icon: Receipt, name: 'Invoices', badge: '2', badgeType: 'red' },
      { icon: Ruler, name: 'Job Costing', badge: null },
      { icon: FileText, name: 'Lien Waivers', badge: null },
    ],
  },
];

function StatusPill({ status, color }: { status: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${colorMap[color] || ''}`}>
      {status}
    </span>
  );
}

export default function GCCommandDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6 lg:-m-8">
      {/* Top Bar */}
      <div className="bg-card border-b border-border px-4 sm:px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-primary-foreground">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Contractors — kluje.com</div>
            <div className="text-[11px] text-muted-foreground">General Contractor AI Agent · kluje.com</div>
          </div>
        </div>
        <div className="hidden lg:block text-xs text-muted-foreground bg-muted border border-border rounded-md px-3 py-1.5">
          Try: "Order 500 bags of Portland cement" or "How many subs are on site today?"
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-[7px] h-[7px] rounded-full bg-emerald-500 inline-block" />
            Agent online
          </span>
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-card border-b border-border px-4 sm:px-5 py-2 flex items-center gap-2 shrink-0">
        <Input
          placeholder="Ask anything about your jobs, materials, subs, or finances…"
          className="flex-1 text-sm bg-muted"
        />
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="default" size="sm" className="gap-1.5 text-xs">
            <Mic className="w-3.5 h-3.5" /> Voice
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Mail className="w-3.5 h-3.5" /> Email
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ClipboardList className="w-3.5 h-3.5" /> Form
          </Button>
        </div>
        <Button size="sm" className="gap-1.5 text-xs">
          <Send className="w-3.5 h-3.5" /> Send
        </Button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-[195px] bg-card border-r border-border overflow-y-auto shrink-0 py-3">
          {sidebarSections.map((section) => (
            <div key={section.label} className="px-3 mb-1">
              <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase px-2 py-1.5">
                {section.label}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSidebar === item.name;
                return (
                  <div
                    key={item.name}
                    onClick={() => setActiveSidebar(item.name)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-[13px] ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </div>
                    {item.badge && (
                      <Badge
                        variant={item.badgeType === 'red' ? 'destructive' : item.badgeType === 'green' ? 'default' : 'secondary'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
          {/* Tabs */}
          <div className="flex gap-0 border-b border-border bg-card rounded-t-lg px-3 mb-4">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-3.5 py-2.5 text-[13px] border-b-2 -mb-px transition-colors ${
                  i === activeTab
                    ? 'text-foreground border-foreground font-medium'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="shadow-none">
                <CardContent className="p-3.5">
                  <div className="text-[11px] text-muted-foreground mb-1">{kpi.label}</div>
                  <div className="text-2xl font-semibold text-foreground">{kpi.value}</div>
                  <div className={`text-[11px] mt-1 flex items-center gap-1 ${
                    kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {kpi.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                    {kpi.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                    {kpi.sub}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Row 1: Calls + Materials */}
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <Card className="shadow-none">
              <CardHeader className="p-3.5 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[13px] font-medium flex items-center gap-1.5">
                    <Phone className="w-4 h-4" /> Recent inbound calls
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground cursor-pointer hover:text-primary">View all ↗</span>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                {calls.map((call) => (
                  <div key={call.name} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <div className="w-[26px] h-[26px] rounded bg-muted text-[10px] font-semibold flex items-center justify-center text-muted-foreground shrink-0">
                      {call.initials}
                    </div>
                    <div className="flex-1 ml-2">
                      <div className="text-xs font-medium text-foreground">{call.name}</div>
                      <div className="text-[11px] text-muted-foreground">{call.meta}</div>
                    </div>
                    <StatusPill status={call.status} color={call.color} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader className="p-3.5 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[13px] font-medium flex items-center gap-1.5">
                    <Package className="w-4 h-4" /> Material orders
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground cursor-pointer hover:text-primary">View all ↗</span>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                {materials.map((mat) => (
                  <div key={mat.name} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                    <div>
                      <div className="text-xs font-medium text-foreground">{mat.name}</div>
                      <div className="text-[11px] text-muted-foreground">{mat.sub}</div>
                    </div>
                    <StatusPill status={mat.status} color={mat.color} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Biometric + Accounting */}
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <Card className="shadow-none">
              <CardHeader className="p-3.5 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[13px] font-medium flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Biometric site access — live
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground cursor-pointer hover:text-primary">Movement log ↗</span>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                {biometrics.map((bio) => (
                  <div key={bio.name} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${bio.ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 ml-2">
                      <div className="text-xs font-medium text-foreground">{bio.name}</div>
                      <div className="text-[11px] text-muted-foreground">{bio.sub}</div>
                    </div>
                    <span className={`text-[11px] ${bio.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {bio.ok ? '✓' : '⚠'} {bio.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader className="p-3.5 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[13px] font-medium flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Accounting snapshot
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground cursor-pointer hover:text-primary">Full report ↗</span>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 pt-0">
                {accounting.map((row, i) => (
                  <div key={row.label} className={`flex justify-between py-1.5 text-xs ${i < accounting.length - 1 ? 'border-b border-border' : ''} ${i === accounting.length - 2 ? 'font-semibold' : ''}`}>
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={`font-medium ${row.positive ? 'text-emerald-600' : row.negative ? 'text-destructive' : 'text-foreground'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="bg-card border-t border-border px-4 py-2 text-[11px] text-muted-foreground shrink-0 whitespace-nowrap overflow-hidden">
        🤖 <span className="text-primary font-medium">Agent activity — last hour:</span>{' '}
        Auto-responded to Home Depot order confirmation call · Drafted quote #1047 from email inquiry · Flagged rebar delivery delay & sourced alternate supplier · Ray Gomez Zone C access alert sent to your phone ·{' '}
        <span className="cursor-pointer underline text-primary">See full log ↗</span>
      </div>
    </div>
  );
}
