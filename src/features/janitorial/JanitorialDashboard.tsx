// CleanScope AI v5.0 — Janitorial Manager CRM Dashboard
// Features: Quote Builder · Site Intel · Sentiment Portal · Legal & Consent · Geo-Tracking · Billing
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

const CITY_RATES = [
  { city: 'Seattle, WA',        rate: 47, costIdx: 1.28, sqftCost: 0.18, highlight: true },
  { city: 'San Francisco, CA',  rate: 52, costIdx: 1.42, sqftCost: 0.21, highlight: false },
  { city: 'New York, NY',       rate: 54, costIdx: 1.45, sqftCost: 0.22, highlight: false },
  { city: 'Los Angeles, CA',    rate: 49, costIdx: 1.35, sqftCost: 0.19, highlight: false },
  { city: 'Boston, MA',         rate: 48, costIdx: 1.30, sqftCost: 0.18, highlight: false },
  { city: 'Chicago, IL',        rate: 43, costIdx: 1.15, sqftCost: 0.16, highlight: false },
  { city: 'Denver, CO',         rate: 41, costIdx: 1.08, sqftCost: 0.15, highlight: false },
  { city: 'Portland, OR',       rate: 44, costIdx: 1.18, sqftCost: 0.16, highlight: false },
  { city: 'Minneapolis, MN',    rate: 42, costIdx: 1.10, sqftCost: 0.15, highlight: false },
  { city: 'Miami, FL',          rate: 38, costIdx: 1.00, sqftCost: 0.14, highlight: false },
  { city: 'Atlanta, GA',        rate: 36, costIdx: 0.96, sqftCost: 0.13, highlight: false },
  { city: 'Dallas, TX',         rate: 36, costIdx: 0.95, sqftCost: 0.13, highlight: false },
  { city: 'Houston, TX',        rate: 35, costIdx: 0.93, sqftCost: 0.13, highlight: false },
  { city: 'Nashville, TN',      rate: 35, costIdx: 0.92, sqftCost: 0.13, highlight: false },
  { city: 'Phoenix, AZ',        rate: 34, costIdx: 0.90, sqftCost: 0.12, highlight: false },
  { city: 'Charlotte, NC',      rate: 34, costIdx: 0.91, sqftCost: 0.12, highlight: false },
  { city: 'Las Vegas, NV',      rate: 35, costIdx: 0.94, sqftCost: 0.13, highlight: false },
];

const SENTIMENT_CLIENTS = [
  { id: 'c1', name: 'Harbor Medical Pavilion',   nps: 67, trend: 'up',   sentiment: 'Positive', sentimentPct: 82, daysSincePositive: 4,  riskScore: 'Low',    fte: 96, contract: '$28,200/mo' },
  { id: 'c2', name: 'Emerald Office Tower',       nps: 41, trend: 'down', sentiment: 'Neutral',  sentimentPct: 54, daysSincePositive: 18, riskScore: 'Medium', fte: 88, contract: '$34,400/mo' },
  { id: 'c3', name: 'Rainier Community Bank HQ',  nps: 22, trend: 'down', sentiment: 'Negative', sentimentPct: 31, daysSincePositive: 34, riskScore: 'High',   fte: 79, contract: '$14,300/mo' },
  { id: 'c4', name: 'Puget Cardiology Center',    nps: 58, trend: 'up',   sentiment: 'Positive', sentimentPct: 74, daysSincePositive: 7,  riskScore: 'Low',    fte: 93, contract: '$19,850/mo' },
  { id: 'c5', name: 'Westlake Tech Offices',      nps: 35, trend: 'flat', sentiment: 'Neutral',  sentimentPct: 61, daysSincePositive: 11, riskScore: 'Medium', fte: 85, contract: '$30,900/mo' },
];

const RFID_CLEANERS = [
  { id: 'r1', name: 'Cleaner A — J. Rivera',    location: 'Harbor Medical — Wing B',      status: 'On Site',   efficiency: 94 },
  { id: 'r2', name: 'Cleaner B — M. Tanaka',    location: 'Emerald Office Tower — Fl 12', status: 'On Site',   efficiency: 88 },
  { id: 'r3', name: 'Cleaner C — P. Okafor',    location: 'In Transit',                   status: 'In Transit', efficiency: 91 },
  { id: 'r4', name: 'Cleaner D — S. Flores',    location: 'Rainier Bank HQ — Lobby',      status: 'On Site',   efficiency: 79 },
  { id: 'r5', name: 'Cleaner E — T. Williams',  location: 'Puget Cardiology — Fl 3',      status: 'On Site',   efficiency: 96 },
];

const RECENT_FEEDBACK = [
  { client: 'Harbor Medical',   date: '2026-04-16', text: 'Restrooms were spotless during the 8am inspection — great work this week.', sentiment: 'Positive' },
  { client: 'Emerald Office',   date: '2026-04-14', text: 'Lobby was missed on Tuesday evening. Need more consistency.', sentiment: 'Negative' },
  { client: 'Rainier Bank',     date: '2026-04-10', text: 'Third time this month trash was not collected before close of business.', sentiment: 'Negative' },
  { client: 'Puget Cardiology', date: '2026-04-15', text: 'Very happy overall. The new cart system seems faster — keep it up.', sentiment: 'Positive' },
  { client: 'Westlake Tech',    date: '2026-04-13', text: 'Okay week. Nothing outstanding, nothing terrible.', sentiment: 'Neutral' },
];

const WIZARD_STEPS = [
  { title: 'Building Type', question: 'What type of facility are we quoting?', placeholder: 'e.g. Medical office, Class A office tower, retail strip…' },
  { title: 'Current Provider', question: 'Who is their current cleaning provider, and what are they paying?', placeholder: 'e.g. ABC Cleaning, ~$4,200/mo, 3x weekly…' },
  { title: 'Pain Points', question: 'What problems are they experiencing with their current service?', placeholder: 'e.g. Poor restroom standards, missed visits, no account manager…' },
  { title: 'Budget', question: 'What monthly budget range are they working with?', placeholder: 'e.g. $3,000–$5,000/mo, flexible, or unknown…' },
  { title: 'Timeline', question: 'When do they want service to start?', placeholder: 'e.g. ASAP, next quarter, contract renewal in August…' },
];

