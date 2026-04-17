import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SettingsModal } from './components/SettingsModal';
import type { Area, ClientInfo, ResultState, SalesRepInfo, ScopeRow, SettingsState, WeatherState } from './types';

const WMO: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Clear sky', emoji: '☀️' }, 1: { label: 'Mainly clear', emoji: '🌤️' },
  2: { label: 'Partly cloudy', emoji: '⛅' }, 3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Foggy', emoji: '🌫️' }, 48: { label: 'Icy fog', emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌦️' }, 53: { label: 'Drizzle', emoji: '🌧️' },
  61: { label: 'Light rain', emoji: '🌧️' }, 63: { label: 'Rain', emoji: '🌧️' }, 65: { label: 'Heavy rain', emoji: '⛈️' },
  71: { label: 'Light snow', emoji: '🌨️' }, 73: { label: 'Snow', emoji: '❄️' },
  80: { label: 'Rain showers', emoji: '🌦️' }, 81: { label: 'Showers', emoji: '🌧️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' }, 99: { label: 'T-storm + hail', emoji: '⛈️' },
};

type SubscriptionTier = 'none' | 'starter' | 'professional' | 'growth';
type BillingCycle = 'monthly' | 'annual';

const TIERS = {
  starter: {
    name: 'Starter', monthly: 89, annual: 79, annualTotal: 948, users: '5 users', popular: false,
    features: ['Core AI bidding engine', 'Up to 5 users', 'Basic proposal builder', 'Pipeline tracking', 'Email quote output', 'CSV export'],
  },
  professional: {
    name: 'Professional', monthly: 169, annual: 149, annualTotal: 1788, users: '20 users', popular: true,
    features: ['Everything in Starter', 'Full CRM & pipeline', 'AI Sales Reports', 'Weather + Traffic intel', 'Dual email system', 'Client + Rep branding', 'Win probability scores'],
  },
  growth: {
    name: 'Growth', monthly: 279, annual: 249, annualTotal: 2988, users: 'Unlimited users', popular: false,
    features: ['Everything in Professional', 'Priority support (4hr SLA)', 'Advanced CRM sync', 'Custom branding', 'API access', 'Dedicated account manager'],
  },
} as const;

type TopTab = 'walkthroughs' | 'proposal' | 'pipeline' | 'clients' | 'contracts' | 'sales-reports' | 'calculator' | 'history' | 'subscription';
type PipelineStage = 'lead' | 'opportunity' | 'proposal-sent' | 'won' | 'lost';
type BuildingType = 'Medical' | 'Office' | 'Retail' | 'Warehouse' | 'Bank';

type SalesRecord = {
  id: string; date: string; client: string; buildingType: BuildingType;
  sqft: number; proposedMonthlyPrice: number; actualWonPrice: number;
  marginPercent: number; outcome: 'Won' | 'Lost' | 'Open';
  daysInPipeline: number; stage: PipelineStage; region: 'Seattle' | 'National'; rep: string;
};

const currency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const percent = (n: number) => `${n.toFixed(1)}%`;

function getTrafficEstimate() {
  const h = new Date().getHours();
  if ((h >= 7 && h <= 9) || (h >= 16 && h <= 18))
    return { level: 'heavy', label: 'Heavy Traffic', delay: '25–40 min extra', note: 'Peak rush hour — plan site visit outside these hours' };
  if ((h >= 6 && h < 7) || (h >= 9 && h < 10) || (h >= 15 && h < 16) || (h >= 18 && h < 20))
    return { level: 'moderate', label: 'Moderate Traffic', delay: '10–20 min extra', note: 'Near peak hours — allow extra buffer for site visit' };
  return { level: 'low', label: 'Light Traffic', delay: '< 5 min extra', note: 'Good window to schedule site walkthrough' };
}

function calcWinProbability(type: BuildingType | '', sqft: number): number {
  const base: Record<string, number> = { Medical: 72, Office: 65, Retail: 52, Warehouse: 45, Bank: 60, '': 55 };
  let s = base[type] ?? 55;
  if (sqft > 40000) s -= 3;
  if (sqft < 15000) s += 4;
  return Math.min(95, Math.max(20, s));
}

