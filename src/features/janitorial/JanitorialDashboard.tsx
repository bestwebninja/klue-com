import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SettingsModal } from './components/SettingsModal';
import type { Area, ResultState, ScopeRow, SettingsState } from './types';

const DEFAULT_SYSTEM_PROMPT = `You are CleanScope AI v5.0 – Production janitorial sales agent for CleanScope AI in the United States. Launching in Seattle with nationwide coverage.

LOCATION-AWARE LOGIC:
- Default fully-loaded labor: $38/hr national.
- Auto-adjust: +20–35% for high-cost markets (Seattle WA, NYC, SF/LA etc.) → suggest $45–$52/hr.
- Flag state-specific notes.

DETAILED PRICING ENGINE (show every step):
1. Labor Hours per Visit = Σ (Sq Ft / Rate) + Fixture Time + Complexity.
2. Labor Cost = Hours × Location-adjusted Labor Rate.
3. Supplies = 7% of Labor (8–10% for medical).
4. Direct Subtotal = Labor + Supplies + Other.
5. Overhead = 18% of Direct Subtotal (includes insurance, vehicles, admin, training, compliance, bad debt).
6. Profit = 22% of (Direct + Overhead).
7. Total Per Visit → Monthly (×21.65) → One-Time (×1.8–2.5).

Always return clean JSON with lineItems array for transparency.`;

const DEFAULT_SETTINGS: SettingsState = {
  laborRate: 38,
  otherDirect: 45,
  suppliesPercent: 7,
  overheadPercent: 18,
  profitPercent: 22,
};

const DEFAULT_AREAS: Area[] = [
  { id: 'a1', name: 'Lobby + Reception', sqft: 1800, ratePerHourSqFt: 1500, fixtureMinutes: 12, complexityMultiplier: 1 },
  { id: 'a2', name: 'Restrooms', sqft: 900, ratePerHourSqFt: 800, fixtureMinutes: 20, complexityMultiplier: 1.1 },
  { id: 'a3', name: 'Open Office', sqft: 6200, ratePerHourSqFt: 2100, fixtureMinutes: 14, complexityMultiplier: 1 },
];

const DEFAULT_SCOPE: ScopeRow[] = [
  { id: 's1', task: 'Trash + liner replacement', frequency: 'Per visit' },
  { id: 's2', task: 'Restroom sanitation + restock', frequency: 'Per visit' },
  { id: 's3', task: 'Dusting + touchpoint disinfection', frequency: '3x weekly' },
  { id: 's4', task: 'Floor machine scrub', frequency: 'Weekly' },
];

type TopTab =
  | 'walkthroughs'
  | 'proposal'
  | 'pipeline'
  | 'clients'
  | 'contracts'
  | 'sales-reports'
  | 'calculator'
  | 'history';

type PipelineStage = 'lead' | 'opportunity' | 'proposal-sent' | 'won' | 'lost';
type BuildingType = 'Medical' | 'Office' | 'Retail' | 'Warehouse' | 'Bank';

type SalesRecord = {
  id: string;
  date: string;
  client: string;
  buildingType: BuildingType;
  sqft: number;
  proposedMonthlyPrice: number;
  actualWonPrice: number;
  marginPercent: number;
  outcome: 'Won' | 'Lost' | 'Open';
  daysInPipeline: number;
  stage: PipelineStage;
  region: 'Seattle' | 'National';
  rep: string;
};

type SalesRepPerformance = {
  name: string;
  wonDeals: number;
  winRate: number;
  revenue: number;
};

type MonthlyRevenuePoint = {
  month: string;
  value: number;
};

type BuildingTypePerformance = {
  type: BuildingType;
  sent: number;
  won: number;
  winRate: number;
};

const currency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const percent = (n: number) => `${n.toFixed(1)}%`;

