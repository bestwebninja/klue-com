import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, lazy, Suspense, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Phone, Package, Lock, BookOpen, TrendingUp, TrendingDown,
  Mic, Mail, ClipboardList, Send, BarChart3, MapPin, Calendar,
  MessageSquare, Bot, Factory, Archive, DollarSign, Users,
  Clock, Receipt, Ruler, FileText, Scale, Handshake, Compass,
  Wrench, FileCheck, PenLine, Flame, HeartPulse, Umbrella,
  FolderOpen, Quote, Building2, ShieldAlert, Landmark, Map, BadgeCheck,
  Loader2, BrainCircuit, House,
  GitBranch, Bell, Plug2, AlertTriangle, Activity, ShieldCheck,
  Settings, Zap, Play, Plus, Navigation,
} from 'lucide-react';
import { getTemplateByAudience } from '@/features/command-center/templates/dashboardTemplates';
import type { TradeKey } from '@/features/command-center/templates/types';

// ─── Lazy-load each department to keep initial bundle small ───
const AttorneysDept      = lazy(() => import('./legals/AttorneysDept'));
const ArbitrationDept    = lazy(() => import('./legals/ArbitrationDept'));
const ArchitectsDept     = lazy(() => import('./legals/ArchitectsDept'));
const EngineersDept      = lazy(() => import('./legals/EngineersDept'));
const AgreementsDept     = lazy(() => import('./legals/AgreementsDept'));
const ESignatureDept     = lazy(() => import('./legals/ESignatureDept'));
const FireDeptDept       = lazy(() => import('./legals/FireDeptDept'));
const HealthSafetyDept   = lazy(() => import('./legals/HealthSafetyDept'));
const InsuranceDept      = lazy(() => import('./legals/InsuranceDept'));
const ProjectsDept       = lazy(() => import('./legals/ProjectsDept'));
const QuotesDept         = lazy(() => import('./legals/QuotesDept'));
const RealtorsDept       = lazy(() => import('./legals/RealtorsDept'));
const SecurityDept       = lazy(() => import('./legals/SecurityDept'));
const TitleCompaniesDept = lazy(() => import('./legals/TitleCompaniesDept'));
const TownPlanningDept   = lazy(() => import('./legals/TownPlanningDept'));
const VerificationDept   = lazy(() => import('./legals/VerificationOrdersDept'));

// ─── Sidebar data ───────────────────────────────────────────────
const sidebarSections = [
  {
    label: 'Command Center',
    items: [
      { icon: GitBranch,   name: 'Pipeline',      badge: null },
      { icon: Activity,    name: 'Analytics',      badge: null },
      { icon: BrainCircuit,name: 'AI Agents',      badge: null },
      { icon: Bell,        name: 'Alerts',         badge: '1', badgeType: 'red' },
      { icon: ShieldCheck, name: 'Compliance',     badge: null },
      { icon: Plug2,       name: 'Integrations',   badge: null },
      { icon: Settings,    name: 'CC Settings',    badge: null },
    ],
  },
  {
    label: 'Overview',
    items: [
      { icon: BarChart3,    name: 'Dashboard',     badge: null },
      { icon: MapPin,       name: 'Site Map',       badge: 'Live', badgeType: 'green' },
      { icon: Calendar,     name: 'Schedule',       badge: null },
    ],
  },
  {
    label: 'Communications',
    items: [
      { icon: Phone,        name: 'Inbound Calls',  badge: '3',  badgeType: 'red' },
      { icon: Mail,         name: 'Email Inbox',    badge: '7',  badgeType: 'default' },
      { icon: MessageSquare,name: 'Sub Messaging',  badge: null },
      { icon: Bot,          name: 'Agent Log',      badge: null },
    ],
  },
  {
    label: 'Materials',
    items: [
      { icon: Package,      name: 'Orders',         badge: null },
      { icon: Factory,      name: 'Suppliers',      badge: null },
      { icon: Archive,      name: 'Inventory',      badge: null },
      { icon: DollarSign,   name: 'Quote Builder',  badge: null },
      { icon: ClipboardList, name: 'Design Checklist', badge: 'New', badgeType: 'green' },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { icon: Users,        name: 'Subcontractors', badge: null },
      { icon: Lock,         name: 'Biometric Access', badge: 'New', badgeType: 'green' },
      { icon: MapPin,       name: 'Site Tracking',  badge: null },
      { icon: Clock,        name: 'Timesheets',     badge: null },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: BookOpen,     name: 'Accounting',     badge: null },
      { icon: Receipt,      name: 'Invoices',       badge: '2', badgeType: 'red' },
      { icon: Ruler,        name: 'Job Costing',    badge: null },
      { icon: FileText,     name: 'Lien Waivers',   badge: null },
    ],
  },
  {
    label: 'Legals',
    items: [
      { icon: Scale,        name: 'Attorneys',          badge: null },
      { icon: Handshake,    name: 'Arbitration',        badge: null },
      { icon: Compass,      name: 'Architects',         badge: null },
      { icon: Wrench,       name: 'Engineers',          badge: null },
      { icon: FileCheck,    name: 'Agreements',         badge: null },
      { icon: PenLine,      name: 'E-Signature',        badge: null },
      { icon: Flame,        name: 'Fire Dept',          badge: null },
      { icon: HeartPulse,   name: 'Health & Safety',    badge: null },
      { icon: Umbrella,     name: 'Insurance',          badge: null },
      { icon: FolderOpen,   name: 'Projects',           badge: null },
      { icon: Quote,        name: 'Quotes',             badge: null },
      { icon: Building2,    name: 'Realtors',           badge: null },
      { icon: ShieldAlert,  name: 'Security',           badge: null },
      { icon: Landmark,     name: 'Title Companies',    badge: null },
      { icon: Map,          name: 'Town Planning',      badge: null },
      { icon: BadgeCheck,   name: 'Verification Orders', badge: null },
    ],
  },
];