function generateCustomerId() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `CUST-${d}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function generateInvoiceNumber() {
  const d = new Date().toISOString().slice(0, 7).replace(/-/g, '');
  return `INV-${d}-${Math.floor(100 + Math.random() * 900)}`;
}

const DEFAULT_SYSTEM_PROMPT = `You are CleanScope AI v5.0 – Production janitorial sales agent. Seattle launch, nationwide coverage.
Labor: $38/hr national. +20–35% high-cost markets (Seattle, NYC, SF). Show every pricing step. Return clean JSON.`;

const DEFAULT_SETTINGS: SettingsState = { laborRate: 38, otherDirect: 45, suppliesPercent: 7, overheadPercent: 18, profitPercent: 22 };

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

function generateResult(areas: Area[], scope: ScopeRow[], settings: SettingsState, freqPerWeek: number, location = 'Seattle, WA'): ResultState {
  const est = areas.map(a => ({ ...a, estimatedHoursPerVisit: (a.sqft / Math.max(a.ratePerHourSqFt, 1) + a.fixtureMinutes / 60) * a.complexityMultiplier }));
  const hrs = est.reduce((s, a) => s + a.estimatedHoursPerVisit, 0);
  const labor = hrs * settings.laborRate;
  const supplies = labor * (settings.suppliesPercent / 100);
  const direct = labor + supplies + settings.otherDirect;
  const overhead = direct * (settings.overheadPercent / 100);
  const profit = (direct + overhead) * (settings.profitPercent / 100);
  const perVisit = direct + overhead + profit;
  const monthly = perVisit * freqPerWeek * 4.33;
  const sqft = est.reduce((s, a) => s + a.sqft, 0);
  return {
    summary: { cleanableSqFt: sqft, frequencyPerWeek: freqPerWeek, visitsPerMonth: freqPerWeek * 4.33, monthlyRecurring: monthly, perVisit, oneTime: perVisit * 2.1, perSqFtRate: sqft > 0 ? monthly / sqft : 0, locationNote: `${location} rate guidance applied.` },
    areas: est, scope,
    pricing: {
      laborRate: settings.laborRate, hoursPerVisit: hrs, directSubtotal: direct,
      overheadPercent: settings.overheadPercent, overheadAmount: overhead,
      profitPercent: settings.profitPercent, profitAmount: profit,
      totalPerVisit: perVisit, monthlyTotal: monthly, oneTimeTotal: perVisit * 2.1,
      lineItems: [
        { item: 'Labor', amount: labor, note: `${hrs.toFixed(2)} hrs × ${currency(settings.laborRate)}/hr` },
        { item: 'Supplies', amount: supplies, note: `${settings.suppliesPercent}% of labor` },
        { item: 'Other Direct', amount: settings.otherDirect, note: 'Consumables, transport' },
        { item: 'Overhead', amount: overhead, note: `${settings.overheadPercent}% of direct` },
        { item: 'Profit', amount: profit, note: `${settings.profitPercent}% of direct + overhead` },
      ],
      historicalComparison: '8.2% above last-year average for similar Seattle office portfolios.',
    },
    internalHandoff: {
      staffingEstimate: `${Math.ceil(hrs / 3)} cleaner(s) per visit with swing backup for restroom load.`,
      keyNotes: ['Prioritize touchpoint disinfection before peak occupancy.', 'Restroom wing B should be inspected at midpoint.'],
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
  // ── core quote state ──
  const [topTab, setTopTab] = useState<TopTab>('walkthroughs');
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [areas, setAreas] = useState<Area[]>(DEFAULT_AREAS);
  const [scope, setScope] = useState<ScopeRow[]>(DEFAULT_SCOPE);
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(5);
  const [typedIntake, setTypedIntake] = useState('Class A office with evening janitorial coverage and monthly floor care requirement.');
  const [voiceNote, setVoiceNote] = useState('');
  const [assistantPrompt, setAssistantPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ── client + rep info ──
  const [clientInfo, setClientInfo] = useState<ClientInfo>({ firstName: '', lastName: '', company: '', email: '' });
  const [salesRepInfo, setSalesRepInfo] = useState<SalesRepInfo>({ firstName: '', lastName: '', cell: '', email: '', company: '' });

  // ── site intelligence ──
  const [siteAddress, setSiteAddress] = useState('');
  const [weather, setWeather] = useState<WeatherState>({ loading: false, error: null, temp: null, feelsLike: null, condition: '', emoji: '🌡️', humidity: null, windSpeed: null, city: '' });

  // ── quote email modal ──
  const [quoteEmailOpen, setQuoteEmailOpen] = useState(false);
  const [emailTab, setEmailTab] = useState<'client' | 'internal'>('client');
  const [copied, setCopied] = useState(false);

  // ── sales pipeline ──
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(INITIAL_SALES_DATA);
  const [reportFilterOutcome, setReportFilterOutcome] = useState<'All' | 'Won' | 'Lost' | 'Open'>('All');
  const [reportFilterType, setReportFilterType] = useState<'All' | BuildingType>('All');
  const [refreshingReports, setRefreshingReports] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(new Date());

  // ── subscription / billing ──
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('none');
  const [checkoutTier, setCheckoutTier] = useState<SubscriptionTier | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // ── stripe admin (settings modal) ──
  const [stripePubKey, setStripePubKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripeConnected, setStripeConnected] = useState(false);

  // ── computed ──
  const result = useMemo(() => generateResult(areas, scope, settings, frequencyPerWeek), [areas, scope, settings, frequencyPerWeek]);

  const reportRows = useMemo(() => {
    let rows = salesRecords;
    if (reportFilterOutcome !== 'All') rows = rows.filter(r => r.outcome === reportFilterOutcome);
    if (reportFilterType !== 'All') rows = rows.filter(r => r.buildingType === reportFilterType);
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [salesRecords, reportFilterOutcome, reportFilterType]);

  const totals = useMemo(() => {
    const pipe = salesRecords.filter(r => ['lead', 'opportunity', 'proposal-sent'].includes(r.stage));
    const won = salesRecords.filter(r => r.outcome === 'Won');
    const closed90 = salesRecords.filter(r => (Date.now() - new Date(r.date).getTime()) / 86400000 <= 90 && (r.outcome === 'Won' || r.outcome === 'Lost'));
    const won90 = closed90.filter(r => r.outcome === 'Won').length;
    const seaWon = won.filter(r => r.region === 'Seattle');
    const natWon = won.filter(r => r.region === 'National');
    return {
      totalPipelineValue: pipe.reduce((s, r) => s + r.proposedMonthlyPrice, 0),
      mrrFromWonContracts: won.reduce((s, r) => s + r.actualWonPrice, 0),
      winRateLast90Days: closed90.length ? (won90 / closed90.length) * 100 : 0,
      averageDealSize: won.length ? won.reduce((s, r) => s + r.actualWonPrice, 0) / won.length : 0,
      proposalsSentCount: salesRecords.filter(r => r.stage === 'proposal-sent' || r.outcome === 'Won' || r.outcome === 'Lost').length,
      proposalsWonCount: won.length,
      seattleMargin: seaWon.length ? seaWon.reduce((s, r) => s + r.marginPercent, 0) / seaWon.length : 0,
      nationalMargin: natWon.length ? natWon.reduce((s, r) => s + r.marginPercent, 0) / natWon.length : 0,
      funnel: {
        leads: salesRecords.filter(r => r.stage === 'lead').length,
        opportunities: salesRecords.filter(r => r.stage === 'opportunity').length,
        proposalsSent: salesRecords.filter(r => r.stage === 'proposal-sent').length,
        won: salesRecords.filter(r => r.stage === 'won').length,
      },
      stalledOpportunities: salesRecords.filter(r => ['lead', 'opportunity', 'proposal-sent'].includes(r.stage) && r.daysInPipeline > 45).length,
    };
  }, [salesRecords]);

  const monthlyRevenueTrend = useMemo(() => [
    { month: 'Nov', value: 71800 }, { month: 'Dec', value: 75200 }, { month: 'Jan', value: 78100 },
    { month: 'Feb', value: 81600 }, { month: 'Mar', value: 84900 }, { month: 'Apr', value: totals.mrrFromWonContracts },
  ], [totals.mrrFromWonContracts]);

  const buildingTypePerformance = useMemo(() => {
    return (['Medical', 'Office', 'Retail', 'Warehouse', 'Bank'] as BuildingType[]).map(type => {
      const rows = salesRecords.filter(r => r.buildingType === type && (r.outcome === 'Won' || r.outcome === 'Lost' || r.stage === 'proposal-sent'));
      const w = rows.filter(r => r.outcome === 'Won').length;
      return { type, sent: rows.length, won: w, winRate: rows.length ? (w / rows.length) * 100 : 0 };
    });
  }, [salesRecords]);

  const repPerformance = useMemo(() => ['Avery Kim', 'Miguel Ortiz', 'Taylor Chen'].map(rep => {
    const rr = salesRecords.filter(r => r.rep === rep);
    const wr = rr.filter(r => r.outcome === 'Won');
    const cr = rr.filter(r => r.outcome === 'Won' || r.outcome === 'Lost');
    return { name: rep, wonDeals: wr.length, winRate: cr.length ? (wr.length / cr.length) * 100 : 0, revenue: wr.reduce((s, r) => s + r.actualWonPrice, 0) };
  }), [salesRecords]);

  // ── handlers ──
  const updateArea = (id: string, key: keyof Area, value: string) =>
    setAreas(prev => prev.map(a => a.id !== id ? a : key === 'name' ? { ...a, name: value } : { ...a, [key]: Number(value) }));

  const updateScope = (id: string, key: keyof ScopeRow, value: string) =>
    setScope(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r));

  const markLatestProposalWon = () => {
    const target = salesRecords.find(r => r.stage === 'proposal-sent' || r.stage === 'opportunity');
    if (!target) return;
    setSalesRecords(prev => prev.map(r => r.id !== target.id ? r : { ...r, stage: 'won', outcome: 'Won', actualWonPrice: Math.round(r.proposedMonthlyPrice * 0.97), marginPercent: r.region === 'Seattle' ? 22.1 : 20.2 }));
  };

  const refreshReports = () => {
    setRefreshingReports(true);
    setTimeout(() => { setLastRefreshAt(new Date()); setRefreshingReports(false); }, 700);
  };

  const exportReportToCsv = () => {
    const header = ['Date', 'Client', 'Building Type', 'Sq Ft', 'Proposed', 'Won Price', 'Margin %', 'Outcome', 'Days'];
    const lines = reportRows.map(r => [r.date, r.client, r.buildingType, r.sqft, r.proposedMonthlyPrice, r.actualWonPrice, r.marginPercent, r.outcome, r.daysInPipeline]);
    const csv = [header, ...lines].map(l => l.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.setAttribute('download', 'sales-reports.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const completePayment = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      const cid = generateCustomerId();
      const inv = generateInvoiceNumber();
      setCustomerId(cid); setInvoiceNumber(inv);
      setCurrentTier(checkoutTier!);
      setPaymentProcessing(false); setCheckoutOpen(false);
      setCardNumber(''); setCardExpiry(''); setCardCvc('');
      setInvoiceOpen(true);
    }, 1500);
  };

  // ── weather fetch (Open-Meteo — no API key required) ──
  const fetchWeather = useCallback(async (address: string) => {
    if (!address.trim()) return;
    setWeather(w => ({ ...w, loading: true, error: null }));
    try {
      const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(address)}&count=1&language=en&format=json`);
      const geoData = await geo.json();
      if (!geoData.results?.length) { setWeather(w => ({ ...w, loading: false, error: 'Location not found. Try a city name.' })); return; }
      const { latitude, longitude, name, country_code } = geoData.results[0];
      const wx = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`);
      const wxData = await wx.json();
      const c = wxData.current;
      const wmo = WMO[c.weather_code] ?? { label: 'Unknown', emoji: '🌡️' };
      setWeather({ loading: false, error: null, temp: Math.round(c.temperature_2m), feelsLike: Math.round(c.apparent_temperature), condition: wmo.label, emoji: wmo.emoji, humidity: c.relative_humidity_2m, windSpeed: Math.round(c.wind_speed_10m), city: `${name}, ${(country_code ?? '').toUpperCase()}` });
    } catch {
      setWeather(w => ({ ...w, loading: false, error: 'Weather fetch failed. Check your connection.' }));
    }
  }, []);

  // ── email builders ──
  const buildClientEmail = () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const clientName = `${clientInfo.firstName} ${clientInfo.lastName}`.trim() || 'Valued Client';
    const repName = `${salesRepInfo.firstName} ${salesRepInfo.lastName}`.trim() || 'Our Team';
    const repCo = salesRepInfo.company || 'CleanScope AI';
    const subject = `Your Commercial Cleaning Proposal — ${clientInfo.company || clientName} — ${today}`;
    const body = `Dear ${clientName},\n\nThank you for the opportunity to present our commercial janitorial services proposal for ${siteAddress || 'your facility'}.\n\n` +
      `━━━ SCOPE OF SERVICES ━━━\n${scope.map(r => `• ${r.task} — ${r.frequency}`).join('\n')}\n\n` +
      `━━━ SERVICE AREAS ━━━\n${areas.map(a => `• ${a.name}: ${a.sqft.toLocaleString()} sq ft`).join('\n')}\n` +
      `Total Cleanable Area: ${result.summary.cleanableSqFt.toLocaleString()} sq ft\n\n` +
      `━━━ INVESTMENT SUMMARY ━━━\nMonthly Recurring:  ${currency(result.pricing.monthlyTotal)}/month\nFrequency:          ${frequencyPerWeek}x per week\nPer Visit Rate:     ${currency(result.pricing.totalPerVisit)}\nOne-Time Deep Clean: ${currency(result.pricing.oneTimeTotal)}\n\n` +
      `━━━ WHY ${repCo.toUpperCase()} ━━━\n• Fully bonded and insured\n• State-compliant with all labor requirements\n• Dedicated account manager on every account\n• 100% quality inspection guarantee per visit\n• Transparent, itemised pricing — no hidden fees\n\n` +
      `This proposal is valid for 30 days.\n\nWarm regards,\n${repName}\n${salesRepInfo.cell || ''}\n${salesRepInfo.email || ''}\n${repCo}`;
    return { subject, body, to: clientInfo.email };
  };

  const buildInternalEmail = () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const traffic = getTrafficEstimate();
    const wx = weather.temp !== null ? `${weather.emoji} ${weather.condition}, ${weather.temp}°F (feels ${weather.feelsLike}°F) — Humidity ${weather.humidity}% — Wind ${weather.windSpeed} mph` : 'Not fetched — enter site address';
    const subject = `[INTERNAL] Quote Approved — ${clientInfo.company || clientInfo.firstName} — ${currency(result.pricing.monthlyTotal)}/mo`;
    const body = `━━━ QUOTE APPROVED — INTERNAL COPY ━━━\nDate: ${today}\n\nSALES REP\nName:    ${salesRepInfo.firstName} ${salesRepInfo.lastName}\nCell:    ${salesRepInfo.cell || '—'}\nEmail:   ${salesRepInfo.email || '—'}\nCompany: ${salesRepInfo.company || '—'}\n\nCLIENT\nName:    ${clientInfo.firstName} ${clientInfo.lastName}\nCompany: ${clientInfo.company || '—'}\nEmail:   ${clientInfo.email || '—'}\nSite:    ${siteAddress || '—'}\n\n` +
      `━━━ PRICING BREAKDOWN ━━━\n${result.pricing.lineItems.map(i => `${i.item.padEnd(18)} ${currency(i.amount).padStart(10)}  ${i.note ?? ''}`).join('\n')}\n${'─'.repeat(48)}\nTotal Per Visit:      ${currency(result.pricing.totalPerVisit)}\nMonthly Total:        ${currency(result.pricing.monthlyTotal)}\nGross Margin Target:  ${percent(result.pricing.profitPercent)}\n\n` +
      `━━━ SITE INTELLIGENCE ━━━\nWeather:  ${wx}\nTraffic:  ${traffic.label} — ${traffic.delay} — ${traffic.note}\n\n` +
      `━━━ STAFFING ESTIMATE ━━━\n${result.internalHandoff.staffingEstimate}\n\n` +
      `━━━ COMPLIANCE FLAGS ━━━\n${result.internalHandoff.complianceFlags.map(f => `⚠ ${f}`).join('\n')}`;
    return { subject, body, to: salesRepInfo.email || 'marcus@kluje.com' };
  };

  // ── render: new proposal ──
  const renderNewProposal = () => {
    const traffic = getTrafficEstimate();
    const sqft = areas.reduce((s, a) => s + a.sqft, 0);
    const winProb = calcWinProbability('Office', sqft);
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-3xl">
            <CardHeader><CardTitle className="text-base">Client Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Label>First Name</Label><Input value={clientInfo.firstName} onChange={e => setClientInfo(p => ({ ...p, firstName: e.target.value }))} className="rounded-xl" placeholder="Jane" /></div>
                <div className="space-y-1"><Label>Last Name</Label><Input value={clientInfo.lastName} onChange={e => setClientInfo(p => ({ ...p, lastName: e.target.value }))} className="rounded-xl" placeholder="Smith" /></div>
              </div>
              <div className="space-y-1"><Label>Company Name</Label><Input value={clientInfo.company} onChange={e => setClientInfo(p => ({ ...p, company: e.target.value }))} className="rounded-xl" placeholder="Acme Corp" /></div>
              <div className="space-y-1"><Label>Client Email</Label><Input type="email" value={clientInfo.email} onChange={e => setClientInfo(p => ({ ...p, email: e.target.value }))} className="rounded-xl" placeholder="jane@acmecorp.com" /></div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardHeader><CardTitle className="text-base">Sales Rep Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Label>First Name</Label><Input value={salesRepInfo.firstName} onChange={e => setSalesRepInfo(p => ({ ...p, firstName: e.target.value }))} className="rounded-xl" placeholder="Marcus" /></div>
                <div className="space-y-1"><Label>Last Name</Label><Input value={salesRepInfo.lastName} onChange={e => setSalesRepInfo(p => ({ ...p, lastName: e.target.value }))} className="rounded-xl" placeholder="Mommsen" /></div>
              </div>
              <div className="space-y-1"><Label>Cell Phone</Label><Input value={salesRepInfo.cell} onChange={e => setSalesRepInfo(p => ({ ...p, cell: e.target.value }))} className="rounded-xl" placeholder="+1 (206) 555-0100" /></div>
              <div className="space-y-1"><Label>Rep Email</Label><Input type="email" value={salesRepInfo.email} onChange={e => setSalesRepInfo(p => ({ ...p, email: e.target.value }))} className="rounded-xl" placeholder="marcus@kluje.com" /></div>
              <div className="space-y-1"><Label>Company Name</Label><Input value={salesRepInfo.company} onChange={e => setSalesRepInfo(p => ({ ...p, company: e.target.value }))} className="rounded-xl" placeholder="CleanScope AI" /></div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl">
          <CardHeader><CardTitle className="text-base">Site Address + Weather Intelligence</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={siteAddress} onChange={e => setSiteAddress(e.target.value)} className="rounded-xl flex-1" placeholder="1309 Coffeen Avenue, Sheridan WY" onKeyDown={e => e.key === 'Enter' && fetchWeather(siteAddress)} />
              <Button className="rounded-xl" onClick={() => fetchWeather(siteAddress)} disabled={weather.loading}>{weather.loading ? 'Fetching…' : 'Get Weather'}</Button>
            </div>
            {weather.error && <p className="text-sm text-rose-500">{weather.error}</p>}
            {weather.temp !== null && (
              <div className="grid gap-3 rounded-2xl bg-muted/40 p-3 sm:grid-cols-4">
                <div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium text-sm">{weather.city}</p></div>
                <div><p className="text-xs text-muted-foreground">Conditions</p><p className="font-medium text-sm">{weather.emoji} {weather.condition}</p></div>
                <div><p className="text-xs text-muted-foreground">Temperature</p><p className="font-medium text-sm">{weather.temp}°F (feels {weather.feelsLike}°F)</p></div>
                <div><p className="text-xs text-muted-foreground">Humidity / Wind</p><p className="font-medium text-sm">{weather.humidity}% / {weather.windSpeed} mph</p></div>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-2xl bg-muted/40 p-3">
              <span className={traffic.level === 'heavy' ? 'text-rose-500' : traffic.level === 'moderate' ? 'text-amber-500' : 'text-emerald-500'}>●</span>
              <span className="text-sm font-medium">{traffic.label}</span>
              <span className="text-sm text-muted-foreground">— {traffic.delay} — {traffic.note}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader><CardTitle className="text-base">Multimodal Job Capture</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={typedIntake} onChange={e => setTypedIntake(e.target.value)} className="min-h-20 rounded-2xl" />
            <Textarea value={voiceNote} onChange={e => setVoiceNote(e.target.value)} placeholder="Paste or type voice transcript…" className="min-h-20 rounded-2xl" />
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader><CardTitle className="text-base">Editable Areas + Scope</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {areas.map(area => (
              <div key={area.id} className="grid gap-2 rounded-2xl border border-border/60 p-3 sm:grid-cols-5">
                <Input value={area.name} onChange={e => updateArea(area.id, 'name', e.target.value)} className="sm:col-span-2 rounded-xl" />
                <Input type="number" value={area.sqft} onChange={e => updateArea(area.id, 'sqft', e.target.value)} className="rounded-xl" />
                <Input type="number" value={area.fixtureMinutes} onChange={e => updateArea(area.id, 'fixtureMinutes', e.target.value)} className="rounded-xl" />
                <Input type="number" step="0.1" value={area.complexityMultiplier} onChange={e => updateArea(area.id, 'complexityMultiplier', e.target.value)} className="rounded-xl" />
              </div>
            ))}
            {scope.map(row => (
              <div key={row.id} className="grid gap-2 rounded-2xl border border-border/60 p-3 sm:grid-cols-2">
                <Input value={row.task} onChange={e => updateScope(row.id, 'task', e.target.value)} className="rounded-xl" />
                <Input value={row.frequency} onChange={e => updateScope(row.id, 'frequency', e.target.value)} className="rounded-xl" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-emerald-500/40 bg-emerald-500/5">
          <CardHeader><CardTitle className="text-base">Quote Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Per Visit</p><p className="text-xl font-bold">{currency(result.pricing.totalPerVisit)}</p></div>
              <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Monthly</p><p className="text-xl font-bold">{currency(result.pricing.monthlyTotal)}</p></div>
              <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">One-Time Setup</p><p className="text-xl font-bold">{currency(result.pricing.oneTimeTotal)}</p></div>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-3">
              <span className="text-sm">Win Probability</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-muted"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${winProb}%` }} /></div>
                <span className="text-sm font-bold text-emerald-600">{winProb}%</span>
              </div>
            </div>
            <Button className="w-full rounded-2xl" onClick={approveQuote}>
              Approve Quote &amp; Preview Emails →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const approveQuote = () => {
    const id = `sr${Date.now()}`;
    const clientName = `${clientInfo.company || clientInfo.firstName + ' ' + clientInfo.lastName}`.trim() || 'New Client';
    setSalesRecords(prev => [{
      id, date: new Date().toISOString().slice(0, 10), client: clientName,
      buildingType: 'Office', sqft: result.summary.cleanableSqFt,
      proposedMonthlyPrice: Math.round(result.pricing.monthlyTotal),
      actualWonPrice: 0, marginPercent: 0, outcome: 'Open',
      daysInPipeline: 0, stage: 'proposal-sent', region: 'Seattle',
      rep: `${salesRepInfo.firstName} ${salesRepInfo.lastName}`.trim() || 'Sales Rep',
    }, ...prev]);
    setQuoteEmailOpen(true);
  };

  // ── render: quote email modal ──
  const renderQuoteEmailModal = () => {
    const client = buildClientEmail();
    const internal = buildInternalEmail();
    const active = emailTab === 'client' ? client : internal;
    return (
      <Dialog open={quoteEmailOpen} onOpenChange={setQuoteEmailOpen}>
        <DialogContent className="rounded-3xl sm:max-w-2xl">
          <DialogHeader><DialogTitle>Quote Emails — Ready to Send</DialogTitle></DialogHeader>
          <div className="flex gap-2 rounded-2xl bg-muted/40 p-1">
            <Button variant={emailTab === 'client' ? 'default' : 'ghost'} className="rounded-xl flex-1" onClick={() => setEmailTab('client')}>Client Email</Button>
            <Button variant={emailTab === 'internal' ? 'default' : 'ghost'} className="rounded-xl flex-1" onClick={() => setEmailTab('internal')}>Internal Copy</Button>
          </div>
          <div className="space-y-2">
            <div className="rounded-2xl bg-muted/40 px-3 py-2 text-sm"><span className="text-muted-foreground">To: </span>{active.to || '(no email entered)'} &nbsp;|&nbsp; <span className="text-muted-foreground">Subj: </span>{active.subject}</div>
            <Textarea readOnly value={active.body} className="min-h-48 rounded-2xl font-mono text-xs" />
          </div>
          <DialogFooter className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => copyToClipboard(active.body)}>{copied ? 'Copied!' : 'Copy Body'}</Button>
            <Button variant="outline" className="rounded-2xl" onClick={() => window.open(`mailto:${active.to}?subject=${encodeURIComponent(active.subject)}&body=${encodeURIComponent(active.body.slice(0, 1800))}`)}>Open in Email App</Button>
            <Button className="rounded-2xl" onClick={() => setQuoteEmailOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ── render: sales reports ──
  const renderSalesReports = () => {
    const maxF = Math.max(1, totals.funnel.leads, totals.funnel.opportunities, totals.funnel.proposalsSent, totals.funnel.won);
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Sales Reports</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Refreshed: {lastRefreshAt.toLocaleTimeString()}</p>
            <Button className="rounded-2xl" variant="outline" onClick={refreshReports} disabled={refreshingReports}>{refreshingReports ? 'Refreshing…' : 'Refresh'}</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-sm">Total Pipeline Value</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{currency(totals.totalPipelineValue)}</CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-sm">MRR from Won Contracts</CardTitle></CardHeader><CardContent className="text-2xl font-semibold text-emerald-600">{currency(totals.mrrFromWonContracts)}</CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-sm">Win Rate (last 90 days)</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{percent(totals.winRateLast90Days)}</CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-sm">Average Deal Size</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{currency(totals.averageDealSize)}</CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-sm">Proposals Sent / Won</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{totals.proposalsSentCount} / {totals.proposalsWonCount}</p><p className="text-xs text-muted-foreground">Conversion: {percent((totals.proposalsWonCount / Math.max(1, totals.proposalsSentCount)) * 100)}</p></CardContent></Card>
          <Card className="rounded-3xl border-emerald-500/30 bg-emerald-500/5"><CardHeader><CardTitle className="text-sm">Seattle vs National Margin</CardTitle></CardHeader><CardContent><p className="font-semibold">Seattle: {percent(totals.seattleMargin)}</p><p className="font-semibold">National: {percent(totals.nationalMargin)}</p></CardContent></Card>
        </div>
        <Card className="rounded-3xl"><CardHeader><CardTitle>Pipeline Funnel</CardTitle></CardHeader><CardContent className="space-y-3">
          {[{ label: 'Leads', value: totals.funnel.leads, next: totals.funnel.opportunities }, { label: 'Opportunities', value: totals.funnel.opportunities, next: totals.funnel.proposalsSent }, { label: 'Proposals Sent', value: totals.funnel.proposalsSent, next: totals.funnel.won }, { label: 'Won', value: totals.funnel.won, next: totals.funnel.won }].map((s, i) => (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm"><p>{s.label}</p><p className="font-medium">{s.value}{i < 3 ? ` (${percent((s.next / Math.max(s.value, 1)) * 100)} to next)` : ''}</p></div>
              <div className="h-4 rounded-full bg-muted"><div className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${(s.value / maxF) * 100}%` }} /></div>
            </div>
          ))}
        </CardContent></Card>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="rounded-3xl"><CardHeader><CardTitle>Monthly Revenue Trend</CardTitle></CardHeader><CardContent>
            <div className="flex h-44 items-end gap-2">{monthlyRevenueTrend.map(p => { const max = Math.max(...monthlyRevenueTrend.map(x => x.value)); return (<div key={p.month} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t-xl bg-blue-500/70" style={{ height: `${(p.value / max) * 100}%` }} /><p className="text-xs text-muted-foreground">{p.month}</p></div>); })}</div>
          </CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle>Win Rate by Building Type</CardTitle></CardHeader><CardContent className="space-y-3">
            {buildingTypePerformance.map(b => (<div key={b.type} className="space-y-1"><div className="flex justify-between text-sm"><p>{b.type}</p><p>{percent(b.winRate)}</p></div><div className="h-3 rounded-full bg-muted"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${b.winRate}%` }} /></div></div>))}
          </CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle>Top Sales Reps</CardTitle></CardHeader><CardContent className="space-y-3">
            {repPerformance.map(r => (<div key={r.name} className="rounded-2xl border border-border/60 p-3"><p className="font-medium">{r.name}</p><p className="text-sm text-muted-foreground">Won: {r.wonDeals} · Win rate: {percent(r.winRate)}</p><p className="text-sm font-semibold">Revenue: {currency(r.revenue)}</p></div>))}
          </CardContent></Card>
          <Card className="rounded-3xl border-blue-500/40 bg-gradient-to-br from-blue-500/10 via-background to-emerald-500/10"><CardHeader><CardTitle>CleanScope AI Insights</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            <p>• Strong medical sector performance — target more healthcare facilities.</p>
            <p>• Seattle margins healthy at {percent(totals.seattleMargin)} despite +28% labor cost.</p>
            <p>• {totals.stalledOpportunities} opportunities stalled &gt;45 days — run follow-up campaign.</p>
            <p>• Medical win-rate {percent(buildingTypePerformance.find(b => b.type === 'Medical')?.winRate ?? 0)} — 12% above national benchmark.</p>
          </CardContent></Card>
        </div>
        <Card className="rounded-3xl"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Detailed Reports</CardTitle>
          <div className="flex gap-2">
            <select className="rounded-xl border bg-background px-3 py-2 text-sm" value={reportFilterOutcome} onChange={e => setReportFilterOutcome(e.target.value as 'All' | 'Won' | 'Lost' | 'Open')}><option value="All">All Outcomes</option><option value="Won">Won</option><option value="Lost">Lost</option><option value="Open">Open</option></select>
            <select className="rounded-xl border bg-background px-3 py-2 text-sm" value={reportFilterType} onChange={e => setReportFilterType(e.target.value as 'All' | BuildingType)}><option value="All">All Types</option><option value="Medical">Medical</option><option value="Office">Office</option><option value="Retail">Retail</option><option value="Warehouse">Warehouse</option><option value="Bank">Bank</option></select>
            <Button onClick={exportReportToCsv} variant="outline" className="rounded-2xl">Export CSV</Button>
          </div>
        </div></CardHeader><CardContent>
          <div className="overflow-x-auto rounded-2xl border border-border/60"><table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Client</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Sq Ft</th><th className="px-3 py-2">Proposed</th><th className="px-3 py-2">Won Price</th><th className="px-3 py-2">Margin</th><th className="px-3 py-2">Outcome</th><th className="px-3 py-2">Days</th></tr></thead>
            <tbody>{reportRows.map(r => (<tr key={r.id} className="border-t border-border/60"><td className="px-3 py-2">{r.date}</td><td className="px-3 py-2">{r.client}</td><td className="px-3 py-2">{r.buildingType}</td><td className="px-3 py-2">{r.sqft.toLocaleString()}</td><td className="px-3 py-2">{currency(r.proposedMonthlyPrice)}</td><td className="px-3 py-2">{r.actualWonPrice ? currency(r.actualWonPrice) : '—'}</td><td className="px-3 py-2">{r.marginPercent ? percent(r.marginPercent) : '—'}</td><td className="px-3 py-2">{r.outcome}</td><td className="px-3 py-2">{r.daysInPipeline}</td></tr>))}</tbody>
          </table></div>
        </CardContent></Card>
      </div>
    );
  };

  // ── render: subscription tab ──
  const renderSubscription = () => (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">CleanScope AI Plans</h2>
        <p className="text-muted-foreground">Powering janitorial sales teams across the US</p>
        <div className="inline-flex items-center gap-1 rounded-2xl bg-muted/40 p-1">
          <Button variant={billingCycle === 'monthly' ? 'default' : 'ghost'} className="rounded-xl" onClick={() => setBillingCycle('monthly')}>Monthly</Button>
          <Button variant={billingCycle === 'annual' ? 'default' : 'ghost'} className="rounded-xl" onClick={() => setBillingCycle('annual')}>Annual <Badge className="ml-2 bg-emerald-500 text-white text-xs">Save 10%</Badge></Button>
        </div>
      </div>
      {currentTier !== 'none' && (
        <Card className="rounded-3xl border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="flex items-center justify-between py-4">
            <div><p className="font-semibold">Active: {TIERS[currentTier as keyof typeof TIERS].name}</p><p className="text-sm text-muted-foreground">Customer ID: {customerId}</p></div>
            <Badge className="bg-emerald-500 text-white">Active</Badge>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {(['starter', 'professional', 'growth'] as const).map(tier => {
          const d = TIERS[tier];
          const price = billingCycle === 'annual' ? d.annual : d.monthly;
          const isActive = currentTier === tier;
          return (
            <Card key={tier} className={`rounded-3xl relative ${d.popular ? 'ring-2 ring-emerald-500' : ''}`}>
              {d.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-emerald-500 text-white px-4">Most Popular</Badge></div>}
              <CardHeader className="pt-7">
                <CardTitle className="text-lg">{d.name}</CardTitle>
                <div><span className="text-4xl font-bold">${price}</span><span className="text-muted-foreground">/mo</span></div>
                {billingCycle === 'annual' && <p className="text-xs text-muted-foreground">${d.annualTotal}/yr billed annually</p>}
                <p className="text-sm text-muted-foreground">{d.users}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">{d.features.map(f => (<li key={f} className="flex items-start gap-2 text-sm"><span className="text-emerald-500 mt-0.5">✓</span><span>{f}</span></li>))}</ul>
                {isActive ? (
                  <Button disabled className="w-full rounded-2xl bg-emerald-500 text-white">✓ Active Plan</Button>
                ) : (
                  <Button className="w-full rounded-2xl" variant={d.popular ? 'default' : 'outline'} onClick={() => { setCheckoutTier(tier); setCheckoutOpen(true); }}>{currentTier === 'none' ? 'Get Started' : 'Switch Plan'}</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="rounded-3xl">
        <CardHeader><CardTitle className="text-base">Stripe Integration</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1"><Label>Publishable Key</Label><Input value={stripePubKey} onChange={e => setStripePubKey(e.target.value)} className="rounded-xl font-mono text-xs" placeholder="pk_live_…" /></div>
          <div className="space-y-1"><Label>Secret Key</Label><Input type="password" value={stripeSecretKey} onChange={e => setStripeSecretKey(e.target.value)} className="rounded-xl font-mono text-xs" placeholder="sk_live_…" /></div>
          <div className="flex items-center gap-3">
            <Button className="rounded-2xl" variant="outline" onClick={() => setStripeConnected(!!(stripePubKey && stripeSecretKey))}>{stripeConnected ? 'Reconnect' : 'Connect Stripe'}</Button>
            <Badge className={stripeConnected ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}>{stripeConnected ? '● Connected' : '○ Not Connected'}</Badge>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-3xl bg-muted/30">
        <CardContent className="py-4 text-sm text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Divitiae Terrae LLC — "The Wealth of the Earth"</p>
          <p>M. Marcus Mommsen, Managing Member · <a href="https://www.linkedin.com/in/marcusmommsen" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></p>
          <p>1309 Coffeen Avenue, STE 1200, Sheridan, Wyoming 82801, USA</p>
          <p>Billing: marcus@kluje.com</p>
        </CardContent>
      </Card>
    </div>
  );

  // ── render: stripe checkout modal ──
  const renderStripeCheckoutModal = () => {
    if (!checkoutTier) return null;
    const d = TIERS[checkoutTier as keyof typeof TIERS];
    const price = billingCycle === 'annual' ? d.annual : d.monthly;
    return (
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader><DialogTitle>Complete Subscription</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/40 p-4">
              <p className="font-semibold">{d.name} — {billingCycle === 'annual' ? 'Annual' : 'Monthly'}</p>
              <p className="text-2xl font-bold">${price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              {billingCycle === 'annual' && <p className="text-xs text-muted-foreground">Billed as ${d.annualTotal}/year</p>}
            </div>
            <div className="space-y-3">
              <div className="space-y-1"><Label>Card Number</Label><Input placeholder="4242 4242 4242 4242" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="rounded-2xl font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Expiry</Label><Input placeholder="MM / YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="rounded-2xl" /></div>
                <div className="space-y-1"><Label>CVC</Label><Input placeholder="123" value={cardCvc} onChange={e => setCardCvc(e.target.value)} className="rounded-2xl" /></div>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">🔒 Demo — no real payment processed</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-2xl" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button className="rounded-2xl" disabled={paymentProcessing} onClick={completePayment}>{paymentProcessing ? 'Processing…' : `Pay $${price}`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ── render: invoice modal ──
  const renderInvoiceModal = () => {
    if (!checkoutTier || !customerId) return null;
    const d = TIERS[checkoutTier as keyof typeof TIERS];
    const price = billingCycle === 'annual' ? d.annual : d.monthly;
    const total = billingCycle === 'annual' ? d.annualTotal : price;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader><DialogTitle>Payment Confirmed ✓</DialogTitle></DialogHeader>
          <div className="rounded-2xl border border-border/60 p-5 font-mono text-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold not-italic">Divitiae Terrae LLC</p>
                <p className="text-xs text-muted-foreground">"The Wealth of the Earth"</p>
                <p className="text-xs text-muted-foreground">1309 Coffeen Ave, STE 1200, Sheridan WY 82801</p>
                <p className="text-xs text-muted-foreground">marcus@kluje.com</p>
              </div>
              <div className="text-right space-y-1">
                <Badge className="bg-emerald-500 text-white">PAID</Badge>
                <p className="text-xs">Invoice: {invoiceNumber}</p>
                <p className="text-xs">Date: {today}</p>
                <p className="text-xs">Customer: {customerId}</p>
              </div>
            </div>
            <div className="border-t border-border/60 pt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground"><span>DESCRIPTION</span><span>AMOUNT</span></div>
              <div className="flex justify-between"><span>CleanScope AI {d.name} ({billingCycle})</span><span>${price}/mo</span></div>
              {billingCycle === 'annual' && <div className="flex justify-between text-xs text-muted-foreground"><span>Annual total</span><span>${total}</span></div>}
            </div>
            <div className="border-t border-border/60 pt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span>${total}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Tax (0% — Wyoming)</span><span>$0.00</span></div>
              <div className="flex justify-between font-bold"><span>TOTAL</span><span>${total}</span></div>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">Confirmation sent to marcus@kluje.com</p>
          <DialogFooter>
            <Button className="w-full rounded-2xl" onClick={() => { setInvoiceOpen(false); setTopTab('subscription'); }}>View My Subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ── render: pricing calculator ──
  const renderPricingCalculator = () => (
    <div className="space-y-4">
      <Card className="rounded-3xl">
        <CardHeader><CardTitle className="text-base">Quick Quote Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="max-w-xs space-y-1"><Label>Visits / week</Label><Input type="number" value={frequencyPerWeek} onChange={e => setFrequencyPerWeek(Number(e.target.value) || 1)} className="rounded-xl" /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Per Visit</p><p className="text-lg font-semibold">{currency(result.pricing.totalPerVisit)}</p></div>
            <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Monthly</p><p className="text-lg font-semibold">{currency(result.pricing.monthlyTotal)}</p></div>
            <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">One-Time</p><p className="text-lg font-semibold">{currency(result.pricing.oneTimeTotal)}</p></div>
          </div>
          <div className="rounded-2xl border border-border/60 p-3 space-y-2">
            {result.pricing.lineItems.map(item => (
              <div key={item.item} className="flex justify-between text-sm"><span className="text-muted-foreground">{item.item}</span><span className="font-medium">{currency(item.amount)}</span></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ── render: main content router ──
  const renderMainContent = () => {
    switch (topTab) {
      case 'walkthroughs': return <Card className="rounded-3xl"><CardHeader><CardTitle>Janitorial Walkthroughs</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Room-by-room walkthrough notes for operations and QA signoff.</CardContent></Card>;
      case 'proposal': return renderNewProposal();
      case 'pipeline': return (
        <Card className="rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Pipeline</CardTitle><Button className="rounded-2xl" onClick={markLatestProposalWon}>Mark Latest Won</Button></CardHeader>
          <CardContent className="space-y-2 text-sm">{salesRecords.filter(r => r.outcome === 'Open').map(r => (<div key={r.id} className="rounded-2xl border border-border/60 p-3"><p className="font-medium">{r.client}</p><p className="text-muted-foreground">{r.buildingType} · {currency(r.proposedMonthlyPrice)} · {r.daysInPipeline} days</p></div>))}</CardContent>
        </Card>
      );
      case 'clients': return <Card className="rounded-3xl"><CardHeader><CardTitle>Clients</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Harbor Medical Pavilion, Emerald Office Tower, and Rainier Community Bank synced from CRM demo data.</CardContent></Card>;
      case 'contracts': return (
        <Card className="rounded-3xl">
          <CardHeader><CardTitle>Active Contracts</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">{salesRecords.filter(r => r.outcome === 'Won').map(r => (<div key={r.id} className="rounded-2xl border border-border/60 p-3"><p className="font-medium">{r.client}</p><p className="text-muted-foreground">MRR: {currency(r.actualWonPrice)} · Margin: {percent(r.marginPercent)}</p></div>))}</CardContent>
        </Card>
      );
      case 'sales-reports': return renderSalesReports();
      case 'calculator': return renderPricingCalculator();
      case 'history': return <Card className="rounded-3xl"><CardHeader><CardTitle>Historical Jobs</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Track prior opportunities, accepted terms, and revision notes.</CardContent></Card>;
      case 'subscription': return renderSubscription();
      default: return null;
    }
  };

  // ── site intelligence sidebar card ──
  const traffic = getTrafficEstimate();
  const sqftTotal = areas.reduce((s, a) => s + a.sqft, 0);

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-border/60">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-blue-600 text-white">Janitorial</Badge>
                <Badge variant="outline">CleanScope AI v5.0</Badge>
                {currentTier !== 'none' && <Badge className="bg-emerald-500 text-white">{TIERS[currentTier as keyof typeof TIERS].name}</Badge>}
              </div>
              <CardTitle className="text-2xl">Janitorial Manager CRM Dashboard</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Multimodal capture · Transparent pricing · CRM pipeline · Site intelligence · Billing</p>
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
            {([
              { key: 'walkthroughs', label: 'Walkthroughs' },
              { key: 'proposal', label: 'New Bid / Proposal' },
              { key: 'pipeline', label: 'Pipeline' },
              { key: 'clients', label: 'Clients' },
              { key: 'contracts', label: 'Contracts' },
              { key: 'sales-reports', label: 'Sales Reports' },
              { key: 'calculator', label: 'Calculator' },
              { key: 'history', label: 'History' },
              { key: 'subscription', label: 'Subscription' },
            ] as const).map(tab => (
              <Button key={tab.key} variant={topTab === tab.key ? 'default' : 'ghost'} className="rounded-xl" onClick={() => setTopTab(tab.key)}>
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="max-h-[70vh] overflow-auto pr-1">{renderMainContent()}</div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader className="pb-3"><CardTitle className="text-base">Site Intelligence</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {weather.temp !== null ? (
                <div className="rounded-2xl bg-muted/40 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">{weather.city}</p>
                  <p className="text-lg font-semibold">{weather.emoji} {weather.temp}°F</p>
                  <p className="text-sm">{weather.condition} · Feels {weather.feelsLike}°F</p>
                  <p className="text-xs text-muted-foreground">Humidity {weather.humidity}% · Wind {weather.windSpeed} mph</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground rounded-2xl bg-muted/40 p-3">Enter site address in New Bid tab → Get Weather</p>
              )}
              <div className="rounded-2xl bg-muted/40 p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Traffic to Site</p>
                <p className={`text-sm font-semibold ${traffic.level === 'heavy' ? 'text-rose-500' : traffic.level === 'moderate' ? 'text-amber-500' : 'text-emerald-500'}`}>{traffic.label}</p>
                <p className="text-xs text-muted-foreground">{traffic.delay} · {traffic.note}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Win Probability</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-muted"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${calcWinProbability('Office', sqftTotal)}%` }} /></div>
                  <span className="text-sm font-bold text-emerald-600">{calcWinProbability('Office', sqftTotal)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-3"><CardTitle className="text-base">Quick Settings</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Labor Rate: <strong>{currency(settings.laborRate)}</strong></p>
              <p>Other Direct: <strong>{currency(settings.otherDirect)}</strong></p>
              <p>Supplies: <strong>{settings.suppliesPercent}%</strong></p>
              <p>Overhead: <strong>{settings.overheadPercent}%</strong></p>
              <p>Profit: <strong>{settings.profitPercent}%</strong></p>
              <Button className="mt-2 w-full rounded-2xl" variant="outline" onClick={() => setSettingsOpen(true)}>Edit Settings</Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-sky-800 via-blue-700 to-indigo-700 text-white shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base text-white">Quick Links</CardTitle></CardHeader>
            <CardContent className="pt-0"><div className="flex flex-wrap gap-2">{['AI Assistant', 'Company Branding', 'Labor Rates', 'Recent Jobs', 'Task Library'].map(item => (<Button key={item} variant="ghost" className="h-9 rounded-xl bg-white/10 px-3 text-sm text-white hover:bg-white hover:text-blue-700">{item}</Button>))}</div></CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader><CardTitle className="text-base">CleanScope AI v5.0</CardTitle></CardHeader>
            <CardContent><Textarea className="min-h-28 rounded-2xl text-xs" value={assistantPrompt} onChange={e => setAssistantPrompt(e.target.value)} /></CardContent>
          </Card>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onSave={setSettings} />
      {renderQuoteEmailModal()}
      {renderStripeCheckoutModal()}
      {renderInvoiceModal()}
    </div>
  );
}