function generateResult(areas: Area[], scope: ScopeRow[], settings: SettingsState, frequencyPerWeek: number, location = 'Seattle, WA'): ResultState {
  const estimatedAreas = areas.map((area) => {
    const sqftHours = area.sqft / Math.max(area.ratePerHourSqFt, 1);
    const fixtureHours = area.fixtureMinutes / 60;
    const estimatedHoursPerVisit = (sqftHours + fixtureHours) * area.complexityMultiplier;
    return { ...area, estimatedHoursPerVisit };
  });

  const hoursPerVisit = estimatedAreas.reduce((sum, area) => sum + area.estimatedHoursPerVisit, 0);
  const laborCost = hoursPerVisit * settings.laborRate;
  const suppliesAmount = laborCost * (settings.suppliesPercent / 100);
  const directSubtotal = laborCost + suppliesAmount + settings.otherDirect;
  const overheadAmount = directSubtotal * (settings.overheadPercent / 100);
  const profitAmount = (directSubtotal + overheadAmount) * (settings.profitPercent / 100);
  const totalPerVisit = directSubtotal + overheadAmount + profitAmount;
  const visitsPerMonth = frequencyPerWeek * 4.33;
  const monthlyTotal = totalPerVisit * visitsPerMonth;
  const oneTimeTotal = totalPerVisit * 2.1;
  const cleanableSqFt = estimatedAreas.reduce((sum, area) => sum + area.sqft, 0);

  return {
    summary: {
      cleanableSqFt,
      frequencyPerWeek,
      visitsPerMonth,
      monthlyRecurring: monthlyTotal,
      perVisit: totalPerVisit,
      oneTime: oneTimeTotal,
      perSqFtRate: cleanableSqFt > 0 ? monthlyTotal / cleanableSqFt : 0,
      locationNote: `${location} rate guidance applied with transparent labor + burden assumptions.`,
    },
    areas: estimatedAreas,
    scope,
    pricing: {
      laborRate: settings.laborRate,
      hoursPerVisit,
      directSubtotal,
      overheadPercent: settings.overheadPercent,
      overheadAmount,
      profitPercent: settings.profitPercent,
      profitAmount,
      totalPerVisit,
      monthlyTotal,
      oneTimeTotal,
      lineItems: [
        { item: 'Labor', amount: laborCost, note: `${hoursPerVisit.toFixed(2)} hrs × ${currency(settings.laborRate)}/hr` },
        { item: 'Supplies', amount: suppliesAmount, note: `${settings.suppliesPercent}% of labor` },
        { item: 'Other Direct', amount: settings.otherDirect, note: 'Consumables, disposables, transport' },
        { item: 'Overhead', amount: overheadAmount, note: `${settings.overheadPercent}% of direct subtotal` },
        { item: 'Profit', amount: profitAmount, note: `${settings.profitPercent}% of direct + overhead` },
      ],
      historicalComparison: '8.2% above last-year average for similar Seattle office portfolios.',
    },
    internalHandoff: {
      staffingEstimate: `${Math.ceil(hoursPerVisit / 3)} cleaner(s) per visit with swing backup for restroom load.`,
      keyNotes: ['Prioritize touchpoint disinfection before peak occupancy hours.', 'Restroom wing B should be inspected at midpoint.'],
      complianceFlags: ['WA labor poster verification pending', 'Check chemical SDS binder presence on site'],
    },
  };
}