// ─── Map sidebar item name → lazy component ──────────────────────
const deptComponentMap: Record<string, React.LazyExoticComponent<(p: { onBack: () => void }) => JSX.Element>> = {
  'Attorneys':           AttorneysDept,
  'Arbitration':         ArbitrationDept,
  'Architects':          ArchitectsDept,
  'Engineers':           EngineersDept,
  'Agreements':          AgreementsDept,
  'E-Signature':         ESignatureDept,
  'Fire Dept':           FireDeptDept,
  'Health & Safety':     HealthSafetyDept,
  'Insurance':           InsuranceDept,
  'Projects':            ProjectsDept,
  'Quotes':              QuotesDept,
  'Realtors':            RealtorsDept,
  'Security':            SecurityDept,
  'Title Companies':     TitleCompaniesDept,
  'Town Planning':       TownPlanningDept,
  'Verification Orders': VerificationDept,
};

// ─── CC sidebar item → tab index ────────────────────────────────
const CC_TAB_MAP: Record<string, number> = {
  'Pipeline': 1, 'Analytics': 2, 'AI Agents': 3,
  'Alerts': 4, 'Compliance': 5, 'Integrations': 6, 'CC Settings': 7,
};
const TAB_TO_SIDEBAR: Record<number, string> = {
  1: 'Pipeline', 2: 'Analytics', 3: 'AI Agents',
  4: 'Alerts', 5: 'Compliance', 6: 'Integrations', 7: 'CC Settings',
};

