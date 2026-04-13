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
  Loader2, BrainCircuit, Download, AlertTriangle, Siren, Sparkles, Globe2,
  Star, ThumbsUp, Send as SendIcon, GitPullRequest,
} from 'lucide-react';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { FloatingAIChat } from '@/components/dashboard/FloatingAIChat';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// ─── Lazy-load each department to keep initial bundle small ───
const AttorneysDept = lazy(() => import('./legals/AttorneysDept'));
const ArbitrationDept = lazy(() => import('./legals/ArbitrationDept'));
const ArchitectsDept = lazy(() => import('./legals/ArchitectsDept'));
const EngineersDept = lazy(() => import('./legals/EngineersDept'));
const AgreementsDept = lazy(() => import('./legals/AgreementsDept'));
const ESignatureDept = lazy(() => import('./legals/ESignatureDept'));
const FireDeptDept = lazy(() => import('./legals/FireDeptDept'));
const HealthSafetyDept = lazy(() => import('./legals/HealthSafetyDept'));
const InsuranceDept = lazy(() => import('./legals/InsuranceDept'));
const ProjectsDept = lazy(() => import('./legals/ProjectsDept'));
const QuotesDept = lazy(() => import('./legals/QuotesDept'));
const RealtorsDept = lazy(() => import('./legals/RealtorsDept'));
const SecurityDept = lazy(() => import('./legals/SecurityDept'));
const TitleCompaniesDept = lazy(() => import('./legals/TitleCompaniesDept'));
const TownPlanningDept = lazy(() => import('./legals/TownPlanningDept'));
const VerificationDept = lazy(() => import('./legals/VerificationOrdersDept'));
const CleaningDept = lazy(() => import('./legals/CleaningDept'));
// ─── New departments (11-feature build) ───
const InvoicesDept = lazy(() => import('./legals/InvoicesDept'));
const CRMPipelineDept = lazy(() => import('./legals/CRMPipelineDept'));
const BidAnalyticsDept = lazy(() => import('./legals/BidAnalyticsDept'));
const ScheduleDept = lazy(() => import('./legals/ScheduleDept'));
const MaterialsTakeoffDept = lazy(() => import('./legals/MaterialsTakeoffDept'));
const PermitsDept = lazy(() => import('./legals/PermitsDept'));
const ReviewsDept = lazy(() => import('./legals/ReviewsDept'));
const FollowUpsDept = lazy(() => import('./legals/FollowUpsDept'));
const MarketRatesDept = lazy(() => import('./legals/MarketRatesDept'));

// ─── Sidebar data ───────────────────────────────────────────────
const sidebarSections = [
  {
    label: 'Overview',
    items: [
      { icon: BarChart3, name: 'GC-Dashboard', badge: null },
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
      { icon: Star, name: 'Reviews', badge: '3', badgeType: 'red' },
      { icon: SendIcon, name: 'Follow-ups', badge: 'New', badgeType: 'green' },
    ],
  },
  {
    label: 'Materials',
    items: [
      { icon: Package, name: 'Orders', badge: null },
      { icon: Factory, name: 'Suppliers', badge: null },
      { icon: Archive, name: 'Inventory', badge: null },
      { icon: DollarSign, name: 'Quote Builder', badge: null },
      { icon: Ruler, name: 'Materials Takeoff', badge: 'New', badgeType: 'green' },
      { icon: ClipboardList, name: 'Design Checklist', badge: 'New', badgeType: 'green' },
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
      { icon: GitPullRequest, name: 'CRM Pipeline', badge: 'New', badgeType: 'green' },
      { icon: BarChart3, name: 'Bid Analytics', badge: 'New', badgeType: 'green' },
      { icon: TrendingUp, name: 'Market Rates', badge: 'New', badgeType: 'green' },
      { icon: FileText, name: 'Lien Waivers', badge: null },
    ],
  },
  {
    label: 'Legals',
    items: [
      { icon: Scale, name: 'Attorneys', badge: null },
      { icon: Handshake, name: 'Arbitration', badge: null },
      { icon: Compass, name: 'Architects', badge: null },
      { icon: Wrench, name: 'Engineers', badge: null },
      { icon: FileCheck, name: 'Agreements', badge: null },
      { icon: PenLine, name: 'E-Signature', badge: null },
      { icon: Flame, name: 'Fire Dept', badge: null },
      { icon: HeartPulse, name: 'Health & Safety', badge: null },
      { icon: Umbrella, name: 'Insurance', badge: null },
      { icon: FolderOpen, name: 'Projects', badge: null },
      { icon: Quote, name: 'Quotes', badge: null },
      { icon: Building2, name: 'Realtors', badge: null },
      { icon: ShieldAlert, name: 'Security', badge: null },
      { icon: Landmark, name: 'Title Companies', badge: null },
      { icon: Map, name: 'Town Planning', badge: null },
      { icon: BadgeCheck, name: 'Verification Orders', badge: null },
      { icon: Sparkles, name: 'Cleaning', badge: 'New', badgeType: 'green' },
      { icon: FileCheck, name: 'Permits', badge: '1', badgeType: 'red' },
    ],
  },
];

