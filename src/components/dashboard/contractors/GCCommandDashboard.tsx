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
      { icon: ClipboardList, name: 'Design Checklist', badge: 'New', badgeType: 'green' },
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
  return null; // Simplified — status shown in content area instead
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
  const [tickerHeight, setTickerHeight] = useState(36);
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

  const nav = useNavigate();

  const handleSidebarClick = (name: string) => {
    if (name === 'Design Checklist') {
      nav('/contractor/quote-intake');
      return;
    }
    setActiveSidebar(name);
  };

  const allKpisEmpty = kpis.every(k => k.value === '—');
  const isTickerResizing = useRef(false);

  const handleTickerResizeStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    isTickerResizing.current = true;
    const startY = e.clientY;
    const startHeight = tickerHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      if (!isTickerResizing.current) return;
      const delta = startY - ev.clientY;
      setTickerHeight(Math.min(140, Math.max(36, startHeight + delta)));
    };

    const onUp = () => {
      isTickerResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="flex flex-col h-full min-h-full w-full min-w-0 bg-blue-50/60 dark:bg-slate-950">
      {/* ── AI Input Bar ── */}
      <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-transparent dark:from-primary/20 dark:via-blue-900/40 dark:to-slate-950 border-b border-blue-200/70 dark:border-slate-800 px-4 sm:px-5 py-2.5 flex items-center gap-2 shrink-0">
        <Input
          placeholder={
            isDept
              ? `Ask AI about ${activeSidebar}…`
              : 'Ask anything about your jobs, materials, subs, or finances…'
          }
          className="flex-1 text-sm bg-white dark:bg-slate-900/80 border-blue-200 dark:border-slate-700"
        />
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="default" size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/80 shadow-sm shadow-blue-500/20">
            <Mic className="w-3.5 h-3.5" /> Voice
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-blue-300/90 text-blue-700 hover:bg-blue-600 hover:text-white dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-700">
            <Mail className="w-3.5 h-3.5" /> Email
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-blue-300/90 text-blue-700 hover:bg-blue-600 hover:text-white dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-700">
            <ClipboardList className="w-3.5 h-3.5" /> Form
          </Button>
        </div>
        <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/80 shadow-sm shadow-blue-500/20">
          <Send className="w-3.5 h-3.5" /> Send
        </Button>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Sidebar ── */}
        <div ref={sidebarRef} className="hidden md:flex w-[220px] xl:w-[250px] border-r border-blue-100 dark:border-slate-700 shrink-0 flex-col overflow-hidden bg-transparent">
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
                    className="w-full flex items-center justify-between py-1 rounded hover:bg-blue-100/60 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <span className={`flex items-center text-[11px] font-semibold tracking-[0.14em] uppercase ${isLegals ? 'text-amber-700' : 'text-blue-700/80 dark:text-slate-300'}`}>
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
                        className={`w-full flex items-center justify-between py-1.5 rounded text-[12.5px] text-left leading-relaxed transition-colors ${
                          isActive
                            ? 'bg-blue-500/12 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-blue-100/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
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
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 lg:p-5 bg-gradient-to-b from-blue-100/30 to-white dark:from-slate-950 dark:to-slate-900">
          {isDept ? (
            /* Department view */
            <Suspense fallback={<DeptLoader />}>
              <ActiveDept onBack={() => setActiveSidebar('Dashboard')} />
            </Suspense>
          ) : (
            /* Main dashboard view */
            <>
              {/* Tabs */}
              <div className="flex gap-0 border-b border-blue-200 dark:border-slate-700 bg-transparent px-1 sm:px-2 mb-5 overflow-x-auto">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`px-3.5 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                      i === activeTab
                        ? 'text-slate-900 dark:text-white border-blue-500 font-semibold'
                        : 'text-slate-500 dark:text-slate-300 border-transparent hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                {kpis.map((kpi) => (
                  <Card key={kpi.label} className="shadow-none border-blue-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900">
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
                <Card className="shadow-none border-blue-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900">
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

                <Card className="shadow-none border-blue-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900">
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
                <Card className="shadow-none border-blue-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900">
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

                <Card className="shadow-none border-blue-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900">
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
              <Card className="shadow-none border-blue-200/70 dark:border-slate-700 bg-blue-50/70 dark:bg-slate-900">
                <CardContent className="p-3.5">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2.5 uppercase tracking-wide">
                    Legals — Quick Access
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sidebarSections.find(s => s.label === 'Legals')!.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleSidebarClick(item.name)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-400/60 transition-colors"
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

      {/* ── Resizable ticker ── */}
      <div className="shrink-0">
        <button
          type="button"
          aria-label="Resize agent activity panel"
          title="Drag to resize agent activity panel"
          onMouseDown={handleTickerResizeStart}
          className="w-full h-2 border-t border-border bg-muted/70 hover:bg-muted cursor-row-resize"
        />
        <div
          className="bg-white/90 dark:bg-slate-900 border-t border-blue-200 dark:border-slate-700 px-4 py-1.5 text-[11px] text-slate-600 dark:text-slate-300 overflow-y-auto"
          style={{ height: `${tickerHeight}px` }}
        >
          🤖 <span className="text-blue-600 dark:text-blue-300 font-medium">Agent activity — last hour:</span>{' '}
          Auto-responded to Home Depot order confirmation call · Drafted quote #1047 from email inquiry · Flagged rebar delivery delay &amp; sourced alternate supplier · Ray Gomez Zone C access alert sent to your phone ·{' '}
          <span className="cursor-pointer underline text-blue-600 dark:text-blue-300">See full log ↗</span>
        </div>
      </div>
    </div>
  );
}