type InvitationStatus = 'not-sent' | 'sent' | 'accepted' | 'expired';

const STAFF_LIST = [
  { id: 'st1', name: 'J. Rivera',   role: 'Lead Cleaner',   phone: '+1 (206) 555-0101', consentGiven: true,  consentDate: '2026-03-15' },
  { id: 'st2', name: 'M. Tanaka',   role: 'Cleaner',        phone: '+1 (206) 555-0102', consentGiven: true,  consentDate: '2026-03-15' },
  { id: 'st3', name: 'P. Okafor',   role: 'Sub-Contractor', phone: '+1 (206) 555-0103', consentGiven: true,  consentDate: '2026-03-20' },
  { id: 'st4', name: 'S. Flores',   role: 'Cleaner',        phone: '+1 (206) 555-0104', consentGiven: true,  consentDate: '2026-03-20' },
  { id: 'st5', name: 'T. Williams', role: 'Sub-Contractor', phone: '+1 (206) 555-0105', consentGiven: false, consentDate: '' },
];

const CONSENT_HISTORY = [
  { id: 'ch1', staff: 'J. Rivera',   action: 'Consent given',    date: '2026-03-15', method: 'Digital signature — app onboarding' },
  { id: 'ch2', staff: 'M. Tanaka',   action: 'Consent given',    date: '2026-03-15', method: 'Digital signature — app onboarding' },
  { id: 'ch3', staff: 'P. Okafor',   action: 'Consent given',    date: '2026-03-20', method: 'Digital signature — app onboarding' },
  { id: 'ch4', staff: 'S. Flores',   action: 'Consent given',    date: '2026-03-20', method: 'Digital signature — app onboarding' },
  { id: 'ch5', staff: 'J. Rivera',   action: 'Tracking paused',  date: '2026-03-28', method: 'In-app toggle' },
  { id: 'ch6', staff: 'J. Rivera',   action: 'Tracking resumed', date: '2026-03-29', method: 'In-app toggle' },
];

const INITIAL_INVITE_STATUS: Record<string, InvitationStatus> = {
  c1: 'accepted', c2: 'sent', c3: 'not-sent', c4: 'accepted', c5: 'sent',
};

const GEO_TRACKING_CODE = `// CleanerApp.tsx — React Native / Expo
// deps: expo-location  expo-task-manager  expo-notifications
// opt:  react-native-nfc-manager (NFC fallback)
// ──────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const GEOFENCE_TASK   = 'KLUJE_GEOFENCE';
const BACKGROUND_TASK = 'KLUJE_BG_LOCATION';
const API             = 'https://api.kluje.com/v1/tracking';

// 1. Background geofence handler — fires on enter / exit ─────────────────
TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) { console.error(error); return; }
  const { eventType, region } = data;
  const staffId = await AsyncStorage.getItem('staffId');

  if (eventType === Location.GeofencingEventType.Enter) {
    // AUTO-START: cleaner entered job-site boundary
    await fetch(API + '/shift/start', {
      method: 'POST',
      body: JSON.stringify({ staffId, siteId: region.identifier, enteredAt: new Date().toISOString() }),
      headers: { 'Content-Type': 'application/json' },
    });
    await startBackgroundTracking();
    await Notifications.scheduleNotificationAsync({
      content: { title: '● Tracking Active', body: 'Kluje is recording your shift. Stops automatically when you leave.' },
      trigger: null,
    });
  }

  if (eventType === Location.GeofencingEventType.Exit) {
    // AUTO-STOP: cleaner left job-site — no manual action required
    await Location.stopLocationUpdatesAsync(BACKGROUND_TASK);
    await fetch(API + '/shift/end', {
      method: 'POST',
      body: JSON.stringify({ staffId, exitedAt: new Date().toISOString() }),
      headers: { 'Content-Type': 'application/json' },
    });
    await Notifications.scheduleNotificationAsync({
      content: { title: '○ Shift Complete', body: 'Tracking stopped. Tap to view your shift summary.' },
      trigger: null,
    });
  }
});

// 2. Background location ping every 60s (on-site only) ───────────────────
TaskManager.defineTask(BACKGROUND_TASK, async ({ data: { locations }, error }) => {
  if (error || !locations.length) return;
  const loc     = locations[locations.length - 1].coords;
  const staffId = await AsyncStorage.getItem('staffId');
  await fetch(API + '/ping', {
    method: 'POST',
    body: JSON.stringify({ staffId, lat: loc.latitude, lng: loc.longitude, ts: new Date().toISOString() }),
    headers: { 'Content-Type': 'application/json' },
  });
});

async function startBackgroundTracking() {
  await Location.startLocationUpdatesAsync(BACKGROUND_TASK, {
    accuracy:         Location.Accuracy.Balanced,
    timeInterval:     60000,   // ping every 60 seconds
    distanceInterval: 30,      // or every 30 metres
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Kluje — Shift Active',
      notificationBody:  'Location tracked on job site only. Auto-stops when you leave.',
    },
  });
}

// 3. Register geofence for job site (call after cleaner logs in) ──────────
export async function registerSiteGeofence(site: { id: string; lat: number; lng: number; radius?: number }) {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Background location is required for shift tracking.'); return;
  }
  await Location.startGeofencingAsync(GEOFENCE_TASK, [{
    identifier:    site.id,
    latitude:      site.lat,
    longitude:     site.lng,
    radius:        site.radius ?? 75,  // 75-metre boundary around building
    notifyOnEnter: true,
    notifyOnExit:  true,
  }]);
}

// 4. NFC fallback check-in ────────────────────────────────────────────────
// import NfcManager, { NfcTech } from 'react-native-nfc-manager';
// async function nfcCheckIn(staffId: string, siteId: string) {
//   try {
//     await NfcManager.requestTechnology(NfcTech.Ndef);
//     const tag = await NfcManager.getTag();
//     await fetch(API + '/nfc', {
//       method: 'POST',
//       body: JSON.stringify({ staffId, siteId, nfcTagId: tag.id, ts: new Date().toISOString() }),
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } finally { await NfcManager.cancelTechnologyRequest(); }
// }

// 5. Cleaner UI ───────────────────────────────────────────────────────────
/*
  TRACKING SCREEN:
  +------------------------------------------+
  |  * TRACKING ACTIVE                       |  <- green dot, pulse
  |  Harbor Medical Pavilion -- Wing B       |  <- site name from API
  |  Shift started: 6:02 AM                  |
  |  Time on site:  2h 14m                   |
  |  FTE Efficiency: 94%  [====  ]           |
  |                                          |
  |  [ NFC Check-In (backup)             ]   |
  |  [ Report Issue                      ]   |
  |  [ Mark Shift Complete (check)       ]   |  <- closes shift, pushes data
  +------------------------------------------+

  CONSENT SCREEN (one-time, shown at app install):
  +------------------------------------------+
  |  Location & Tracking Notice              |
  |  ──────────────────────────────────────  |
  |  (check) Tracking starts ONLY when you  |
  |           enter the job-site boundary.   |
  |  (check) Tracking stops automatically   |
  |           when you leave -- no action    |
  |           needed from you.              |
  |  (check) Zero tracking off-site or      |
  |           outside work hours.            |
  |  (check) Data: shift time + FTE score   |
  |           only. Never shared externally. |
  |                                          |
  |  [ I Agree & Continue ->             ]   |
  |  [ Read Full Privacy Policy          ]   |
  +------------------------------------------+
*/

export default function CleanerApp() {
  const [shiftActive, setShiftActive] = useState(false);
  const [siteName,    setSiteName]    = useState('Awaiting job-site entry...');
  const [fteScore,    setFteScore]    = useState(94);

  useEffect(() => {
    // In production: fetch assigned site from API, then register
    registerSiteGeofence({ id: 'harbor-medical', lat: 47.6062, lng: -122.3321 });
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: shiftActive ? '#10b981' : '#6b7280' }]}>
        <Text style={styles.badgeText}>{shiftActive ? '* TRACKING ACTIVE' : 'O NOT ON SITE'}</Text>
      </View>
      <Text style={styles.site}>{siteName}</Text>
      <Text style={styles.fte}>FTE Efficiency: {fteScore}%</Text>
      <TouchableOpacity style={styles.btn} onPress={() => setShiftActive(false)}>
        <Text style={styles.btnText}>Mark Shift Complete (check)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#0f172a' },
  badge:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 12 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  site:      { color: '#94a3b8', fontSize: 16, marginBottom: 8 },
  fte:       { color: '#10b981', fontSize: 18, fontWeight: '700', marginBottom: 24 },
  btn:       { backgroundColor: '#10b981', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  btnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
});`;

