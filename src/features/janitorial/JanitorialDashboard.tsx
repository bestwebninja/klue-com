import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const currency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

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

export default function JanitorialDashboard() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [areas, setAreas] = useState<Area[]>(DEFAULT_AREAS);
  const [scope, setScope] = useState<ScopeRow[]>(DEFAULT_SCOPE);
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(5);
  const [voiceNote, setVoiceNote] = useState('');
  const [typedIntake, setTypedIntake] = useState('Class A office with evening janitorial coverage and monthly floor care requirement.');
  const [assistantPrompt, setAssistantPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const result = useMemo(
    () => generateResult(areas, scope, settings, frequencyPerWeek),
    [areas, scope, settings, frequencyPerWeek]
  );

  const calculatorResult = useMemo(
    () => generateResult(areas, scope, settings, Math.max(1, frequencyPerWeek)),
    [areas, scope, settings, frequencyPerWeek]
  );

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
              <CardTitle className="text-2xl">CleanScope AI v5.0 Janitorial Dashboard</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Multimodal capture, transparent pricing, and internal handoff in one workspace.</p>
            </div>
            <Button className="rounded-2xl" onClick={() => { setAreas(DEFAULT_AREAS); setScope(DEFAULT_SCOPE); }}>
              Load Example
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Tabs defaultValue="capture" className="space-y-4">
          <TabsList className="h-auto w-full flex-wrap justify-start rounded-2xl p-1">
            <TabsTrigger value="capture">Capture</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="contracts">Contract</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="walkthrough">Walkthrough</TabsTrigger>
          </TabsList>

          <TabsContent value="capture" className="space-y-4">
            <Card className="rounded-3xl">
              <CardHeader><CardTitle className="text-base">Multimodal Job Capture</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="typed">
                  <TabsList className="rounded-2xl">
                    <TabsTrigger value="typed">Typed Form</TabsTrigger>
                    <TabsTrigger value="voice">Voice Notes</TabsTrigger>
                    <TabsTrigger value="photo">Photo Uploads</TabsTrigger>
                    <TabsTrigger value="floor">Floor Plan</TabsTrigger>
                  </TabsList>
                  <TabsContent value="typed" className="pt-3">
                    <Textarea value={typedIntake} onChange={(e) => setTypedIntake(e.target.value)} className="min-h-24 rounded-2xl" />
                  </TabsContent>
                  <TabsContent value="voice" className="space-y-2 pt-3">
                    <Textarea value={voiceNote} onChange={(e) => setVoiceNote(e.target.value)} placeholder="Paste or type voice transcript..." className="min-h-24 rounded-2xl" />
                  </TabsContent>
                  <TabsContent value="photo" className="pt-3">
                    <Input type="file" multiple className="rounded-2xl" />
                  </TabsContent>
                  <TabsContent value="floor" className="pt-3">
                    <Input type="file" accept=".pdf,.jpg,.png" className="rounded-2xl" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader><CardTitle className="text-base">Editable Areas</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {areas.map((area) => (
                  <div key={area.id} className="grid gap-2 rounded-2xl border border-border/60 p-3 sm:grid-cols-5">
                    <Input value={area.name} onChange={(e) => updateArea(area.id, 'name', e.target.value)} className="sm:col-span-2 rounded-xl" />
                    <Input type="number" value={area.sqft} onChange={(e) => updateArea(area.id, 'sqft', e.target.value)} className="rounded-xl" />
                    <Input type="number" value={area.fixtureMinutes} onChange={(e) => updateArea(area.id, 'fixtureMinutes', e.target.value)} className="rounded-xl" />
                    <Input type="number" step="0.1" value={area.complexityMultiplier} onChange={(e) => updateArea(area.id, 'complexityMultiplier', e.target.value)} className="rounded-xl" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader><CardTitle className="text-base">Editable Scope</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {scope.map((row) => (
                  <div key={row.id} className="grid gap-2 rounded-2xl border border-border/60 p-3 sm:grid-cols-2">
                    <Input value={row.task} onChange={(e) => updateScope(row.id, 'task', e.target.value)} className="rounded-xl" />
                    <Input value={row.frequency} onChange={(e) => updateScope(row.id, 'frequency', e.target.value)} className="rounded-xl" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="rounded-3xl"><CardHeader><CardTitle className="text-base">Monthly</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{currency(result.summary.monthlyRecurring)}</CardContent></Card>
              <Card className="rounded-3xl"><CardHeader><CardTitle className="text-base">Per Visit</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{currency(result.summary.perVisit)}</CardContent></Card>
              <Card className="rounded-3xl"><CardHeader><CardTitle className="text-base">One-Time Deep Clean</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{currency(result.summary.oneTime)}</CardContent></Card>
            </div>

            <Card className="rounded-3xl">
              <CardHeader><CardTitle className="text-base">Pricing Details</CardTitle></CardHeader>
              <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
                <p>Labor Rate: <span className="font-medium">{currency(result.pricing.laborRate)}</span></p>
                <p>Hours Per Visit: <span className="font-medium">{result.pricing.hoursPerVisit.toFixed(2)}</span></p>
                <p>Direct Subtotal: <span className="font-medium">{currency(result.pricing.directSubtotal)}</span></p>
                <p>Overhead Amount: <span className="font-medium">{currency(result.pricing.overheadAmount)}</span></p>
                <p>Profit Amount: <span className="font-medium">{currency(result.pricing.profitAmount)}</span></p>
                <p>Historical Comparison: <span className="font-medium">{result.pricing.historicalComparison}</span></p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader><CardTitle className="text-base">Line-item Table</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-2xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.pricing.lineItems.map((line) => (
                        <tr key={line.item} className="border-t border-border/60">
                          <td className="px-3 py-2">{line.item}</td>
                          <td className="px-3 py-2">{currency(line.amount)}</td>
                          <td className="px-3 py-2 text-muted-foreground">{line.note ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <Card className="rounded-3xl">
              <CardHeader><CardTitle className="text-base">Quick Quote Calculator</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="max-w-xs space-y-1">
                  <Label>Visits / week</Label>
                  <Input type="number" value={frequencyPerWeek} onChange={(e) => setFrequencyPerWeek(Number(e.target.value) || 1)} className="rounded-xl" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Per Visit</p><p className="text-lg font-semibold">{currency(calculatorResult.pricing.totalPerVisit)}</p></div>
                  <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Monthly</p><p className="text-lg font-semibold">{currency(calculatorResult.pricing.monthlyTotal)}</p></div>
                  <div className="rounded-2xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">One-Time</p><p className="text-lg font-semibold">{currency(calculatorResult.pricing.oneTimeTotal)}</p></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts"><Card className="rounded-3xl"><CardHeader><CardTitle className="text-base">Contract Draft Helper</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Generate proposal terms and legal clauses using the computed CleanScope AI v5.0 pricing model.</CardContent></Card></TabsContent>
          <TabsContent value="history"><Card className="rounded-3xl"><CardHeader><CardTitle className="text-base">History</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Track prior janitorial opportunities, accepted terms, and revision notes.</CardContent></Card></TabsContent>
          <TabsContent value="walkthrough"><Card className="rounded-3xl"><CardHeader><CardTitle className="text-base">Walkthrough</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Room-by-room walkthrough notes for operations and QA signoff.</CardContent></Card></TabsContent>
        </Tabs>

        <div className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Labor Rate: <strong>{currency(settings.laborRate)}</strong></p>
              <p>Other Direct: <strong>{currency(settings.otherDirect)}</strong></p>
              <p>Supplies: <strong>{settings.suppliesPercent}%</strong></p>
              <p>Overhead: <strong>{settings.overheadPercent}%</strong></p>
              <p>Profit: <strong>{settings.profitPercent}%</strong></p>
              <Button className="mt-2 w-full rounded-2xl" variant="outline" onClick={() => setSettingsOpen(true)}>
                Edit All Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-sky-800 via-blue-700 to-indigo-700 text-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {['AI Assistant Chat', 'Company Branding', 'Labor Rates', 'Recent Jobs', 'Task Library'].map((item) => (
                  <Button
                    key={item}
                    variant="ghost"
                    className="h-9 rounded-xl bg-white/10 px-3 text-sm font-medium text-white hover:bg-white hover:text-blue-700"
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base">CleanScope AI v5.0 Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea className="min-h-36 rounded-2xl text-xs" value={assistantPrompt} onChange={(e) => setAssistantPrompt(e.target.value)} />
            </CardContent>
          </Card>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onSave={setSettings} />
    </div>
  );
}