const INITIAL_SALES_DATA: SalesRecord[] = [
  { id: 'sr1', date: '2026-04-10', client: 'Harbor Medical Pavilion', buildingType: 'Medical', sqft: 32000, proposedMonthlyPrice: 28750, actualWonPrice: 28200, marginPercent: 23.1, outcome: 'Won', daysInPipeline: 31, stage: 'won', region: 'Seattle', rep: 'Avery Kim' },
  { id: 'sr2', date: '2026-03-18', client: 'Puget Cardiology Center', buildingType: 'Medical', sqft: 21000, proposedMonthlyPrice: 20100, actualWonPrice: 19850, marginPercent: 22.4, outcome: 'Won', daysInPipeline: 28, stage: 'won', region: 'Seattle', rep: 'Miguel Ortiz' },
  { id: 'sr3', date: '2026-03-27', client: 'Northgate Retail Complex', buildingType: 'Retail', sqft: 28000, proposedMonthlyPrice: 16400, actualWonPrice: 0, marginPercent: 0, outcome: 'Lost', daysInPipeline: 49, stage: 'lost', region: 'Seattle', rep: 'Taylor Chen' },
  { id: 'sr4', date: '2026-02-22', client: 'Emerald Office Tower', buildingType: 'Office', sqft: 46000, proposedMonthlyPrice: 35400, actualWonPrice: 34400, marginPercent: 21.2, outcome: 'Won', daysInPipeline: 40, stage: 'won', region: 'Seattle', rep: 'Avery Kim' },
  { id: 'sr5', date: '2026-01-30', client: 'Cascade Fulfillment Hub', buildingType: 'Warehouse', sqft: 72000, proposedMonthlyPrice: 38800, actualWonPrice: 0, marginPercent: 0, outcome: 'Lost', daysInPipeline: 37, stage: 'lost', region: 'National', rep: 'Miguel Ortiz' },
  { id: 'sr6', date: '2026-04-12', client: 'Rainier Community Bank HQ', buildingType: 'Bank', sqft: 19000, proposedMonthlyPrice: 14300, actualWonPrice: 0, marginPercent: 0, outcome: 'Open', daysInPipeline: 19, stage: 'proposal-sent', region: 'Seattle', rep: 'Taylor Chen' },
  { id: 'sr7', date: '2026-04-11', client: 'Westlake Tech Offices', buildingType: 'Office', sqft: 41000, proposedMonthlyPrice: 30900, actualWonPrice: 0, marginPercent: 0, outcome: 'Open', daysInPipeline: 12, stage: 'opportunity', region: 'Seattle', rep: 'Avery Kim' },
  { id: 'sr8', date: '2026-03-15', client: 'National Retail Partners', buildingType: 'Retail', sqft: 38000, proposedMonthlyPrice: 20800, actualWonPrice: 19600, marginPercent: 18.9, outcome: 'Won', daysInPipeline: 45, stage: 'won', region: 'National', rep: 'Miguel Ortiz' },
  { id: 'sr9', date: '2026-04-14', client: 'Columbia Office Plaza', buildingType: 'Office', sqft: 27000, proposedMonthlyPrice: 18600, actualWonPrice: 0, marginPercent: 0, outcome: 'Open', daysInPipeline: 53, stage: 'opportunity', region: 'National', rep: 'Taylor Chen' },
  { id: 'sr10', date: '2026-04-15', client: 'King County Medical Annex', buildingType: 'Medical', sqft: 24000, proposedMonthlyPrice: 22800, actualWonPrice: 0, marginPercent: 0, outcome: 'Open', daysInPipeline: 6, stage: 'lead', region: 'Seattle', rep: 'Avery Kim' },
];