// ─── Map sidebar item name → lazy component ──────────────────────
const deptComponentMap: Record<string, React.LazyExoticComponent<(p: { onBack: () => void }) => JSX.Element>> = {
  // ── Legals (original) ──
  Attorneys: AttorneysDept,
  Arbitration: ArbitrationDept,
  Architects: ArchitectsDept,
  Engineers: EngineersDept,
  Agreements: AgreementsDept,
  'E-Signature': ESignatureDept,
  'Fire Dept': FireDeptDept,
  'Health & Safety': HealthSafetyDept,
  Insurance: InsuranceDept,
  Projects: ProjectsDept,
  Quotes: QuotesDept,
  Realtors: RealtorsDept,
  Security: SecurityDept,
  'Title Companies': TitleCompaniesDept,
  'Town Planning': TownPlanningDept,
  'Verification Orders': VerificationDept,
  Cleaning: CleaningDept,
  // ── 11-feature build ──
  Invoices: InvoicesDept,
  'CRM Pipeline': CRMPipelineDept,
  'Bid Analytics': BidAnalyticsDept,
  Schedule: ScheduleDept,
  'Materials Takeoff': MaterialsTakeoffDept,
  Permits: PermitsDept,
  Reviews: ReviewsDept,
  'Follow-ups': FollowUpsDept,
  'Market Rates': MarketRatesDept,
};

// ─── Summary dashboard data ──────────────────────────────────────
const tabs = ["Today's Snapshot", 'Active Jobs', 'Materials Queue', 'AI Activity'];

const commandCenterAdds = {
  weeklyThroughput: '24 jobs',
  urgentDispatch: 'Urgent service call · Dispatch now',
  rebateMaximizer: 'Potential rebates detected in 2 open estimates.',
  alerts: ['Permit review needed', 'Supplier delay: tile delivery'],
};

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
  { label: 'Revenue this month', value: '$0' },
  { label: 'Materials spent', value: '$0' },
  { label: 'Labor / sub costs', value: '$0' },
  { label: 'Net margin', value: '$0', positive: true },
  { label: 'Outstanding A/R', value: '$0', negative: true },
];

