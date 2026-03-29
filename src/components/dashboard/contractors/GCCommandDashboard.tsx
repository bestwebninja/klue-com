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
  Loader2, BrainCircuit,
} from 'lucide-react';

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
    label: 'Overview',
    aiStatus: 'monitoring' as const,
    items: [
      { icon: BarChart3,    name: 'Dashboard',     badge: null },
      { icon: MapPin,       name: 'Site Map',       badge: 'Live', badgeType: 'green' },
      { icon: Calendar,     name: 'Schedule',       badge: null },
    ],
  },
  {
    label: 'Communications',
    aiStatus: 'monitoring' as const,
    items: [
      { icon: Phone,        name: 'Inbound Calls',  badge: '3',  badgeType: 'red' },
      { icon: Mail,         name: 'Email Inbox',    badge: '7',  badgeType: 'default' },
      { icon: MessageSquare,name: 'Sub Messaging',  badge: null },
      { icon: Bot,          name: 'Agent Log',      badge: null },
    ],
  },
  {
    label: 'Materials',
    aiStatus: 'idle' as const,
    items: [
      { icon: Package,      name: 'Orders',         badge: null },
      { icon: Factory,      name: 'Suppliers',      badge: null },
      { icon: Archive,      name: 'Inventory',      badge: null },
      { icon: DollarSign,   name: 'Quote Builder',  badge: null },
    ],
  },
  {
    label: 'Workforce',
    aiStatus: 'idle' as const,
    items: [
      { icon: Users,        name: 'Subcontractors', badge: null },
      { icon: Lock,         name: 'Biometric Access', badge: 'New', badgeType: 'green' },
      { icon: MapPin,       name: 'Site Tracking',  badge: null },
      { icon: Clock,        name: 'Timesheets',     badge: null },
    ],
  },
  {
    label: 'Finance',
    aiStatus: 'idle' as const,
    items: [
      { icon: BookOpen,     name: 'Accounting',     badge: null },
      { icon: Receipt,      name: 'Invoices',       badge: '2', badgeType: 'red' },
      { icon: Ruler,        name: 'Job Costing',    badge: null },
      { icon: FileText,     name: 'Lien Waivers',   badge: null },
    ],
  },
  {
    label: 'Legals',
    aiStatus: 'idle' as const,
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

// ─── Summary dashboard data ──────────────────────────────────────
const tabs = ["Today's Snapshot", 'Active Jobs (4)', 'Materials Queue', 'AI Activity'];

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
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    blue:  'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
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

function AiStatusDot({ status }: { status: 'monitoring' | 'idle' }) {
  if (status === 'monitoring') {
    return (
      <span className="flex items-center gap-1 ml-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
        <span className="text-[9px] text-emerald-500 font-medium">AI Active</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 ml-1">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      <span className="text-[9px] text-gray-400 font-medium">AI Standby</span>
    </span>
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
export default function GCCommandDashboard() {
  const [activeTab, setActiveTab]         = useState(0);
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');
  // Collapsed state per section label; Legals starts expanded
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    Overview: false, Communications: false, Materials: true,
    Workforce: true, Finance: true, Legals: false,
  });
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

  const handleSidebarClick = (name: string) => {
    setActiveSidebar(name);
  };

  const allKpisEmpty = kpis.every(k => k.value === '—');

  return (
    <div className="flex flex-col h-full -m-4 sm:-m-6 lg:-m-8">
      {/* ── Top Bar ── */}
      <div className="bg-card border-b border-border px-4 sm:px-5 h-[52px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-primary-foreground">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Contractors — kluje.com
              {isDept && (
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                  / {activeSidebar}
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground">General Contractor AI Agent · kluje.com</div>
          </div>
        </div>
        <div className="hidden lg:block text-xs text-muted-foreground bg-muted border border-border rounded-md px-3 py-1.5">
          {isDept
            ? `AI monitoring active — ${activeSidebar} department`
            : 'Try: "Order 500 bags of Portland cement" or "How many subs are on site today?"'}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-[7px] h-[7px] rounded-full bg-emerald-500 inline-block" />
            Agent online
          </span>
        </div>
      </div>

      {/* ── AI Input Bar ── */}
      <div className="bg-card border-b border-border px-4 sm:px-5 py-2 flex items-center gap-2 shrink-0">
        <Input
          placeholder={
            isDept
              ? `Ask AI about ${activeSidebar}…`
              : 'Ask anything about your jobs, materials, subs, or finances…'
          }
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

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <div ref={sidebarRef} className="hidden md:flex w-[195px] bg-card border-r border-border shrink-0 flex-col overflow-hidden">
          {/* Scrollable section list */}
          <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {sidebarSections.map((section) => {
              const isLegals = section.label === 'Legals';
              const isCollapsed = collapsed[section.label];
              return (
                <div key={section.label} ref={isLegals ? legalsRef : undefined} className="px-2 mb-0.5">
                  {/* Section header — clickable to collapse */}
                  <button
                    onClick={() => toggleSection(section.label)}
                    className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-muted/60 transition-colors group"
                  >
                    <span className={`flex items-center text-[10px] font-semibold tracking-wider uppercase ${isLegals ? 'text-orange-500' : 'text-muted-foreground'}`}>
                      {section.label}
                      <AiStatusDot status={section.aiStatus} />
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
                        className={`w-full flex items-center justify-between px-2 py-[3px] rounded text-[11.5px] text-left transition-colors ${
                          isActive
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

          {/* Quick-jump strip at bottom */}
          <div className="border-t border-border px-3 py-2 shrink-0">
            <p className="text-[9.5px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Jump to</p>
            <div className="flex flex-wrap gap-1">
              {sidebarSections.map(s => (
                <button
                  key={s.label}
                  onClick={() => {
                    setCollapsed(prev => ({ ...prev, [s.label]: false }));
                    setTimeout(() => {
                      if (s.label === 'Legals' && legalsRef.current) {
                        legalsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 50);
                  }}
                  className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                    s.label === 'Legals'
                      ? 'border-orange-400 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content Panel ── */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
          {isDept ? (
            /* Department view */
            <Suspense fallback={<DeptLoader />}>
              <ActiveDept onBack={() => setActiveSidebar('Dashboard')} />
            </Suspense>
          ) : (
            /* Main dashboard view */
            <>
              {/* Tabs */}
              <div className="flex gap-0 border-b border-border bg-card rounded-t-lg px-3 mb-4">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`px-3.5 py-2.5 text-[13px] border-b-2 -mb-px transition-colors ${
                      i === activeTab
                        ? 'text-foreground border-orange-500 font-medium'
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
                      <div className="text-[11px] text-muted-foreground mb-0.5">{kpi.label}</div>
                      {/* AI Watched badge */}
                      <div className="flex items-center gap-1 mb-1">
                        <BrainCircuit className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[9px] text-muted-foreground/50 font-medium">AI Watched</span>
                      </div>
                      <div className="text-2xl font-semibold text-foreground">{kpi.value}</div>
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

              {/* Legals quick-access strip */}
              <Card className="shadow-none border-orange-200/40 dark:border-orange-900/30 bg-orange-50/20 dark:bg-orange-950/10">
                <CardContent className="p-3.5">
                  <div className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">
                    Legals — Quick Access
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sidebarSections.find(s => s.label === 'Legals')!.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleSidebarClick(item.name)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-orange-200/60 dark:border-orange-800/40 bg-card text-[11px] text-muted-foreground hover:text-orange-600 hover:border-orange-400/60 transition-colors"
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
        </div>
      </div>

      {/* ── Ticker ── */}
      <div className="bg-card border-t border-border px-4 py-2 text-[11px] text-muted-foreground shrink-0 whitespace-nowrap overflow-hidden">
        🤖 <span className="text-orange-500 font-medium">Agent activity — last hour:</span>{' '}
        Auto-responded to Home Depot order confirmation call · Drafted quote #1047 from email inquiry · Flagged rebar delivery delay &amp; sourced alternate supplier · Ray Gomez Zone C access alert sent to your phone ·{' '}
        <span className="cursor-pointer underline text-orange-500">See full log ↗</span>
      </div>
    </div>
  );
}