// ─── Alerts feed data ────────────────────────────────────────────
const alertItems = [
  { id: 'a1', icon: AlertTriangle, color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',      title: 'Urgent service call',       desc: 'Emergency request — AC unit down, commercial property', time: '2 min ago', action: 'Dispatch' as const },
  { id: 'a2', icon: Package,       color: 'text-primary',    bg: 'bg-primary/10 border-primary/20',       title: 'Material order shipped',    desc: 'Lumber order #4821 from Home Depot · ETA Thursday',     time: '1 hr ago',  action: null },
  { id: 'a3', icon: Receipt,       color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',   title: 'Invoice due in 3 days',     desc: 'Invoice #1043 ($4,200) — Riverside remodeling project',  time: '3 hr ago',  action: null },
  { id: 'a4', icon: Umbrella,      color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',   title: 'Insurance renewal due',     desc: 'GL policy expires in 14 days — action required',         time: '5 hr ago',  action: null },
  { id: 'a5', icon: Lock,          color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20',title: 'Biometric access alert',   desc: 'Zone C — Ray Gomez · Site access at 06:42 AM (unscheduled)', time: '8 hr ago', action: null },
];

// ─── Summary dashboard data ──────────────────────────────────────
const tabs = [
  "Today's Snapshot", 'Pipeline', 'Analytics', 'AI Agents',
  'Alerts', 'Compliance', 'Integrations', 'Settings',
  'Active Jobs (4)', 'Materials Queue', 'AI Activity',
];

const kpis = [
 { label: 'On-site today',     value: '—', sub: 'No data yet', trend: 'neutral' as 'up' | 'down' | 'neutral' },
 { label: 'Open orders',       value: '—', sub: 'No data yet', trend: 'neutral' as 'up' | 'down' | 'neutral' },
 { label: 'Pending invoices',  value: '—', sub: 'No data yet', trend: 'neutral' as 'up' | 'down' | 'neutral' },
 { label: 'AI actions today',  value: '—', sub: 'No data yet', trend: 'neutral' as 'up' | 'down' | 'neutral' },
];

const calls: {
  initials: string;
  name: string;
  meta: string;
  status: string;
  color: string;
}[] = [];

const materials: {
  name: string;
  sub: string;
  status: string;
  color: string;
}[] = [];

const biometrics: {
  name: string;
  sub: string;
  status: string;
  ok: boolean;
}[] = [];

const accounting = [
  { label: 'Revenue this month',   value: '$0' },
  { label: 'Materials spent',      value: '$0' },
  { label: 'Labor / sub costs',    value: '$0' },
  { label: 'Net margin',           value: '$0', positive: true  },
  { label: 'Outstanding A/R',      value: '$0', negative: true  },
];

function StatusPill({ status, color }: { status: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    blue:  'bg-primary/10 text-primary',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${colorMap[color] ?? ''}`}>
      {status}
    </span>
  );
}

function DeptLoader() {
  return (
    <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Loading department…</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground text-sm">
      <BrainCircuit className="h-8 w-8 mx-auto mb-2 opacity-30" />
      <p>{message}</p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────
export default function GCCommandDashboard({ tradeKey }: { tradeKey?: string }) {
  const [activeTab, setActiveTab]         = useState(0);
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');
  // Collapsed state per section label
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    'Command Center': false,
    Overview: false, Communications: false, Materials: true,
    Workforce: true, Finance: true, Legals: false,
  });

  // Trade template from Command Center
  const template = getTemplateByAudience('trade', tradeKey as TradeKey);

  const legalsRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSection = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Scroll Legals into view when it becomes uncollapsed
  useEffect(() => {
    if (!collapsed['Legals'] && legalsRef.current && sidebarRef.current) {
      legalsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [collapsed['Legals']]);

  const ActiveDept = deptComponentMap[activeSidebar] ?? null;
  const isDept = ActiveDept !== null;

  const nav = useNavigate();

  const handleSidebarClick = (name: string) => {
    if (name === 'Design Checklist') {
      nav('/contractor/quote-intake');
      return;
    }
    if (name in CC_TAB_MAP) {
      setActiveTab(CC_TAB_MAP[name]);
      setActiveSidebar(name); // not in deptComponentMap → isDept stays false; highlights sidebar
      return;
    }
    setActiveSidebar(name);
  };

  const handleTabClick = (i: number) => {
    setActiveTab(i);
    if (i in TAB_TO_SIDEBAR) {
      setActiveSidebar(TAB_TO_SIDEBAR[i]);
    } else {
      setActiveSidebar('Dashboard');
    }
  };

  const allKpisEmpty = kpis.every(k => k.value === '—');
  const serviceNames = ['Materials', 'Workforce', 'Finance', 'Legals'];
  const serviceSummary = serviceNames.join(' · ');

  return (
    <div className="flex flex-col h-full min-h-full w-full min-w-0 bg-background">
      {/* ── AI Input Bar ── */}
      <div className="bg-card/80 backdrop-blur border-b border-border px-3 sm:px-5 py-3 flex items-center gap-2 shrink-0">
        <Input
          placeholder={
            isDept
              ? `Ask AI about ${activeSidebar}…`
              : 'Ask anything about your jobs, materials, subs, or finances…'
          }
          className="flex-1 text-sm bg-background border-border focus-visible:ring-primary/50"
        />
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="default" size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/80 shadow-sm shadow-primary/20">
            <Mic className="w-3.5 h-3.5" /> Voice
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border text-foreground hover:bg-primary hover:text-primary-foreground">
            <Mail className="w-3.5 h-3.5" /> Email
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border text-foreground hover:bg-primary hover:text-primary-foreground">
            <ClipboardList className="w-3.5 h-3.5" /> Form
          </Button>
        </div>
        <Button size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/80 shadow-sm shadow-primary/20">
          <Send className="w-3.5 h-3.5" /> Send
        </Button>
      </div>

      {/* ── Command Center Banner ── */}
      {template && (
        <div className="shrink-0 border-b border-border bg-muted/30 px-3 sm:px-5 py-1.5 flex items-center gap-3">
          <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground">{template.name}</span>
          {template.config.kpis.slice(0, 1).map(kpi => (
            <span key={kpi.key} className="hidden sm:inline text-xs text-muted-foreground">
              {kpi.label}: <span className="font-bold text-foreground">{kpi.value}</span>
            </span>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs border-border text-foreground hover:bg-primary hover:text-primary-foreground"
              onClick={() => { setActiveTab(1); setActiveSidebar('Pipeline'); }}
            >
              <GitBranch className="w-3 h-3" /> Pipeline
            </Button>
            <Button size="sm" className="h-7 gap-1.5 text-xs bg-primary text-primary-foreground">
              <Navigation className="w-3 h-3" /> Dispatch
            </Button>
          </div>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Sidebar ── */}
        <div ref={sidebarRef} className="hidden md:flex w-[220px] xl:w-[250px] border-r border-border shrink-0 flex-col overflow-hidden bg-transparent">
          {/* Scrollable section list */}
          <div className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {sidebarSections.map((section) => {
              const isLegals = section.label === 'Legals';
              const isCollapsed = collapsed[section.label];
              return (
                <div key={section.label} ref={isLegals ? legalsRef : undefined} className="px-3 mb-3">
                  {/* Section header — clickable to collapse */}
                  <button
                    onClick={() => toggleSection(section.label)}
                    className="w-full flex items-center justify-between py-1 rounded hover:bg-muted/60 transition-colors group"
                  >
                    <span className={`flex items-center text-[11px] font-semibold tracking-[0.14em] uppercase ${isLegals ? 'text-primary' : 'text-muted-foreground'}`}>
                      {section.label}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-muted-foreground/60 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                  </button>

                  {/* Section items */}
                  {!isCollapsed && section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSidebar === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleSidebarClick(item.name)}
                        className={`w-full flex items-center justify-between py-1.5 rounded text-[12.5px] text-left leading-relaxed transition-colors ${
                          isActive
                            ? 'bg-primary/15 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <Badge
                            variant={
                              item.badgeType === 'red'   ? 'destructive' :
                              item.badgeType === 'green' ? 'default'     : 'secondary'
                            }
                            className="text-[9px] px-1 py-0 h-3.5 shrink-0 ml-1"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Content Panel ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 lg:p-5">
          {isDept ? (
            /* Department view */
            <Suspense fallback={<DeptLoader />}>
              <ActiveDept onBack={() => setActiveSidebar('Dashboard')} />
            </Suspense>
          ) : (
            /* Main dashboard view */
            <>
              {/* Tabs */}
              <div className="flex gap-0 border-b border-border bg-transparent px-1 sm:px-2 mb-5 overflow-x-auto">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => handleTabClick(i)}
                    className={`whitespace-nowrap px-3.5 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                      i === activeTab
                        ? 'text-foreground border-primary font-semibold'
                        : 'text-muted-foreground border-transparent hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ── Pipeline tab (1) ── */}
              {activeTab === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{template?.name ?? 'Pipeline'}</h2>
                      <p className="text-xs text-muted-foreground">Project pipeline · drag to update stage</p>
                    </div>
                    <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground">
                      <Plus className="w-3.5 h-3.5" /> New Job
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {['Lead', 'Quoted', 'Active', 'Punch List', 'Complete'].map(stage => (
                      <Card key={stage} className="border-border bg-card">
                        <CardHeader className="p-3 pb-1">
                          <CardTitle className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{stage}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <p className="text-xs text-muted-foreground text-center py-4">No jobs</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {template && template.config.quickActions.length > 0 && (
                    <Card className="border-border bg-card">
                      <CardContent className="p-3.5">
                        <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Quick Actions</div>
                        <div className="flex flex-wrap gap-2">
                          {template.config.quickActions.map(action => (
                            <Button key={action.key} size="sm" variant="outline" className="gap-1.5 text-xs border-border text-foreground hover:bg-primary hover:text-primary-foreground">
                              <Zap className="w-3 h-3" /> {action.label}
                            </Button>
                          ))}
                          <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground">
                            <Navigation className="w-3 h-3" /> Dispatch
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ── Analytics tab (2) ── */}
              {activeTab === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
                  {template ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {template.config.kpis.map(kpi => (
                          <Card key={kpi.key} className="border-border bg-card">
                            <CardContent className="p-4">
                              <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
                              <div className="text-3xl font-bold text-foreground leading-tight">{kpi.value}</div>
                              {kpi.delta && <div className="text-xs text-muted-foreground mt-1">{kpi.delta}</div>}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {template.config.insights.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {template.config.insights.map(insight => (
                            <Card key={insight.key} className="border-border bg-card">
                              <CardHeader className="p-3.5 pb-1.5">
                                <CardTitle className="text-sm font-semibold">{insight.title}</CardTitle>
                              </CardHeader>
                              <CardContent className="p-3.5 pt-0">
                                <p className="text-sm text-muted-foreground">{insight.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyState message="Analytics will populate as your team uses the platform." />
                  )}
                </div>
              )}

              {/* ── AI Agents tab (3) ── */}
              {activeTab === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">AI Agents</h2>
                    <Badge className="bg-emerald-500/15 text-emerald-400 text-xs">Active</Badge>
                  </div>
                  {template && template.config.agents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {template.config.agents.map(agent => (
                        <Card key={agent.key} className="border-border bg-card">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-primary" />
                                {agent.label}
                              </CardTitle>
                              <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400">Ready</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                            <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground">
                              <Play className="w-3 h-3" /> Run Agent
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No AI agents configured for this trade yet." />
                  )}
                  <Card className="border-border bg-card">
                    <CardHeader className="p-3.5 pb-1.5">
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-muted-foreground" /> Agent Activity Log
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3.5 pt-0">
                      <EmptyState message="Agent activity will stream here once integrated with live data." />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── Alerts tab (4) ── */}
              {activeTab === 4 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Alerts Feed</h2>
                    <Badge variant="destructive" className="text-xs">1 urgent</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-1">Ordering · Finance / Insurance · Biometric</p>
                  {alertItems.map(alert => {
                    const Icon = alert.icon;
                    return (
                      <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.bg}`}>
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${alert.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground">{alert.title}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{alert.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
                        </div>
                        {alert.action && (
                          <Button size="sm" className="shrink-0 h-7 gap-1.5 text-xs bg-primary text-primary-foreground">
                            <Navigation className="w-3 h-3" /> {alert.action}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Compliance tab (5) ── */}
              {activeTab === 5 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">Compliance</h2>
                  {[
                    { label: 'License verification',   ok: false },
                    { label: 'Insurance certificate',  ok: false },
                    { label: 'OSHA safety training',   ok: false },
                    { label: 'Site inspection report', ok: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-4 h-4 ${item.ok ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <Badge variant="secondary">{item.ok ? 'Verified' : 'Pending'}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Integrations tab (6) ── */}
              {activeTab === 6 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Integrations</h2>
                  {template && template.config.integrations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {template.config.integrations.map(intg => (
                        <Card key={intg.key} className="border-border bg-card">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Plug2 className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-foreground capitalize">{intg.provider}</span>
                              </div>
                              <Badge variant="secondary" className="capitalize">{intg.status}</Badge>
                            </div>
                            <Button size="sm" variant="outline" className="text-xs border-border text-foreground hover:bg-primary hover:text-primary-foreground">
                              Configure
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No integrations configured for this trade yet." />
                  )}
                </div>
              )}

              {/* ── Settings tab (7) ── */}
              {activeTab === 7 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Command Center Settings</h2>
                  {template && (
                    <Card className="border-border bg-card">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Active Template</div>
                        <div className="text-sm font-semibold text-foreground">{template.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {template.version} · Trade: <span className="capitalize">{template.trade?.replace('_', ' ')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <EmptyState message="Settings panel in development. Trade-specific configuration will appear here." />
                </div>
              )}

              {/* ── Today / legacy tabs content ── */}
              {(activeTab === 0 || activeTab >= 8) && (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                {kpis.map((kpi) => (
                  <Card key={kpi.label} className="shadow-none border-border bg-card">
                    <CardContent className="p-3.5">
                      <div className="text-xs text-muted-foreground mb-1 leading-relaxed">{kpi.label}</div>
                      {/* AI Watched badge */}
                      <div className="flex items-center gap-1 mb-1">
                        <BrainCircuit className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[9px] text-muted-foreground/50 font-medium">AI Watched</span>
                      </div>
                      <div className="text-[1.65rem] font-semibold text-foreground leading-tight">{kpi.value}</div>
                      <div className={`text-[11px] mt-1 flex items-center gap-1 ${
                        kpi.trend === 'up'   ? 'text-emerald-600' :
                        kpi.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {kpi.trend === 'up'   && <TrendingUp   className="w-3 h-3" />}
                        {kpi.trend === 'down' && <TrendingDown  className="w-3 h-3" />}
                        {kpi.sub}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Today's Snapshot empty state */}
              {activeTab === 0 && allKpisEmpty && (
                <div className="mb-4">
                  <EmptyState message="No activity data yet. KPI intelligence activates as your team uses the platform." />
                </div>
              )}

              {/* Row 1 */}
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3 mb-4">
                <Card className="shadow-none border-border bg-card">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-[14px] font-semibold flex items-center gap-1.5">
                        <Phone className="w-4 h-4" /> Recent inbound calls
                      </CardTitle>
                      <span className="text-[11px] text-muted-foreground cursor-pointer hover:text-primary">View all ↗</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    {calls.length === 0 ? (
                      <EmptyState message="No calls yet. The AI agent will log handled calls here." />
                    ) : (
                      calls.map((call) => (
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
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-none border-border bg-card">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-[14px] font-semibold flex items-center gap-1.5">
                        <Package className="w-4 h-4" /> Material orders
                      </CardTitle>
                      <span className="text-[11px] text-muted-foreground cursor-pointer hover:text-primary">View all ↗</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    {materials.length === 0 ? (
                      <EmptyState message="No material orders yet. Orders placed via AI will appear here." />
                    ) : (
                      materials.map((mat) => (
                        <div key={mat.name} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                          <div>
                            <div className="text-xs font-medium text-foreground">{mat.name}</div>
                            <div className="text-[11px] text-muted-foreground">{mat.sub}</div>
                          </div>
                          <StatusPill status={mat.status} color={mat.color} />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3 mb-4">
                <Card className="shadow-none border-border bg-card">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-[14px] font-semibold flex items-center gap-1.5">
                        <Lock className="w-4 h-4" /> Biometric site access — live
                      </CardTitle>
                      <span className="text-[11px] text-muted-foreground cursor-pointer hover:text-primary">Movement log ↗</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    {biometrics.length === 0 ? (
                      <EmptyState message="No access events recorded yet. Site biometric data will appear here." />
                    ) : (
                      biometrics.map((bio) => (
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
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-none border-border bg-card">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-[14px] font-semibold flex items-center gap-1.5">
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

              {/* Legals quick-access strip */}
              <Card className="shadow-none border-border bg-muted/20">
                <CardContent className="p-3.5">
                  <div className="text-xs font-semibold text-primary mb-2.5 uppercase tracking-wide">
                    Legals — Quick Access
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sidebarSections.find(s => s.label === 'Legals')!.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleSidebarClick(item.name)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-card text-[11px] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                        >
                          <Icon className="w-3 h-3" />
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Persistent contractor identity / status banner ── */}
      <div className="shrink-0 border-t border-border bg-card px-3 sm:px-5 py-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="inline-flex items-center gap-1.5 font-semibold text-foreground">
              <House className="h-3.5 w-3.5 text-primary" />
              <span>Contractors — kluje.com</span>
            </div>
            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/80">General Contractor</Badge>
            {tradeKey && (
              <Badge variant="secondary" className="text-[10px] capitalize">{tradeKey.replace('_', ' ')}</Badge>
            )}
            <span className="text-muted-foreground">Contractor AI Agent · kluje.com</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online
            </span>
            {serviceSummary && (
              <span className="text-muted-foreground truncate max-w-full">{serviceSummary}</span>
            )}
          </div>
          <div className="text-[11px] sm:text-xs leading-relaxed text-muted-foreground">
            🤖 <span className="text-primary font-medium">Agent activity — last hour:</span>{' '}
            Auto-responded to Home Depot order confirmation call · Drafted quote #1047 from email inquiry · Flagged rebar delivery delay &amp; sourced alternate supplier · Ray Gomez Zone C access alert sent to your phone ·{' '}
            <button type="button" className="underline text-primary hover:text-primary/80">
              See full log ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