function StatusPill({ status, color }: { status: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-emerald-400/15 text-emerald-300 border border-emerald-300/35',
    amber: 'bg-amber-300/15 text-amber-200 border border-amber-300/35',
    blue: 'bg-sky-400/15 text-sky-200 border border-sky-300/35',
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${colorMap[color] ?? ''}`}>
      {status}
    </span>
  );
}

function DeptLoader() {
  return (
    <div className="flex items-center justify-center py-20 gap-2 text-slate-300">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Loading department…</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-slate-300 text-sm">
      <BrainCircuit className="h-8 w-8 mx-auto mb-2 opacity-30" />
      <p>{message}</p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────
export default function GCCommandDashboard() {
  const { user } = useAuth();
  const { t, lang, toggleLang } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [activeSidebar, setActiveSidebar] = useState('GC-Dashboard');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    Overview: false,
    Communications: false,
    Materials: true,
    Workforce: true,
    Finance: true,
    Legals: false,
  });

  // ── Real-time KPI data from Supabase ──
  const [kpis, setKpis] = useState([
    { label: 'On-site today',    value: '—', sub: 'Loading…', trend: 'neutral' as const },
    { label: 'Open orders',      value: '—', sub: 'Loading…', trend: 'neutral' as const },
    { label: 'Pending invoices', value: '—', sub: 'Loading…', trend: 'neutral' as const },
    { label: 'AI actions today', value: '—', sub: 'No data yet', trend: 'neutral' as const },
  ]);
  const [profileZip, setProfileZip] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch ZIP from profile for weather
    (supabase as any).from('profiles').select('zip').eq('id', user.id).maybeSingle()
      .then(({ data }: any) => { if (data?.zip) setProfileZip(data.zip); });

    // Fetch active jobs count
    (supabase as any).from('command_center_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('business_unit_id', user.id)
      .then(({ count }: any) => {
        setKpis(prev => prev.map((k, i) =>
          i === 1 ? { ...k, value: String(count ?? 0), sub: 'Active construction jobs', trend: (count ?? 0) > 0 ? 'up' : 'neutral' as const } : k
        ));
      });

    // Fetch pending invoices / quotes
    (supabase as any).from('command_center_quotes')
      .select('id, payload', { count: 'exact' })
      .eq('business_unit_id', user.id)
      .then(({ data, count }: any) => {
        const total = (data ?? []).reduce((sum: number, q: any) =>
          sum + (parseFloat(q.payload?.total_amount ?? q.payload?.totalAmount ?? 0)), 0);
        setKpis(prev => prev.map((k, i) =>
          i === 2 ? { ...k, value: String(count ?? 0), sub: total > 0 ? `$${(total / 1000).toFixed(0)}k pipeline` : 'No pipeline yet', trend: (count ?? 0) > 0 ? 'up' : 'neutral' as const } : k
        ));
      });
  }, [user]);

  const legalsRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSection = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    if (!collapsed.Legals && legalsRef.current && sidebarRef.current) {
      legalsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [collapsed.Legals]);

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

  const allKpisEmpty = kpis.every((k) => k.value === '—');

  return (
    <div className="flex flex-col h-full min-h-full w-full min-w-0 bg-gradient-to-b from-[#07182f] via-[#081f38] to-[#07182f] text-slate-100">
      <FloatingAIChat />
      {/* ── AI Input Bar ── */}
      <div className="bg-[#081f3b]/95 backdrop-blur border-b border-amber-300/20 px-3 sm:px-5 py-3 flex items-center gap-2 shrink-0">
        <Input
          placeholder={
            isDept
              ? `${t('Ask AI about')} ${t(activeSidebar)}…`
              : t('Ask anything about your jobs, materials, subs, or finances…')
          }
          className="flex-1 text-sm bg-[#0d294f] border-amber-300/30 text-slate-100 placeholder:text-slate-300/70 focus-visible:ring-amber-300/60"
        />
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 text-[11px] bg-amber-300 text-[#1f3455] hover:bg-amber-200 border border-amber-200/80 shadow-sm shadow-amber-400/20"
          >
            <Mic className="w-3.5 h-3.5" /> Voice
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-amber-300/45 text-amber-100 hover:bg-amber-300/15 hover:text-amber-50"
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs border-amber-300/45 text-amber-100 hover:bg-amber-300/15 hover:text-amber-50"
          >
            <ClipboardList className="w-3.5 h-3.5" /> Form
          </Button>
        </div>
        <Button
          size="sm"
          className="gap-1.5 text-xs bg-amber-300 text-[#1f3455] hover:bg-amber-200 border border-amber-200/80 shadow-sm shadow-amber-400/20"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </Button>
        <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-amber-300/25">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="gap-1.5 text-xs border-amber-300/30 text-amber-200 hover:bg-amber-300/10"
          >
            <Globe2 className="w-3.5 h-3.5" />
            {lang === 'en' ? 'ES' : 'EN'}
          </Button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Sidebar ── */}
        <div
          ref={sidebarRef}
          className="hidden md:flex w-[220px] xl:w-[250px] border-r border-amber-300/20 shrink-0 flex-col overflow-hidden bg-[#081f3b]/50"
        >
          <div className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {sidebarSections.map((section) => {
              const isLegals = section.label === 'Legals';
              const isCollapsed = collapsed[section.label];

              return (
                <div key={section.label} ref={isLegals ? legalsRef : undefined} className="px-3 mb-3">
                  <button
                    onClick={() => toggleSection(section.label)}
                    className="w-full flex items-center justify-between py-1 rounded hover:bg-amber-300/10 transition-colors group"
                  >
                    <span
                      className={`flex items-center text-[11px] font-semibold tracking-[0.14em] uppercase ${
                        isLegals ? 'text-amber-200' : 'text-slate-300'
                      }`}
                    >
                      {section.label}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-300/60 transition-transform duration-200 ${
                        isCollapsed ? '-rotate-90' : ''
                      }`}
                    />
                  </button>

                  {!isCollapsed &&
                    section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSidebar === item.name;

                      return (
                        <button
                          key={item.name}
                          onClick={() => handleSidebarClick(item.name)}
                          className={`w-full flex items-center justify-between py-1.5 rounded text-[12.5px] text-left leading-relaxed transition-colors ${
                            isActive
                              ? 'bg-amber-300/15 text-amber-100 border border-amber-300/40 font-semibold'
                              : 'text-slate-300 hover:bg-amber-300/10 hover:text-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </div>
                          {item.badge && (
                            <Badge
                              variant={
                                item.badgeType === 'red'
                                  ? 'destructive'
                                  : item.badgeType === 'green'
                                    ? 'default'
                                    : 'secondary'
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
            <Suspense fallback={<DeptLoader />}>
              <ActiveDept onBack={() => setActiveSidebar('GC-Dashboard')} />
            </Suspense>
          ) : (
            <>
              <div className="flex gap-0 border-b border-amber-300/20 bg-transparent px-1 sm:px-2 mb-5 sm:mb-6 overflow-x-auto">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`px-3.5 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                      i === activeTab
                        ? 'text-amber-100 border-amber-300 font-semibold bg-amber-300/10'
                        : 'text-slate-300 border-transparent hover:text-amber-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <Card className="shadow-none border-amber-300/20 bg-[#0a2344]">
                  <CardContent className="p-3.5">
                    <div className="text-xs text-slate-300 mb-1">Weekly Throughput</div>
                    <div className="text-xl font-semibold text-amber-100">
                      {commandCenterAdds.weeklyThroughput}
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-none border-amber-300/30 bg-gradient-to-r from-amber-300/12 to-amber-200/5">
                  <CardContent className="p-3.5">
                    <div className="flex items-start gap-2">
                      <Siren className="h-4 w-4 mt-0.5 text-amber-200" />
                      <div>
                        <div className="text-xs text-slate-300">Priority Dispatch</div>
                        <div className="text-sm font-medium text-amber-100">{commandCenterAdds.urgentDispatch}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5 sm:mb-6">
                {kpis.map((kpi) => (
                  <Card
                    key={kpi.label}
                    className="shadow-none border-amber-300/20 bg-[#0a2344]"
                  >
                    <CardContent className="p-3.5">
                      <div className="text-xs text-slate-300 mb-1 leading-relaxed">{kpi.label}</div>
                      <div className="flex items-center gap-1 mb-1">
                        <BrainCircuit className="h-3 w-3 text-slate-300/50" />
                        <span className="text-[9px] text-slate-300/50 font-medium">AI Watched</span>
                      </div>
                      <div className="text-[1.65rem] font-semibold text-amber-100 leading-tight">{kpi.value}</div>
                      <div
                        className={`text-[11px] mt-1 flex items-center gap-1 ${
                          kpi.trend === 'up'
                            ? 'text-emerald-600'
                            : kpi.trend === 'down'
                              ? 'text-destructive'
                              : 'text-slate-300'
                        }`}
                      >
                        {kpi.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {kpi.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                        {kpi.sub}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {activeTab === 0 && allKpisEmpty && (
                <div className="mb-4">
                  <EmptyState message="No activity data yet. KPI intelligence activates as your team uses the platform." />
                </div>
              )}

              {/* ── Weather Widget ── */}
              {profileZip && (
                <div className="mb-4">
                  <WeatherWidget zip={profileZip} />
                </div>
              )}

              <div className="grid grid-cols-1 2xl:grid-cols-3 gap-3 mb-4 sm:mb-5">
                <Card className="shadow-none border-amber-300/20 bg-[#0a2344]">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-[14px] font-semibold flex items-center gap-1.5">
                        <Phone className="w-4 h-4" /> Recent inbound calls
                      </CardTitle>
                      <span className="text-[11px] text-slate-300 cursor-pointer hover:text-primary">
                        View all ↗
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    {calls.length === 0 ? (
                      <EmptyState message="No calls yet. The AI agent will log handled calls here." />
                    ) : (
                      calls.map((call) => (
                        <div
                          key={call.name}
                          className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                        >
                          <div className="w-[26px] h-[26px] rounded bg-muted text-[10px] font-semibold flex items-center justify-center text-slate-300 shrink-0">
                            {call.initials}
                          </div>
                          <div className="flex-1 ml-2">
                            <div className="text-xs font-medium text-slate-100">{call.name}</div>
                            <div className="text-[11px] text-slate-300">{call.meta}</div>
                          </div>
                          <StatusPill status={call.status} color={call.color} />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-none border-amber-300/20 bg-[#0a2344]">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-[14px] font-semibold flex items-center gap-1.5">
                        <Package className="w-4 h-4" /> Material orders
                      </CardTitle>
                      <span className="text-[11px] text-slate-300 cursor-pointer hover:text-primary">
                        View all ↗
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    {materials.length === 0 ? (
                      <EmptyState message="No material orders yet. Orders placed via AI will appear here." />
                    ) : (
                      materials.map((mat) => (
                        <div
                          key={mat.name}
                          className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                        >
                          <div>
                            <div className="text-xs font-medium text-slate-100">{mat.name}</div>
                            <div className="text-[11px] text-slate-300">{mat.sub}</div>
                          </div>
                          <StatusPill status={mat.status} color={mat.color} />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-none border-amber-300/20 bg-[#0a2344]">
                  <CardHeader className="p-3.5 pb-2">
                    <CardTitle className="text-[14px] font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0 space-y-2">
                    {commandCenterAdds.alerts.map((alert) => (
                      <div key={alert} className="text-xs border border-amber-300/25 rounded-md px-2 py-1.5 bg-[#0d294f]">
                        {alert}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3 mb-4 sm:mb-5">
                <Card className="shadow-none border-amber-300/20 bg-[#0a2344]">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-[14px] font-semibold flex items-center gap-1.5">
                        <Lock className="w-4 h-4" /> Biometric site access — live
                      </CardTitle>
                      <span className="text-[11px] text-slate-300 cursor-pointer hover:text-primary">
                        Movement log ↗
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    {biometrics.length === 0 ? (
                      <EmptyState message="No access events recorded yet. Site biometric data will appear here." />
                    ) : (
                      biometrics.map((bio) => (
                        <div
                          key={bio.name}
                          className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${bio.ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <div className="flex-1 ml-2">
                            <div className="text-xs font-medium text-slate-100">{bio.name}</div>
                            <div className="text-[11px] text-slate-300">{bio.sub}</div>
                          </div>
                          <span className={`text-[11px] ${bio.ok ? 'text-emerald-600' : 'text-amber-200'}`}>
                            {bio.ok ? '✓' : '⚠'} {bio.status}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-none border-amber-300/20 bg-[#0a2344]">
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-[14px] font-semibold flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" /> Accounting snapshot
                      </CardTitle>
                      <span className="text-[11px] text-slate-300 cursor-pointer hover:text-primary">
                        Full report ↗
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0">
                    {accounting.map((row, i) => (
                      <div
                        key={row.label}
                        className={`flex justify-between py-1.5 text-xs ${
                          i < accounting.length - 1 ? 'border-b border-border' : ''
                        } ${i === accounting.length - 2 ? 'font-semibold' : ''}`}
                      >
                        <span className="text-slate-300">{row.label}</span>
                        <span
                          className={`font-medium ${
                            row.positive
                              ? 'text-emerald-600'
                              : row.negative
                                ? 'text-destructive'
                                : 'text-slate-100'
                          }`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-none border-amber-300/20 bg-gradient-to-r from-[#0a2344] to-[#0d294f]">
                <CardContent className="p-3.5">
                  <div className="text-xs font-semibold text-amber-200 mb-2.5 uppercase tracking-wide">
                    Legals — Quick Access
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sidebarSections
                      .find((s) => s.label === 'Legals')!
                      .items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.name}
                            onClick={() => handleSidebarClick(item.name)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-300/25 bg-[#12335d] text-[11px] text-slate-200 hover:text-amber-100 hover:border-amber-300/55 transition-colors"
                          >
                            <Icon className="w-3 h-3" />
                            {item.name}
                          </button>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4 shadow-none border-amber-300/20 bg-[#0a2344]">
                <CardHeader className="p-3.5 pb-2">
                  <CardTitle className="text-[14px] font-semibold">Rebate Maximizer</CardTitle>
                </CardHeader>
                <CardContent className="p-3.5 pt-0 text-xs text-slate-300">
                  {commandCenterAdds.rebateMaximizer}
                </CardContent>
              </Card>

              <Card className="mt-4 sm:mt-5 shadow-none border-amber-300/30 bg-gradient-to-r from-[#0a2344] via-[#0d294f] to-[#0a2344]">
                <CardContent className="p-3.5 sm:p-4">
                  <div className="flex flex-col gap-3.5">
                    <div className="text-[11px] sm:text-xs leading-relaxed text-slate-200 rounded-lg border border-amber-300/20 bg-[#071c35]/60 px-3 py-2.5">
                      🤖{' '}
                      <span className="text-amber-200 font-semibold">
                        Agent activity — last hour:
                      </span>{' '}
                      Auto-responded to Home Depot order confirmation call · Drafted quote #1047 from email inquiry ·
                      Flagged rebar delivery delay &amp; sourced alternate supplier · Ray Gomez Zone C access alert sent
                      to your phone ·{' '}
                      <button
                        type="button"
                        className="underline text-amber-200 hover:text-amber-100"
                      >
                        See full log ↗
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