type TopTab = 'walkthroughs' | 'proposal' | 'pipeline' | 'clients' | 'contracts' | 'sales-reports' | 'calculator' | 'history' | 'subscription' | 'client-sentiment' | 'legal-consent';
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

  // ── costing wizard ──
  const [costingWizardOpen, setCostingWizardOpen] = useState(false);

  // ── client conversation wizard ──
  const [proposalSubTab, setProposalSubTab] = useState<'builder' | 'conversation'>('builder');
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState(['', '', '', '', '']);

  // ── client sentiment ──
  const [signalClientOpen, setSignalClientOpen] = useState(false);
  const [signalClientId, setSignalClientId] = useState('');
  const [signalNotes, setSignalNotes] = useState('');

  // ── client invitations ──
  const [inviteStatuses, setInviteStatuses] = useState<Record<string, InvitationStatus>>(INITIAL_INVITE_STATUS);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteClientId, setInviteClientId] = useState('');

  // ── legal & consent ──
  const [companyTrackingEnabled, setCompanyTrackingEnabled] = useState(true);
  const [staffTrackingEnabled, setStaffTrackingEnabled] = useState<Record<string, boolean>>({ st1: true, st2: true, st3: true, st4: true, st5: false });
  const [consentSubTab, setConsentSubTab] = useState<'policy' | 'staff' | 'mobile'>('policy');

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

  // ── render: client conversation wizard ──
  const renderClientConversation = () => {
    const step = WIZARD_STEPS[wizardStep];
    const isLast = wizardStep === WIZARD_STEPS.length - 1;
    return (
      <div className="space-y-4">
        <div className="flex gap-1">{WIZARD_STEPS.map((s, i) => (<div key={s.title} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= wizardStep ? 'bg-emerald-500' : 'bg-muted'}`} />))}</div>
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>Step {wizardStep + 1} of {WIZARD_STEPS.length}</span>
              <span>·</span>
              <span className="font-medium text-foreground">{step.title}</span>
            </div>
            <CardTitle className="text-lg">{step.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="min-h-28 rounded-2xl"
              placeholder={step.placeholder}
              value={wizardAnswers[wizardStep]}
              onChange={e => setWizardAnswers(prev => prev.map((a, i) => i === wizardStep ? e.target.value : a))}
            />
            <div className="flex gap-2 justify-between">
              <Button variant="outline" className="rounded-2xl" disabled={wizardStep === 0} onClick={() => setWizardStep(s => s - 1)}>← Back</Button>
              {isLast ? (
                <Button className="rounded-2xl bg-emerald-500 hover:bg-emerald-600" onClick={() => { setProposalSubTab('builder'); setWizardStep(0); }}>
                  Build Quote from Notes →
                </Button>
              ) : (
                <Button className="rounded-2xl" onClick={() => setWizardStep(s => s + 1)}>Next →</Button>
              )}
            </div>
          </CardContent>
        </Card>
        {wizardAnswers.some(a => a.trim()) && (
          <Card className="rounded-3xl bg-muted/30">
            <CardHeader><CardTitle className="text-sm">Conversation Notes</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {WIZARD_STEPS.map((s, i) => wizardAnswers[i] ? (
                <div key={s.title}><span className="font-medium text-muted-foreground">{s.title}: </span><span>{wizardAnswers[i]}</span></div>
              ) : null)}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ── render: new proposal ──
  const renderNewProposal = () => {
    const traffic = getTrafficEstimate();
    const sqft = areas.reduce((s, a) => s + a.sqft, 0);
    const winProb = calcWinProbability('Office', sqft);
    return (
      <div className="space-y-4">
        <div className="flex gap-2 rounded-2xl bg-muted/40 p-1">
          <Button variant={proposalSubTab === 'builder' ? 'default' : 'ghost'} className="rounded-xl flex-1" onClick={() => setProposalSubTab('builder')}>Quote Builder</Button>
          <Button variant={proposalSubTab === 'conversation' ? 'default' : 'ghost'} className="rounded-xl flex-1" onClick={() => setProposalSubTab('conversation')}>Client Conversation</Button>
        </div>
        {proposalSubTab === 'conversation' ? renderClientConversation() : (<div className="space-y-4">
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
              Approve Quote &amp; Review Costs →
            </Button>
          </CardContent>
        </Card>
      </div>)}
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
    setCostingWizardOpen(true); // auto-open costing wizard before emails
  };

  // ── render: costing wizard modal ──
  const renderCostingWizard = () => {
    const sqft = result.summary.cleanableSqFt || 1;
    const visits = result.summary.visitsPerMonth;
    const directCostPerMonth = result.pricing.directSubtotal * visits;
    const overheadPerMonth = result.pricing.overheadAmount * visits;
    const totalCostPerMonth = directCostPerMonth + overheadPerMonth;
    const sellingPerMonth = result.pricing.monthlyTotal;
    const grossMarginAmt = sellingPerMonth - totalCostPerMonth;
    const grossMarginPct = sellingPerMonth > 0 ? (grossMarginAmt / sellingPerMonth) * 100 : 0;
    const costPerSqft = totalCostPerMonth / sqft;
    const sellPerSqft = sellingPerMonth / sqft;
    const seattleRef = CITY_RATES.find(c => c.highlight)!;
    const yourVsMarket = costPerSqft - seattleRef.sqftCost;
    return (
      <Dialog open={costingWizardOpen} onOpenChange={setCostingWizardOpen}>
        <DialogContent className="rounded-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">True Cost of Sales Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">Direct Cost/mo</p>
                <p className="text-xl font-bold text-rose-600">{currency(totalCostPerMonth)}</p>
              </div>
              <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">Selling Price/mo</p>
                <p className="text-xl font-bold text-blue-600">{currency(sellingPerMonth)}</p>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">Gross Margin</p>
                <p className="text-xl font-bold text-emerald-600">{currency(grossMarginAmt)}</p>
                <p className="text-xs text-emerald-600 font-medium">{percent(grossMarginPct)}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Cost / sq ft / mo</p>
                <p className="text-xl font-bold">${costPerSqft.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">Sell: ${sellPerSqft.toFixed(3)}</p>
              </div>
            </div>

            <Card className="rounded-2xl">
              <CardContent className="pt-4 space-y-2">
                {[
                  { label: 'Labor (monthly)', val: result.pricing.lineItems[0].amount * visits },
                  { label: 'Supplies (monthly)', val: result.pricing.lineItems[1].amount * visits },
                  { label: 'Other Direct (monthly)', val: result.pricing.lineItems[2].amount * visits },
                  { label: 'Overhead (monthly)', val: overheadPerMonth },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm border-b border-border/40 pb-1">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">{currency(row.val)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span>Total Cost of Sales</span><span className="text-rose-600">{currency(totalCostPerMonth)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span>Gross Profit</span><span className="text-emerald-600">{currency(grossMarginAmt)} ({percent(grossMarginPct)})</span>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-border/60 overflow-hidden">
              <div className="bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide">Labor Rate + Cost/sqft by Market</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-left">
                    <tr><th className="px-3 py-2">City</th><th className="px-3 py-2">Labor/hr</th><th className="px-3 py-2">Cost Index</th><th className="px-3 py-2">Est. Cost/sqft/mo</th><th className="px-3 py-2">vs Your Quote</th></tr>
                  </thead>
                  <tbody>
                    {CITY_RATES.map(c => (
                      <tr key={c.city} className={`border-t border-border/40 ${c.highlight ? 'bg-blue-500/10 font-semibold' : ''}`}>
                        <td className="px-3 py-2">{c.city}{c.highlight ? ' ★' : ''}</td>
                        <td className="px-3 py-2">${c.rate}/hr</td>
                        <td className="px-3 py-2">{c.costIdx.toFixed(2)}×</td>
                        <td className="px-3 py-2">${c.sqftCost.toFixed(3)}</td>
                        <td className={`px-3 py-2 font-medium ${(costPerSqft - c.sqftCost) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {(costPerSqft - c.sqftCost) > 0 ? '+' : ''}{((costPerSqft - c.sqftCost) * 100).toFixed(1)}¢
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`rounded-2xl p-3 text-sm ${Math.abs(yourVsMarket) < 0.01 ? 'bg-emerald-500/10 border border-emerald-500/20' : yourVsMarket > 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
              {yourVsMarket > 0.005
                ? `⚠ Your cost/sqft ($${costPerSqft.toFixed(3)}) is ${((yourVsMarket / seattleRef.sqftCost) * 100).toFixed(0)}% above the Seattle market benchmark. Consider tightening overhead or adjusting scope.`
                : `✓ Your cost/sqft ($${costPerSqft.toFixed(3)}) is competitive vs the Seattle market benchmark ($${seattleRef.sqftCost.toFixed(3)}). Margin is healthy.`}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setCostingWizardOpen(false)}>Close</Button>
            <Button className="rounded-2xl" onClick={() => { setCostingWizardOpen(false); setQuoteEmailOpen(true); }}>Send Quote Emails →</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
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
  const renderPricingCalculator = () => {
    const sqft = result.summary.cleanableSqFt || 1;
    const visits = result.summary.visitsPerMonth;
    const directCostMonthly = result.pricing.directSubtotal * visits;
    const overheadMonthly = result.pricing.overheadAmount * visits;
    const totalCostMonthly = directCostMonthly + overheadMonthly;
    const sellingMonthly = result.pricing.monthlyTotal;
    const grossMargin = sellingMonthly > 0 ? ((sellingMonthly - totalCostMonthly) / sellingMonthly) * 100 : 0;
    const costPerSqft = totalCostMonthly / sqft;
    const sellPerSqft = sellingMonthly / sqft;
    const marginInsight = grossMargin >= 20 ? 'Healthy margin — within target range.' : grossMargin >= 15 ? 'Margin is lean — consider tightening scope or raising price.' : 'Margin below threshold — review labor rate and overhead.';
    return (
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
        <Card className="rounded-3xl border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-emerald-500/5">
          <CardHeader><CardTitle className="text-base">Real-Time Cost of Sales</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-rose-500/10 p-3 text-center"><p className="text-xs text-muted-foreground">Total Cost/mo</p><p className="text-lg font-bold text-rose-600">{currency(totalCostMonthly)}</p></div>
              <div className="rounded-2xl bg-blue-500/10 p-3 text-center"><p className="text-xs text-muted-foreground">Selling Price/mo</p><p className="text-lg font-bold text-blue-600">{currency(sellingMonthly)}</p></div>
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-center"><p className="text-xs text-muted-foreground">Gross Margin</p><p className="text-lg font-bold text-emerald-600">{percent(grossMargin)}</p></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Cost / sq ft / mo</p><p className="text-base font-semibold text-rose-600">${costPerSqft.toFixed(3)}</p></div>
              <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Sell / sq ft / mo</p><p className="text-base font-semibold text-blue-600">${sellPerSqft.toFixed(3)}</p></div>
            </div>
            <div className={`rounded-2xl p-3 text-sm ${grossMargin >= 20 ? 'bg-emerald-500/10 text-emerald-700' : grossMargin >= 15 ? 'bg-amber-500/10 text-amber-700' : 'bg-rose-500/10 text-rose-700'}`}>
              {grossMargin >= 20 ? '✓' : '⚠'} {marginInsight}
            </div>
            <Button variant="outline" className="w-full rounded-2xl" onClick={() => setCostingWizardOpen(true)}>Open Full City Comparison →</Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ── render: invite modal ──
  const renderInviteModal = () => {
    const client = SENTIMENT_CLIENTS.find(c => c.id === inviteClientId);
    const token  = inviteClientId ? `klj_${inviteClientId}_${Math.random().toString(36).slice(2, 10)}` : '';
    const link   = `https://kluje.com/sentiment?token=${token}`;
    return (
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader><DialogTitle>Invite Client to Sentiment Dashboard</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Inviting</p>
              <p className="font-semibold">{client?.name ?? '—'}</p>
            </div>
            <div className="space-y-2">
              <Label>One-Time Invitation Link (expires in 7 days)</Label>
              <div className="flex gap-2">
                <Input readOnly value={link} className="rounded-xl font-mono text-xs flex-1" />
                <Button variant="outline" className="rounded-xl shrink-0" onClick={() => copyToClipboard(link)}>{copied ? '✓ Copied' : 'Copy'}</Button>
              </div>
            </div>
            <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-3 text-sm space-y-1">
              <p className="font-medium text-blue-700">Client read-only access includes:</p>
              <p className="text-muted-foreground">• NPS score for their facility only</p>
              <p className="text-muted-foreground">• Recent feedback submitted for their account</p>
              <p className="text-muted-foreground">• Cleaner efficiency scores (anonymized names)</p>
              <p className="text-muted-foreground">• No access to pricing, pipeline, or other client data</p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
            <Button className="rounded-2xl" onClick={() => {
              setInviteStatuses(prev => ({ ...prev, [inviteClientId]: 'sent' }));
              window.open('mailto:?subject=' + encodeURIComponent("You're invited to view your cleaning performance dashboard") + '&body=' + encodeURIComponent('Access your facility\'s Kluje dashboard: ' + link));
              setInviteModalOpen(false);
            }}>Send Invitation →</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ── render: clients tab ──
  const renderClients = () => {
    const inviteBg = (s: InvitationStatus) =>
      s === 'accepted' ? 'bg-emerald-500 text-white' : s === 'sent' ? 'bg-blue-500 text-white' : s === 'expired' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground';
    const inviteLabel = (s: InvitationStatus) =>
      s === 'accepted' ? '● Accepted' : s === 'sent' ? '● Sent' : s === 'expired' ? '○ Expired' : '○ Not Sent';
    return (
      <div className="space-y-4">
        <Card className="rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Client Accounts</CardTitle>
            <Badge className="bg-blue-600 text-white">{SENTIMENT_CLIENTS.length} clients</Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left"><tr>
                  <th className="px-3 py-2">Client</th><th className="px-3 py-2">Contract</th>
                  <th className="px-3 py-2">NPS</th><th className="px-3 py-2">Risk</th>
                  <th className="px-3 py-2">Portal Status</th><th className="px-3 py-2">Action</th>
                </tr></thead>
                <tbody>
                  {SENTIMENT_CLIENTS.map(c => (
                    <tr key={c.id} className="border-t border-border/40">
                      <td className="px-3 py-2 font-medium">{c.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.contract}</td>
                      <td className="px-3 py-2"><span className={`font-bold ${c.nps >= 50 ? 'text-emerald-600' : c.nps >= 30 ? 'text-amber-600' : 'text-rose-600'}`}>{c.nps}</span></td>
                      <td className="px-3 py-2"><Badge className={c.riskScore === 'High' ? 'bg-rose-500 text-white' : c.riskScore === 'Medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}>{c.riskScore}</Badge></td>
                      <td className="px-3 py-2"><Badge className={inviteBg(inviteStatuses[c.id] ?? 'not-sent')}>{inviteLabel(inviteStatuses[c.id] ?? 'not-sent')}</Badge></td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => { setInviteClientId(c.id); setInviteModalOpen(true); }}>Invite to Dashboard</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ── render: client sentiment portal ──
  const renderClientSentiment = () => {
    const avgNps = Math.round(SENTIMENT_CLIENTS.reduce((s, c) => s + c.nps, 0) / SENTIMENT_CLIENTS.length);
    const promoters = SENTIMENT_CLIENTS.filter(c => c.nps >= 50).length;
    const passives  = SENTIMENT_CLIENTS.filter(c => c.nps >= 30 && c.nps < 50).length;
    const detractors = SENTIMENT_CLIENTS.filter(c => c.nps < 30).length;
    const avgFte = Math.round(SENTIMENT_CLIENTS.reduce((s, c) => s + c.fte, 0) / SENTIMENT_CLIENTS.length);
    const atRiskMrr = SENTIMENT_CLIENTS.filter(c => c.riskScore !== 'Low').reduce((s, c) => s + parseInt(c.contract.replace(/[^0-9]/g, '')), 0);
    const signalClient = SENTIMENT_CLIENTS.find(c => c.id === signalClientId);
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4">
          <div>
            <p className="text-sm font-semibold">Share performance data with your clients</p>
            <p className="text-xs text-muted-foreground">Invite building owners to view their facility's NPS, feedback, and cleaning scores — read-only access.</p>
          </div>
          <Button className="rounded-2xl text-sm shrink-0" onClick={() => { setInviteClientId(SENTIMENT_CLIENTS[0].id); setInviteModalOpen(true); }}>+ Invite Client to Dashboard</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Card className="rounded-3xl border-blue-500/30 bg-blue-500/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Portfolio NPS</CardTitle></CardHeader>
            <CardContent><p className="text-4xl font-bold text-blue-600">{avgNps}</p><p className="text-xs text-muted-foreground mt-1">Net Promoter Score</p></CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-600">Promoters</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-emerald-600">{promoters}</p><p className="text-xs text-muted-foreground">NPS ≥ 50</p></CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-600">Passives</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-amber-600">{passives}</p><p className="text-xs text-muted-foreground">NPS 30–49</p></CardContent>
          </Card>
          <Card className="rounded-3xl">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-rose-600">Detractors</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-rose-600">{detractors}</p><p className="text-xs text-muted-foreground">NPS &lt; 30</p></CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl">
          <CardHeader><CardTitle>Sentiment Analysis — Recent Feedback</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {RECENT_FEEDBACK.map((fb, i) => (
              <div key={i} className="rounded-2xl border border-border/60 p-3 flex items-start gap-3">
                <Badge className={fb.sentiment === 'Positive' ? 'bg-emerald-500 text-white shrink-0' : fb.sentiment === 'Negative' ? 'bg-rose-500 text-white shrink-0' : 'bg-amber-500 text-white shrink-0'}>{fb.sentiment}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">{fb.client}</p>
                    <p className="text-xs text-muted-foreground">{fb.date}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{fb.text}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader><CardTitle>At-Risk Client Detection</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left"><tr>
                  <th className="px-3 py-2">Client</th><th className="px-3 py-2">NPS</th><th className="px-3 py-2">Trend</th>
                  <th className="px-3 py-2">Sentiment</th><th className="px-3 py-2">Days Since +</th>
                  <th className="px-3 py-2">Risk</th><th className="px-3 py-2">Contract</th><th className="px-3 py-2">Action</th>
                </tr></thead>
                <tbody>
                  {SENTIMENT_CLIENTS.map(c => (
                    <tr key={c.id} className="border-t border-border/40">
                      <td className="px-3 py-2 font-medium">{c.name}</td>
                      <td className="px-3 py-2"><span className={`font-bold ${c.nps >= 50 ? 'text-emerald-600' : c.nps >= 30 ? 'text-amber-600' : 'text-rose-600'}`}>{c.nps}</span></td>
                      <td className="px-3 py-2 text-lg">{c.trend === 'up' ? '↑' : c.trend === 'down' ? '↓' : '→'}</td>
                      <td className="px-3 py-2"><Badge className={c.sentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-700 border-0' : c.sentiment === 'Negative' ? 'bg-rose-500/20 text-rose-700 border-0' : 'bg-amber-500/20 text-amber-700 border-0'}>{c.sentiment}</Badge></td>
                      <td className="px-3 py-2">{c.daysSincePositive}d</td>
                      <td className="px-3 py-2"><Badge className={c.riskScore === 'High' ? 'bg-rose-500 text-white' : c.riskScore === 'Medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}>{c.riskScore}</Badge></td>
                      <td className="px-3 py-2 text-muted-foreground">{c.contract}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => { setSignalClientId(c.id); setSignalNotes(''); setSignalClientOpen(true); }}>Signal</Button>
                          <Button size="sm" variant="outline" className="rounded-xl text-xs text-blue-600 border-blue-300 hover:bg-blue-50" onClick={() => { setInviteClientId(c.id); setInviteModalOpen(true); }}>Invite</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader><CardTitle>FTE Efficiency Scores</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">Portfolio Average</p>
              <p className="font-bold text-emerald-600">{avgFte}%</p>
            </div>
            {SENTIMENT_CLIENTS.map(c => (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <p>{c.name}</p>
                  <p className={`font-medium ${c.fte >= 90 ? 'text-emerald-600' : c.fte >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{c.fte}%</p>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className={`h-2 rounded-full ${c.fte >= 90 ? 'bg-emerald-500' : c.fte >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${c.fte}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader><CardTitle>RFID Hardware Tracking</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left"><tr>
                  <th className="px-3 py-2">Cleaner</th><th className="px-3 py-2">Current Location</th>
                  <th className="px-3 py-2">Status</th><th className="px-3 py-2">Efficiency</th>
                </tr></thead>
                <tbody>
                  {RFID_CLEANERS.map(r => (
                    <tr key={r.id} className="border-t border-border/40">
                      <td className="px-3 py-2 font-medium">{r.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.location}</td>
                      <td className="px-3 py-2"><Badge className={r.status === 'On Site' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}>{r.status}</Badge></td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted">
                            <div className={`h-2 rounded-full ${r.efficiency >= 90 ? 'bg-emerald-500' : r.efficiency >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${r.efficiency}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${r.efficiency >= 90 ? 'text-emerald-600' : r.efficiency >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{r.efficiency}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-blue-500/40 bg-gradient-to-br from-blue-500/10 via-background to-emerald-500/10">
          <CardHeader><CardTitle>AI Insights — Client Health</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Rainier Community Bank HQ is 34 days without positive feedback — immediate account manager intervention recommended.</p>
            <p>• Emerald Office Tower NPS dropped 12 points in 30 days. Lobby miss on 2026-04-14 is likely the trigger — schedule service recovery call.</p>
            <p>• Harbor Medical Pavilion and Puget Cardiology are strong promoters — ideal for referral program outreach this quarter.</p>
            <p>• Portfolio FTE average of {avgFte}% is above the 85% operational benchmark — team efficiency is healthy.</p>
            <p>• 3 of 5 clients are Medium–High risk, representing {currency(atRiskMrr)}/mo in at-risk MRR.</p>
          </CardContent>
        </Card>

        <Dialog open={signalClientOpen} onOpenChange={setSignalClientOpen}>
          <DialogContent className="rounded-3xl sm:max-w-md">
            <DialogHeader><DialogTitle>Signal At-Risk Client</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Client: <strong>{signalClient?.name ?? '—'}</strong></p>
              <div className="space-y-1">
                <Label>Notes for Account Manager</Label>
                <Textarea className="min-h-24 rounded-2xl" placeholder="Describe the issue, urgency, and recommended action…" value={signalNotes} onChange={e => setSignalNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={() => setSignalClientOpen(false)}>Cancel</Button>
              <Button className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white" onClick={() => { setSignalClientOpen(false); setSignalNotes(''); }}>Send Signal →</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ── render: legal & consent tab ──
  const renderLegalConsent = () => {
    const consentedCount = STAFF_LIST.filter(s => s.consentGiven).length;
    const activeCount    = Object.values(staffTrackingEnabled).filter(Boolean).length;
    const pendingCount   = STAFF_LIST.filter(s => !s.consentGiven).length;
    return (
      <div className="space-y-4">
        <div className="flex gap-2 rounded-2xl bg-muted/40 p-1">
          <Button variant={consentSubTab === 'policy' ? 'default' : 'ghost'} className="rounded-xl flex-1" onClick={() => setConsentSubTab('policy')}>Policy &amp; Toggles</Button>
          <Button variant={consentSubTab === 'staff' ? 'default' : 'ghost'} className="rounded-xl flex-1" onClick={() => setConsentSubTab('staff')}>Staff Consent</Button>
          <Button variant={consentSubTab === 'mobile' ? 'default' : 'ghost'} className="rounded-xl flex-1" onClick={() => setConsentSubTab('mobile')}>Mobile App Code</Button>
        </div>

        {consentSubTab === 'policy' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-blue-500/30 bg-blue-500/5">
              <CardHeader><CardTitle className="text-base">Geo-Tracking &amp; Location Policy</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">This policy governs how Kluje (Divitiae Terrae LLC) collects and uses location data for cleaning staff and sub-contractors. By using the Kluje Cleaner App, all staff acknowledge and consent to the following:</p>
                <div className="space-y-2">
                  {[
                    { title: 'Geofencing + GPS — On-Site Only', desc: 'Tracking activates automatically when a cleaner enters the job-site geofence (50–100 metres around the building). Tracking stops automatically on exit. No tracking occurs during commute, personal time, or outside work hours.' },
                    { title: 'Automatic Start & Stop', desc: 'No manual action required from the cleaner. The Kluje app detects arrival and departure via GPS geofencing. Cleaners receive a phone notification when tracking becomes active or inactive.' },
                    { title: 'NFC Check-In (Optional Fallback)', desc: 'In buildings with poor GPS signal, cleaners may use an NFC tag mounted at the entry point. NFC records time, date, and staff ID only — no continuous location tracking.' },
                    { title: 'Data Collected', desc: 'Time entered job site · Time exited · Location pings every 60 seconds inside geofence · Shift duration · FTE efficiency score. No audio, video, or data outside the geofence is ever collected.' },
                    { title: 'Data Use', desc: 'Collected data is used exclusively for shift verification, FTE efficiency scoring, and client reporting. Data is never sold, shared with third parties, or used for personal profiling.' },
                    { title: 'Data Retention', desc: 'Location pings are retained for 90 days. Shift summaries are retained for 2 years for payroll and compliance purposes. Staff may request deletion at any time by contacting marcus@kluje.com.' },
                    { title: 'Right to Revoke', desc: 'Any staff member may revoke tracking consent at any time via the app or by notifying management. Revoking disables geofence tracking for that individual — time records will then require manual entry.' },
                  ].map(item => (
                    <div key={item.title} className="rounded-2xl border border-border/60 p-3 space-y-1">
                      <p className="font-semibold text-xs">{item.title}</p>
                      <p className="text-muted-foreground text-xs">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Company-Wide Tracking</CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{companyTrackingEnabled ? 'Enabled' : 'Disabled'}</span>
                  <button
                    className={`relative h-6 w-11 rounded-full transition-colors ${companyTrackingEnabled ? 'bg-emerald-500' : 'bg-muted'}`}
                    onClick={() => setCompanyTrackingEnabled(v => !v)}
                    aria-label="Toggle company tracking"
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${companyTrackingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-muted-foreground">{companyTrackingEnabled ? 'Geofencing and GPS tracking is ENABLED for all staff who have given consent.' : 'Tracking is DISABLED company-wide. All geo-tracking has been paused for all staff.'}</p>
                <p className="text-xs text-muted-foreground">Consented: <strong>{consentedCount} / {STAFF_LIST.length}</strong> · Tracking active: <strong>{activeCount}</strong> · Pending consent: <strong>{pendingCount}</strong></p>
              </CardContent>
            </Card>
          </div>
        )}

        {consentSubTab === 'staff' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="rounded-3xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-600">Consent Given</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-emerald-600">{consentedCount}</p></CardContent></Card>
              <Card className="rounded-3xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-600">Tracking Active</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-blue-600">{activeCount}</p></CardContent></Card>
              <Card className="rounded-3xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-amber-600">Pending Consent</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-600">{pendingCount}</p></CardContent></Card>
            </div>
            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Staff &amp; Sub-Contractor Tracking</CardTitle>
                <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setStaffTrackingEnabled(Object.fromEntries(STAFF_LIST.map(s => [s.id, false])))}>Revoke All</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-2xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left"><tr>
                      <th className="px-3 py-2">Name</th><th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">Consent Date</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Tracking</th>
                    </tr></thead>
                    <tbody>
                      {STAFF_LIST.map(s => (
                        <tr key={s.id} className="border-t border-border/40">
                          <td className="px-3 py-2 font-medium">{s.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{s.role}</td>
                          <td className="px-3 py-2 text-muted-foreground">{s.consentDate || '—'}</td>
                          <td className="px-3 py-2"><Badge className={s.consentGiven ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}>{s.consentGiven ? 'Consented' : 'Pending'}</Badge></td>
                          <td className="px-3 py-2">
                            {s.consentGiven ? (
                              <button
                                className={`relative h-6 w-11 rounded-full transition-colors ${staffTrackingEnabled[s.id] && companyTrackingEnabled ? 'bg-emerald-500' : 'bg-muted'}`}
                                onClick={() => setStaffTrackingEnabled(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                                disabled={!companyTrackingEnabled}
                                aria-label={`Toggle tracking for ${s.name}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${staffTrackingEnabled[s.id] && companyTrackingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                              </button>
                            ) : (
                              <Button size="sm" variant="outline" className="rounded-xl text-xs">Send Request</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardHeader><CardTitle className="text-base">Consent History</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-2xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left"><tr>
                      <th className="px-3 py-2">Staff</th><th className="px-3 py-2">Action</th>
                      <th className="px-3 py-2">Date</th><th className="px-3 py-2">Method</th>
                    </tr></thead>
                    <tbody>
                      {CONSENT_HISTORY.map(ch => (
                        <tr key={ch.id} className="border-t border-border/40">
                          <td className="px-3 py-2 font-medium">{ch.staff}</td>
                          <td className="px-3 py-2"><Badge className={ch.action.includes('given') ? 'bg-emerald-500/20 text-emerald-700 border-0' : ch.action.includes('paused') ? 'bg-amber-500/20 text-amber-700 border-0' : 'bg-blue-500/20 text-blue-700 border-0'}>{ch.action}</Badge></td>
                          <td className="px-3 py-2 text-muted-foreground">{ch.date}</td>
                          <td className="px-3 py-2 text-muted-foreground">{ch.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {consentSubTab === 'mobile' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-blue-500/30 bg-blue-500/5">
              <CardHeader><CardTitle className="text-base">Geo-Tracking Mobile App — React Native / Expo</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>The Kluje Cleaner App uses Expo Location's geofencing and background location APIs. Tracking is fully automatic — no cleaner interaction required beyond the one-time consent screen on first install.</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['expo-location', 'expo-task-manager', 'expo-notifications', 'react-native-nfc-manager (opt)'].map(pkg => (
                    <code key={pkg} className="rounded bg-muted px-2 py-0.5 text-xs">{pkg}</code>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="pt-4">
                <pre className="overflow-x-auto rounded-2xl bg-muted/60 p-4 text-xs font-mono text-foreground whitespace-pre leading-relaxed">{GEO_TRACKING_CODE}</pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

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
      case 'clients': return renderClients();
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
      case 'client-sentiment': return renderClientSentiment();
      case 'legal-consent': return renderLegalConsent();
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
          <div className="space-y-1">
            <div className="flex w-full flex-wrap gap-2 rounded-2xl bg-muted/40 p-1">
              {([
                { key: 'contracts', label: 'Active Contracts' },
                { key: 'clients',   label: 'Clients' },
                { key: 'proposal',  label: 'New Bid / Proposal' },
                { key: 'pipeline',  label: 'Pipeline' },
              ] as const).map(tab => (
                <Button key={tab.key} variant={topTab === tab.key ? 'default' : 'ghost'} className="rounded-xl" onClick={() => setTopTab(tab.key)}>
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className="flex w-full flex-wrap gap-2 rounded-2xl bg-muted/30 p-1">
              {([
                { key: 'sales-reports',    label: 'AI Report' },
                { key: 'client-sentiment', label: 'Client Sentiment' },
                { key: 'history',          label: 'Historical Jobs' },
                { key: 'calculator',       label: 'Pricing Calculator' },
                { key: 'walkthroughs',     label: 'Walkthroughs' },
                { key: 'subscription',     label: 'Subscription' },
                { key: 'legal-consent',    label: 'Legal & Consent' },
              ] as const).map(tab => (
                <Button key={tab.key} variant={topTab === tab.key ? 'secondary' : 'ghost'} className="rounded-xl text-sm" onClick={() => setTopTab(tab.key)}>
                  {tab.label}
                </Button>
              ))}
            </div>
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
      {renderCostingWizard()}
      {renderQuoteEmailModal()}
      {renderStripeCheckoutModal()}
      {renderInvoiceModal()}
      {renderInviteModal()}
    </div>
  );
}