export default function JanitorialDashboard() {
  const [topTab, setTopTab] = useState<TopTab>('walkthroughs');
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [areas, setAreas] = useState<Area[]>(DEFAULT_AREAS);
  const [scope, setScope] = useState<ScopeRow[]>(DEFAULT_SCOPE);
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(5);
  const [voiceNote, setVoiceNote] = useState('');
  const [typedIntake, setTypedIntake] = useState('Class A office with evening janitorial coverage and monthly floor care requirement.');
  const [assistantPrompt, setAssistantPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(INITIAL_SALES_DATA);
  const [reportFilterOutcome, setReportFilterOutcome] = useState<'All' | 'Won' | 'Lost' | 'Open'>('All');
  const [reportFilterType, setReportFilterType] = useState<'All' | BuildingType>('All');
  const [refreshingReports, setRefreshingReports] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(new Date());

  const result = useMemo(() => generateResult(areas, scope, settings, frequencyPerWeek), [areas, scope, settings, frequencyPerWeek]);

  const updateArea = (id: string, key: keyof Area, value: string) => {
    setAreas((prev) =>
      prev.map((area) => {
        if (area.id !== id) return area;
        if (key === 'name') return { ...area, name: value };
        return { ...area, [key]: Number(value) };
      })
    );
  };

  const updateScope = (id: string, key: keyof ScopeRow, value: string) => {
    setScope((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const markLatestProposalWon = () => {
    const latestOpenProposal = salesRecords.find((row) => row.stage === 'proposal-sent' || row.stage === 'opportunity');
    if (!latestOpenProposal) return;
    setSalesRecords((prev) =>
      prev.map((row) =>
        row.id === latestOpenProposal.id
          ? {
              ...row,
              stage: 'won',
              outcome: 'Won',
              actualWonPrice: Math.round(row.proposedMonthlyPrice * 0.97),
              marginPercent: row.region === 'Seattle' ? 22.1 : 20.2,
            }
          : row
      )
    );
  };

  const reportRows = useMemo(() => {
    let rows = salesRecords;
    if (reportFilterOutcome !== 'All') rows = rows.filter((row) => row.outcome === reportFilterOutcome);
    if (reportFilterType !== 'All') rows = rows.filter((row) => row.buildingType === reportFilterType);
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [salesRecords, reportFilterOutcome, reportFilterType]);

  const totals = useMemo(() => {
    const pipelineRows = salesRecords.filter((row) => ['lead', 'opportunity', 'proposal-sent'].includes(row.stage));
    const wonRows = salesRecords.filter((row) => row.outcome === 'Won');
    const closedRows90d = salesRecords.filter((row) => {
      const diff = Date.now() - new Date(row.date).getTime();
      return diff / (1000 * 60 * 60 * 24) <= 90 && (row.outcome === 'Won' || row.outcome === 'Lost');
    });
    const won90d = closedRows90d.filter((r) => r.outcome === 'Won').length;
    const seattleWon = wonRows.filter((row) => row.region === 'Seattle');
    const nationalWon = wonRows.filter((row) => row.region === 'National');

    return {
      totalPipelineValue: pipelineRows.reduce((sum, row) => sum + row.proposedMonthlyPrice, 0),
      mrrFromWonContracts: wonRows.reduce((sum, row) => sum + row.actualWonPrice, 0),
      winRateLast90Days: closedRows90d.length ? (won90d / closedRows90d.length) * 100 : 0,
      averageDealSize: wonRows.length ? wonRows.reduce((sum, row) => sum + row.actualWonPrice, 0) / wonRows.length : 0,
      proposalsSentCount: salesRecords.filter((row) => row.stage === 'proposal-sent' || row.outcome === 'Won' || row.outcome === 'Lost').length,
      proposalsWonCount: wonRows.length,
      seattleMargin: seattleWon.length ? seattleWon.reduce((sum, row) => sum + row.marginPercent, 0) / seattleWon.length : 0,
      nationalMargin: nationalWon.length ? nationalWon.reduce((sum, row) => sum + row.marginPercent, 0) / nationalWon.length : 0,
      funnel: {
        leads: salesRecords.filter((row) => row.stage === 'lead').length,
        opportunities: salesRecords.filter((row) => row.stage === 'opportunity').length,
        proposalsSent: salesRecords.filter((row) => row.stage === 'proposal-sent').length,
        won: salesRecords.filter((row) => row.stage === 'won').length,
      },
      stalledOpportunities: salesRecords.filter((row) => ['lead', 'opportunity', 'proposal-sent'].includes(row.stage) && row.daysInPipeline > 45).length,
    };
  }, [salesRecords]);

  const monthlyRevenueTrend: MonthlyRevenuePoint[] = useMemo(
    () => [
      { month: 'Nov', value: 71800 },
      { month: 'Dec', value: 75200 },
      { month: 'Jan', value: 78100 },
      { month: 'Feb', value: 81600 },
      { month: 'Mar', value: 84900 },
      { month: 'Apr', value: totals.mrrFromWonContracts },
    ],
    [totals.mrrFromWonContracts]
  );

  const buildingTypePerformance: BuildingTypePerformance[] = useMemo(() => {
    const types: BuildingType[] = ['Medical', 'Office', 'Retail', 'Warehouse', 'Bank'];
    return types.map((type) => {
      const rows = salesRecords.filter((row) => row.buildingType === type && (row.outcome === 'Won' || row.outcome === 'Lost' || row.stage === 'proposal-sent'));
      const won = rows.filter((row) => row.outcome === 'Won').length;
      return {
        type,
        sent: rows.length,
        won,
        winRate: rows.length ? (won / rows.length) * 100 : 0,
      };
    });
  }, [salesRecords]);

  const repPerformance: SalesRepPerformance[] = useMemo(() => {
    return ['Avery Kim', 'Miguel Ortiz', 'Taylor Chen'].map((rep) => {
      const repRows = salesRecords.filter((row) => row.rep === rep);
      const wonRows = repRows.filter((row) => row.outcome === 'Won');
      const closedRows = repRows.filter((row) => row.outcome === 'Won' || row.outcome === 'Lost');
      return {
        name: rep,
        wonDeals: wonRows.length,
        winRate: closedRows.length ? (wonRows.length / closedRows.length) * 100 : 0,
        revenue: wonRows.reduce((sum, row) => sum + row.actualWonPrice, 0),
      };
    });
  }, [salesRecords]);

  const refreshReports = () => {
    setRefreshingReports(true);
    setTimeout(() => {
      setLastRefreshAt(new Date());
      setRefreshingReports(false);
      console.log('CleanScope AI reporting cache refreshed');
    }, 700);
  };

  const exportReportToCsv = () => {
    const header = ['Date', 'Client', 'Building Type', 'Sq Ft', 'Proposed Monthly Price', 'Actual Won Price', 'Margin %', 'Outcome', 'Days in Pipeline'];
    const lines = reportRows.map((row) => [row.date, row.client, row.buildingType, row.sqft, row.proposedMonthlyPrice, row.actualWonPrice, row.marginPercent, row.outcome, row.daysInPipeline]);
    const csv = [header, ...lines].map((line) => line.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'sales-reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderNewProposal = () => (
    <div className="space-y-4">
      <Card className="rounded-3xl">
        <CardHeader><CardTitle className="text-base">Multimodal Job Capture</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={typedIntake} onChange={(e) => setTypedIntake(e.target.value)} className="min-h-24 rounded-2xl" />
          <Textarea value={voiceNote} onChange={(e) => setVoiceNote(e.target.value)} placeholder="Paste or type voice transcript..." className="min-h-24 rounded-2xl" />
        </CardContent>
      </Card>
      <Card className="rounded-3xl">
        <CardHeader><CardTitle className="text-base">Editable Areas + Scope</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {areas.map((area) => (
            <div key={area.id} className="grid gap-2 rounded-2xl border border-border/60 p-3 sm:grid-cols-5">
              <Input value={area.name} onChange={(e) => updateArea(area.id, 'name', e.target.value)} className="sm:col-span-2 rounded-xl" />
              <Input type="number" value={area.sqft} onChange={(e) => updateArea(area.id, 'sqft', e.target.value)} className="rounded-xl" />
              <Input type="number" value={area.fixtureMinutes} onChange={(e) => updateArea(area.id, 'fixtureMinutes', e.target.value)} className="rounded-xl" />
              <Input type="number" step="0.1" value={area.complexityMultiplier} onChange={(e) => updateArea(area.id, 'complexityMultiplier', e.target.value)} className="rounded-xl" />
            </div>
          ))}
          {scope.map((row) => (
            <div key={row.id} className="grid gap-2 rounded-2xl border border-border/60 p-3 sm:grid-cols-2">
              <Input value={row.task} onChange={(e) => updateScope(row.id, 'task', e.target.value)} className="rounded-xl" />
              <Input value={row.frequency} onChange={(e) => updateScope(row.id, 'frequency', e.target.value)} className="rounded-xl" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderPricingCalculator = () => (
    <div className="space-y-4">
      <Card className="rounded-3xl"><CardHeader><CardTitle className="text-base">Quick Quote Calculator</CardTitle></CardHeader><CardContent className="space-y-3"><div className="max-w-xs space-y-1"><Label>Visits / week</Label><Input type="number" value={frequencyPerWeek} onChange={(e) => setFrequencyPerWeek(Number(e.target.value) || 1)} className="rounded-xl" /></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Per Visit</p><p className="text-lg font-semibold">{currency(result.pricing.totalPerVisit)}</p></div><div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Monthly</p><p className="text-lg font-semibold">{currency(result.pricing.monthlyTotal)}</p></div><div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">One-Time</p><p className="text-lg font-semibold">{currency(result.pricing.oneTimeTotal)}</p></div></div></CardContent></Card>
    </div>
  );

  const renderSalesReports = () => {
    const maxFunnel = Math.max(1, totals.funnel.leads, totals.funnel.opportunities, totals.funnel.proposalsSent, totals.funnel.won);

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Sales Reports</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Last refreshed: {lastRefreshAt.toLocaleString()}</p>
            <Button className="rounded-2xl" variant="outline" onClick={refreshReports} disabled={refreshingReports}>
              {refreshingReports ? 'Refreshing…' : 'Refresh Reports'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-sm">Total Pipeline Value</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{currency(totals.totalPipelineValue)}</CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-sm">MRR from Won Contracts</CardTitle></CardHeader><CardContent className="text-2xl font-semibold text-emerald-600">{currency(totals.mrrFromWonContracts)}</CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-sm">Win Rate (last 90 days)</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{percent(totals.winRateLast90Days)}</CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-sm">Average Deal Size</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{currency(totals.averageDealSize)}</CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-sm">Proposals Sent vs Won</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{totals.proposalsSentCount} / {totals.proposalsWonCount}</p><p className="text-xs text-muted-foreground">Conversion: {percent((totals.proposalsWonCount / Math.max(1, totals.proposalsSentCount)) * 100)}</p></CardContent></Card>
          <Card className="rounded-3xl border-emerald-500/30 bg-emerald-500/5"><CardHeader><CardTitle className="text-sm">Seattle vs National Performance</CardTitle></CardHeader><CardContent><p className="font-semibold">Seattle margin: {percent(totals.seattleMargin)}</p><p className="font-semibold">National margin: {percent(totals.nationalMargin)}</p><p className="mt-1 text-xs text-muted-foreground">Seattle labor costs are ~28% higher, but pricing power keeps margins healthy.</p></CardContent></Card>
        </div>

        <Card className="rounded-3xl">
          <CardHeader><CardTitle>Pipeline Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {/* Replace with Recharts/Chart.js funnel when charting library is introduced. */}
            {[
              { label: 'Leads', value: totals.funnel.leads, next: totals.funnel.opportunities },
              { label: 'Opportunities', value: totals.funnel.opportunities, next: totals.funnel.proposalsSent },
              { label: 'Proposals Sent', value: totals.funnel.proposalsSent, next: totals.funnel.won },
              { label: 'Won Contracts', value: totals.funnel.won, next: totals.funnel.won },
            ].map((stage, index) => (
              <div key={stage.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <p>{stage.label}</p>
                  <p className="font-medium">{stage.value} {index < 3 ? `(${percent((stage.next / Math.max(stage.value, 1)) * 100)} to next)` : ''}</p>
                </div>
                <div className="h-4 rounded-full bg-muted">
                  <div className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${(stage.value / maxFunnel) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="rounded-3xl">
            <CardHeader><CardTitle>Monthly Revenue Trend (6 months)</CardTitle></CardHeader>
            <CardContent>
              {/* Replace with a real line chart component (Recharts/Chart.js) in production. */}
              <div className="flex h-44 items-end gap-2">
                {monthlyRevenueTrend.map((point) => {
                  const max = Math.max(...monthlyRevenueTrend.map((p) => p.value));
                  return (
                    <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t-xl bg-blue-500/70" style={{ height: `${(point.value / max) * 100}%` }} />
                      <p className="text-xs text-muted-foreground">{point.month}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader><CardTitle>Win Rate by Building Type</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {/* Replace with real horizontal bar chart with richer interactions later. */}
              {buildingTypePerformance.map((item) => (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm"><p>{item.type}</p><p>{percent(item.winRate)}</p></div>
                  <div className="h-3 rounded-full bg-muted"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${item.winRate}%` }} /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader><CardTitle>Top Performing Sales Reps</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {repPerformance.map((rep) => (
                <div key={rep.name} className="rounded-2xl border border-border/60 p-3">
                  <p className="font-medium">{rep.name}</p>
                  <p className="text-sm text-muted-foreground">Won deals: {rep.wonDeals} · Win rate: {percent(rep.winRate)}</p>
                  <p className="text-sm font-semibold">Revenue won: {currency(rep.revenue)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader><CardTitle>Average Margin % by Region</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[{ region: 'Seattle', margin: totals.seattleMargin }, { region: 'National / Other Markets', margin: totals.nationalMargin }].map((item) => (
                <div key={item.region} className="space-y-1">
                  <div className="flex items-center justify-between"><p className="text-sm">{item.region}</p><p className="text-sm font-semibold">{percent(item.margin)}</p></div>
                  <div className="h-3 rounded-full bg-muted"><div className="h-3 rounded-full bg-blue-600" style={{ width: `${Math.min(item.margin, 100)}%` }} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="rounded-3xl">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Detailed Reports</CardTitle>
                <div className="flex gap-2">
                  <select className="rounded-xl border bg-background px-3 py-2 text-sm" value={reportFilterOutcome} onChange={(e) => setReportFilterOutcome(e.target.value as 'All' | 'Won' | 'Lost' | 'Open')}>
                    <option value="All">All Outcomes</option><option value="Won">Won</option><option value="Lost">Lost</option><option value="Open">Open</option>
                  </select>
                  <select className="rounded-xl border bg-background px-3 py-2 text-sm" value={reportFilterType} onChange={(e) => setReportFilterType(e.target.value as 'All' | BuildingType)}>
                    <option value="All">All Types</option><option value="Medical">Medical</option><option value="Office">Office</option><option value="Retail">Retail</option><option value="Warehouse">Warehouse</option><option value="Bank">Bank</option>
                  </select>
                  <Button onClick={exportReportToCsv} variant="outline" className="rounded-2xl">Export to CSV</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-2xl border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Client</th><th className="px-3 py-2">Building Type</th><th className="px-3 py-2">Sq Ft</th><th className="px-3 py-2">Proposed Monthly Price</th><th className="px-3 py-2">Actual Won Price</th><th className="px-3 py-2">Margin %</th><th className="px-3 py-2">Outcome</th><th className="px-3 py-2">Days in Pipeline</th></tr></thead>
                  <tbody>
                    {reportRows.map((row) => (
                      <tr key={row.id} className="border-t border-border/60"><td className="px-3 py-2">{row.date}</td><td className="px-3 py-2">{row.client}</td><td className="px-3 py-2">{row.buildingType}</td><td className="px-3 py-2">{row.sqft.toLocaleString()}</td><td className="px-3 py-2">{currency(row.proposedMonthlyPrice)}</td><td className="px-3 py-2">{row.actualWonPrice ? currency(row.actualWonPrice) : '—'}</td><td className="px-3 py-2">{row.marginPercent ? percent(row.marginPercent) : '—'}</td><td className="px-3 py-2">{row.outcome}</td><td className="px-3 py-2">{row.daysInPipeline}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-3xl border-blue-500/40 bg-gradient-to-br from-blue-500/10 via-background to-emerald-500/10">
              <CardHeader><CardTitle>CleanScope AI Insights</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Strong performance in medical sector — recommend targeting more healthcare facilities.</p>
                <p>• Seattle deals have 28% higher labor cost — margins still healthy at {percent(totals.seattleMargin)}.</p>
                <p>• {totals.stalledOpportunities} opportunities stalled &gt;45 days — suggest follow-up campaign.</p>
                <p>• Medical win-rate currently {percent(buildingTypePerformance.find((b) => b.type === 'Medical')?.winRate ?? 0)} — roughly 12% above national janitorial benchmark.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    switch (topTab) {
      case 'walkthroughs':
        return <Card className="rounded-3xl"><CardHeader><CardTitle>Janitorial Walkthroughs</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Room-by-room walkthrough notes for operations and QA signoff.</CardContent></Card>;
      case 'proposal':
        return renderNewProposal();
      case 'pipeline':
        return <Card className="rounded-3xl"><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Pipeline</CardTitle><Button className="rounded-2xl" onClick={markLatestProposalWon}>Mark Latest Proposal Won</Button></CardHeader><CardContent className="space-y-2 text-sm">{salesRecords.filter((r) => r.outcome === 'Open').map((row) => <div key={row.id} className="rounded-2xl border border-border/60 p-3"><p className="font-medium">{row.client}</p><p className="text-muted-foreground">{row.buildingType} · {currency(row.proposedMonthlyPrice)} · {row.daysInPipeline} days in pipeline</p></div>)}</CardContent></Card>;
      case 'clients':
        return <Card className="rounded-3xl"><CardHeader><CardTitle>Clients</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Harbor Medical Pavilion, Emerald Office Tower, and Rainier Community Bank are synced from CRM demo data.</CardContent></Card>;
      case 'contracts':
        return <Card className="rounded-3xl"><CardHeader><CardTitle>Active Janitorial Contracts</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">{salesRecords.filter((r) => r.outcome === 'Won').map((row) => <div key={row.id} className="rounded-2xl border border-border/60 p-3"><p className="font-medium">{row.client}</p><p className="text-muted-foreground">MRR: {currency(row.actualWonPrice)} · Margin: {percent(row.marginPercent)}</p></div>)}</CardContent></Card>;
      case 'sales-reports':
        return renderSalesReports();
      case 'calculator':
        return renderPricingCalculator();
      case 'history':
        return <Card className="rounded-3xl"><CardHeader><CardTitle>Historical Janitorial Jobs</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Track prior opportunities, accepted terms, and revision notes with conversion history.</CardContent></Card>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-border/60">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-blue-600 text-white">Janitorial</Badge>
                <Badge variant="outline">CleanScope AI v5.0</Badge>
              </div>
              <CardTitle className="text-2xl">Janitorial Manager CRM Dashboard</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Multimodal capture, transparent pricing, CRM pipeline, and sales intelligence in one workspace.</p>
            </div>
            <div className="flex gap-2">
              <Button className="rounded-2xl" onClick={() => { setAreas(DEFAULT_AREAS); setScope(DEFAULT_SCOPE); }}>Load Example</Button>
              <Button className="rounded-2xl" variant="outline" onClick={() => setSettingsOpen(true)}>Settings</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="flex w-full flex-wrap gap-2 rounded-2xl bg-muted/40 p-1">
            {[
              { key: 'walkthroughs', label: 'Janitorial Walkthroughs' },
              { key: 'proposal', label: 'New Bid / Proposal' },
              { key: 'pipeline', label: 'Pipeline' },
              { key: 'clients', label: 'Clients' },
              { key: 'contracts', label: 'Active Janitorial Contracts' },
              { key: 'sales-reports', label: 'Sales Reports' },
              { key: 'calculator', label: 'Janitorial Pricing Calculator' },
              { key: 'history', label: 'Historical Janitorial Jobs' },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={topTab === tab.key ? 'default' : 'ghost'}
                className="rounded-xl"
                onClick={() => setTopTab(tab.key as TopTab)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="max-h-[70vh] overflow-auto pr-1">{renderMainContent()}</div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader className="pb-3"><CardTitle className="text-base">Quick Settings</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm"><p>Labor Rate: <strong>{currency(settings.laborRate)}</strong></p><p>Other Direct: <strong>{currency(settings.otherDirect)}</strong></p><p>Supplies: <strong>{settings.suppliesPercent}%</strong></p><p>Overhead: <strong>{settings.overheadPercent}%</strong></p><p>Profit: <strong>{settings.profitPercent}%</strong></p><Button className="mt-2 w-full rounded-2xl" variant="outline" onClick={() => setSettingsOpen(true)}>Edit All Settings</Button></CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-sky-800 via-blue-700 to-indigo-700 text-white shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base text-white">Quick Links</CardTitle></CardHeader>
            <CardContent className="pt-0"><div className="flex flex-wrap gap-2">{['AI Assistant Chat', 'Company Branding', 'Labor Rates', 'Recent Jobs', 'Task Library'].map((item) => (<Button key={item} variant="ghost" className="h-9 rounded-xl bg-white/10 px-3 text-sm font-medium text-white hover:bg-white hover:text-blue-700">{item}</Button>))}</div></CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader><CardTitle className="text-base">CleanScope AI v5.0 Assistant</CardTitle></CardHeader>
            <CardContent><Textarea className="min-h-36 rounded-2xl text-xs" value={assistantPrompt} onChange={(e) => setAssistantPrompt(e.target.value)} /></CardContent>
          </Card>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onSave={setSettings} />
    </div>
  );
}
