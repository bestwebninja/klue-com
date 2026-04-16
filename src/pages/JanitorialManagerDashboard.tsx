import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CrmStatus = "Lead" | "Opportunity" | "Won" | "Lost" | "Active";
type PipelineColumn = "Leads" | "Opportunities" | "Won Contracts" | "Lost / Archived";

type Area = { id: string; name: string; sqft: number; cleaningRate: number; complexity: number };
type ScopeRow = { id: string; task: string; frequency: string; minutesPerVisit: number; notes: string };

type EmailLog = { id: string; to: string; subject: string; body: string; sentAt: string; attachmentName: string };
type ClientBuilding = { name: string; location: string; sqft: number; status: string };
type Client = {
  id: string;
  clientName: string;
  location: string;
  primaryContact: string;
  email: string;
  phone: string;
  totalContractValue: number;
  lastProposalDate: string;
  numberOfBuildings: number;
  crmStatus: CrmStatus;
  buildingType: string;
  notes: string;
  buildings: ClientBuilding[];
  emailLog: EmailLog[];
};
type Lead = {
  id: string;
  clientId: string;
  clientName: string;
  location: string;
  buildingType: string;
  estimatedMonthlyValue: number;
  lastActivity: string;
  aiConfidence: number;
  source: string;
  notes: string;
};
type Opportunity = {
  id: string;
  clientId: string;
  clientName: string;
  location: string;
  buildingType: string;
  estimatedMonthlyValue: number;
  lastActivity: string;
  aiConfidence: number;
  proposalId: string;
  stage: string;
};
type Contract = {
  id: string;
  clientId: string;
  contractName: string;
  client: string;
  location: string;
  monthlyValue: number;
  nextVisit: string;
  status: string;
};
type PipelineItem = {
  id: string;
  clientId: string;
  clientName: string;
  location: string;
  buildingType: string;
  estimatedMonthlyValue: number;
  lastActivity: string;
  aiConfidence: number;
  column: PipelineColumn;
};

type SettingsState = {
  laborRate: number;
  otherDirect: number;
  suppliesPct: number;
  overheadPct: number;
  profitPct: number;
  apiProvider: string;
  apiKey: string;
  useLiveAI: boolean;
  systemPrompt: string;
  internalCrmEnabled: boolean;
  crmProvider: "None" | "Jobber" | "Housecall Pro" | "QuoteIQ" | "CleanGuru" | "Custom";
  autoPushWonProposals: boolean;
  syncHistoricalJobs: boolean;
  defaultEmailProvider: "Gmail" | "Outlook" | "Custom SMTP";
};

type ResultState = {
  summary: {
    cleanableSqFt: number;
    frequencyPerWeek: number;
    visitsPerMonth: number;
    monthlyRecurring: number;
    perVisit: number;
    oneTime: number;
    perSqFtRate: number;
    locationNote: string;
  };
  areas: Array<Area & { estimatedHoursPerVisit: number }>;
  scope: ScopeRow[];
  pricing: {
    laborRate: number;
    hoursPerVisit: number;
    directSubtotal: number;
    overheadPercent: number;
    overheadAmount: number;
    profitPercent: number;
    profitAmount: number;
    totalPerVisit: number;
    monthlyTotal: number;
    oneTimeTotal: number;
    lineItems: Array<{ item: string; amount: number; note?: string }>;
    historicalComparison: string;
  };
  internalHandoff: { staffingEstimate: string; keyNotes: string[]; complianceFlags: string[] };
};

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

const uid = () => Math.random().toString(36).slice(2, 10);
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function computeResult(areas: Area[], scope: ScopeRow[], settings: SettingsState, buildingType: string, frequencyPerWeek = 5): ResultState {
  const cleanableSqFt = areas.reduce((a, b) => a + b.sqft, 0);
  const areaHours = areas.map((a) => ({ ...a, estimatedHoursPerVisit: a.sqft / Math.max(a.cleaningRate, 1) + a.complexity * 0.2 }));
  const scopeHours = scope.reduce((acc, row) => acc + row.minutesPerVisit / 60, 0);
  const hoursPerVisit = areaHours.reduce((a, b) => a + b.estimatedHoursPerVisit, 0) + scopeHours;
  const labor = hoursPerVisit * settings.laborRate;
  const suppliesPct = buildingType.toLowerCase().includes("medical") ? Math.max(settings.suppliesPct, 8) : settings.suppliesPct;
  const supplies = labor * (suppliesPct / 100);
  const directSubtotal = labor + supplies + settings.otherDirect;
  const overheadAmount = directSubtotal * (settings.overheadPct / 100);
  const profitAmount = (directSubtotal + overheadAmount) * (settings.profitPct / 100);
  const totalPerVisit = directSubtotal + overheadAmount + profitAmount;
  const visitsPerMonth = frequencyPerWeek === 5 ? 21.65 : frequencyPerWeek * 4.33;
  const monthlyTotal = totalPerVisit * visitsPerMonth;
  const oneTimeMultiplier = buildingType.toLowerCase().includes("medical") ? 2.4 : 1.9;
  const oneTimeTotal = totalPerVisit * oneTimeMultiplier;

  return {
    summary: {
      cleanableSqFt,
      frequencyPerWeek,
      visitsPerMonth,
      monthlyRecurring: monthlyTotal,
      perVisit: totalPerVisit,
      oneTime: oneTimeTotal,
      perSqFtRate: monthlyTotal / Math.max(cleanableSqFt, 1),
      locationNote: "Seattle launch profile applied with CleanScope AI v5.0 assumptions.",
    },
    areas: areaHours,
    scope,
    pricing: {
      laborRate: settings.laborRate,
      hoursPerVisit,
      directSubtotal,
      overheadPercent: settings.overheadPct,
      overheadAmount,
      profitPercent: settings.profitPct,
      profitAmount,
      totalPerVisit,
      monthlyTotal,
      oneTimeTotal,
      lineItems: [
        { item: "Labor", amount: labor, note: `${hoursPerVisit.toFixed(2)} hrs @ ${usd(settings.laborRate)}/hr` },
        { item: "Supplies", amount: supplies, note: `${suppliesPct}% of labor` },
        { item: "Other Direct", amount: settings.otherDirect },
        { item: "Overhead", amount: overheadAmount, note: `${settings.overheadPct}% of direct subtotal` },
        { item: "Profit", amount: profitAmount, note: `${settings.profitPct}% margin target` },
      ],
      historicalComparison: "Within Seattle/Tacoma market benchmark range for Class A janitorial scopes.",
    },
    internalHandoff: {
      staffingEstimate: `${Math.max(1, Math.ceil(hoursPerVisit / 3))} team members per shift`,
      keyNotes: ["Client-sensitive entry windows", "Green chemical program preferred", "QA inspections bi-weekly"],
      complianceFlags: ["OSHA logs", "SDS binder onsite", "Badge-access protocol"],
    },
  };
}

function SettingsModal({ open, onOpenChange, settings, onSave }: { open: boolean; onOpenChange: (v: boolean) => void; settings: SettingsState; onSave: (s: SettingsState) => void; }) {
  const [local, setLocal] = useState<SettingsState>(settings);

  React.useEffect(() => setLocal(settings), [settings, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-3xl">
        <DialogHeader><DialogTitle>CleanScope AI v5.0 Settings</DialogTitle></DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">Pricing Settings</CardTitle></CardHeader><CardContent className="space-y-3">
            {[["laborRate","Labor Rate ($/hr)"],["otherDirect","Other Direct Costs ($ per visit)"],["suppliesPct","Supplies %"],["overheadPct","Overhead %"],["profitPct","Profit %"] as const].map(([k,l]) => (
              <div key={k}><Label>{l}</Label><Input type="number" value={local[k]} onChange={(e)=>setLocal((p)=>({...p,[k]:Number(e.target.value)}))} /></div>
            ))}
            <p className="text-xs text-muted-foreground">Overhead covers insurance, vehicles, admin, training, compliance, bad debt.</p>
          </CardContent></Card>
          <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">CRM & Email Settings</CardTitle></CardHeader><CardContent className="space-y-3">
            <div className="flex items-center justify-between"><Label>Internal CRM Enabled</Label><Switch checked={local.internalCrmEnabled} onCheckedChange={(v)=>setLocal((p)=>({...p,internalCrmEnabled:v}))} /></div>
            <div><Label>CRM Provider</Label><Select value={local.crmProvider} onValueChange={(v: SettingsState["crmProvider"])=>setLocal((p)=>({...p,crmProvider:v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["None","Jobber","Housecall Pro","QuoteIQ","CleanGuru","Custom"].map((x)=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-center justify-between"><Label>Auto-push won proposals</Label><Switch checked={local.autoPushWonProposals} onCheckedChange={(v)=>setLocal((p)=>({...p,autoPushWonProposals:v}))} /></div>
            <div className="flex items-center justify-between"><Label>Sync historical jobs</Label><Switch checked={local.syncHistoricalJobs} onCheckedChange={(v)=>setLocal((p)=>({...p,syncHistoricalJobs:v}))} /></div>
            <div><Label>Default Email Provider</Label><Select value={local.defaultEmailProvider} onValueChange={(v: SettingsState["defaultEmailProvider"])=>setLocal((p)=>({...p,defaultEmailProvider:v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Gmail","Outlook","Custom SMTP"].map((x)=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
          </CardContent></Card>
        </div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button><Button onClick={()=>{onSave(local);onOpenChange(false);}}>Save Settings</Button></div>
      </DialogContent>
    </Dialog>
  );
}

export default function JanitorialManagerDashboard() {
  const [activeTab, setActiveTab] = useState("active-contracts");
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const [settings, setSettings] = useState<SettingsState>({ laborRate: 48, otherDirect: 85, suppliesPct: 7, overheadPct: 18, profitPct: 22, apiProvider: "OpenAI", apiKey: "", useLiveAI: false, systemPrompt: DEFAULT_SYSTEM_PROMPT, internalCrmEnabled: true, crmProvider: "Jobber", autoPushWonProposals: true, syncHistoricalJobs: true, defaultEmailProvider: "Gmail" });

  const [areas, setAreas] = useState<Area[]>([{ id: uid(), name: "Office Floor", sqft: 24000, cleaningRate: 4500, complexity: 2 }, { id: uid(), name: "Restrooms", sqft: 1800, cleaningRate: 1200, complexity: 3 }]);
  const [scope, setScope] = useState<ScopeRow[]>([{ id: uid(), task: "Trash removal", frequency: "Daily", minutesPerVisit: 45, notes: "All bins + liners" }, { id: uid(), task: "Restroom sanitization", frequency: "Daily", minutesPerVisit: 65, notes: "Medical-grade disinfectant" }]);

  const [clients, setClients] = useState<Client[]>([
    { id: "c1", clientName: "Rainier Medical Center", location: "Seattle, WA", primaryContact: "Dana Brooks", email: "dana@rainiermed.com", phone: "206-555-0141", totalContractValue: 552000, lastProposalDate: "2026-04-10", numberOfBuildings: 3, crmStatus: "Active", buildingType: "Medical", notes: "Needs terminal clean protocol", buildings: [{ name: "Main Clinic", location: "Capitol Hill", sqft: 52000, status: "Active" }], emailLog: [{ id: uid(), to: "dana@rainiermed.com", subject: "Q2 scope update", body: "Updated", sentAt: "2026-04-12", attachmentName: "Proposal.pdf" }] },
    { id: "c2", clientName: "Tacoma Harbor Offices", location: "Tacoma, WA", primaryContact: "Lewis Hart", email: "lewis@harboroffices.com", phone: "253-555-0109", totalContractValue: 210000, lastProposalDate: "2026-04-05", numberOfBuildings: 2, crmStatus: "Opportunity", buildingType: "Office", notes: "Evening crew preferred", buildings: [{ name: "Tower A", location: "Downtown Tacoma", sqft: 28000, status: "Proposal" }], emailLog: [] },
    { id: "c3", clientName: "Bellevue Retail Commons", location: "Bellevue, WA", primaryContact: "Anita Singh", email: "anita@bretail.com", phone: "425-555-0116", totalContractValue: 180000, lastProposalDate: "2026-03-29", numberOfBuildings: 4, crmStatus: "Lead", buildingType: "Retail", notes: "Weekend deep clean option", buildings: [{ name: "Commons East", location: "Bellevue", sqft: 19000, status: "Lead" }], emailLog: [] },
    { id: "c4", clientName: "Kent Industrial Park", location: "Kent, WA", primaryContact: "Marco Lee", email: "marco@kentip.com", phone: "253-555-0188", totalContractValue: 330000, lastProposalDate: "2026-04-11", numberOfBuildings: 5, crmStatus: "Active", buildingType: "Industrial", notes: "Forklift lanes daily", buildings: [{ name: "Plant 4", location: "Kent", sqft: 74000, status: "Active" }], emailLog: [] },
    { id: "c5", clientName: "Everett Commerce Plaza", location: "Everett, WA", primaryContact: "Kim Alvarez", email: "kim@eplaza.com", phone: "425-555-0190", totalContractValue: 248000, lastProposalDate: "2026-04-08", numberOfBuildings: 2, crmStatus: "Opportunity", buildingType: "Mixed Office", notes: "Add day porter", buildings: [{ name: "North Building", location: "Everett", sqft: 33000, status: "Opportunity" }], emailLog: [] },
    { id: "c6", clientName: "Seattle Biotech Campus", location: "Seattle, WA", primaryContact: "Riley Tran", email: "riley@biocampus.com", phone: "206-555-0177", totalContractValue: 680000, lastProposalDate: "2026-04-14", numberOfBuildings: 6, crmStatus: "Lead", buildingType: "Medical", notes: "Cleanroom-adjacent areas", buildings: [{ name: "Lab Annex", location: "South Lake Union", sqft: 88000, status: "Lead" }], emailLog: [] },
  ]);

  const [leads, setLeads] = useState<Lead[]>([{ id: uid(), clientId: "c3", clientName: "Bellevue Retail Commons", location: "Bellevue, WA", buildingType: "Retail", estimatedMonthlyValue: 14000, lastActivity: "2026-04-12", aiConfidence: 81, source: "Walkthrough", notes: "Price sensitive" }]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([{ id: uid(), clientId: "c2", clientName: "Tacoma Harbor Offices", location: "Tacoma, WA", buildingType: "Office", estimatedMonthlyValue: 17500, lastActivity: "2026-04-15", aiConfidence: 87, proposalId: "P-2201", stage: "Review" }]);
  const [contracts, setContracts] = useState<Contract[]>([{ id: uid(), clientId: "c1", contractName: "Rainier Medical Annual", client: "Rainier Medical Center", location: "Seattle, WA", monthlyValue: 46000, nextVisit: "2026-04-17", status: "Active" }]);
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([{ id: uid(), clientId: "c3", clientName: "Bellevue Retail Commons", location: "Bellevue, WA", buildingType: "Retail", estimatedMonthlyValue: 14000, lastActivity: "2026-04-12", aiConfidence: 81, column: "Leads" }, { id: uid(), clientId: "c2", clientName: "Tacoma Harbor Offices", location: "Tacoma, WA", buildingType: "Office", estimatedMonthlyValue: 17500, lastActivity: "2026-04-15", aiConfidence: 87, column: "Opportunities" }]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  const result = useMemo(() => computeResult(areas, scope, settings, "Medical", 5), [areas, scope, settings]);

  const [emailDraft, setEmailDraft] = useState({ to: clients[0]?.email ?? "", subject: "Janitorial Services Proposal - Main Building", body: `Hi,

Thank you for the walkthrough. Your proposed recurring janitorial price is ${usd(result.summary.monthlyRecurring)} per month.

Scope highlights:
- Daily trash + restroom sanitization
- Common area detailing
- Quality assurance inspections

Optional one-time deep clean: ${usd(result.summary.oneTime)}.

Best regards,
Janitorial Manager Team`, attachmentName: "Proposal.pdf" });

  const addOrUpdatePipeline = (client: Client, column: PipelineColumn, value: number) => {
    setPipelineItems((prev) => {
      const existing = prev.find((p) => p.clientId === client.id);
      if (existing) return prev.map((p) => p.clientId === client.id ? { ...p, column, estimatedMonthlyValue: value, lastActivity: new Date().toISOString().slice(0, 10) } : p);
      return [...prev, { id: uid(), clientId: client.id, clientName: client.clientName, location: client.location, buildingType: client.buildingType, estimatedMonthlyValue: value, lastActivity: new Date().toISOString().slice(0, 10), aiConfidence: 88, column }];
    });
  };

  const markWon = (clientId: string, monthlyValue: number) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    addOrUpdatePipeline(client, "Won Contracts", monthlyValue);
    setClients((prev) => prev.map((c) => c.id === clientId ? { ...c, crmStatus: "Active", totalContractValue: Math.max(c.totalContractValue, monthlyValue * 12) } : c));
    setContracts((prev) => prev.some((x) => x.clientId === clientId) ? prev : [...prev, { id: uid(), clientId, contractName: `${client.clientName} Service Contract`, client: client.clientName, location: client.location, monthlyValue, nextVisit: new Date(Date.now() + 86400000).toISOString().slice(0, 10), status: "Active" }]);
  };

  const filteredClients = clients.filter((c) => {
    if (clientFilter === "All Clients") return true;
    if (clientFilter === "Seattle") return c.location.includes("Seattle");
    if (clientFilter === "Medical") return c.buildingType.includes("Medical");
    if (clientFilter === "High Value") return c.totalContractValue >= 300000;
    if (clientFilter === "Leads") return c.crmStatus === "Lead";
    if (clientFilter === "Active") return c.crmStatus === "Active";
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-4 text-foreground md:p-6">
      <div className="mb-4 rounded-3xl bg-gradient-to-r from-sky-800 via-blue-700 to-indigo-700 p-6 text-white">
        <h1 className="text-2xl font-bold">Janitorial Manager</h1>
        <p className="text-sm text-blue-100">Powered by CleanScope AI v5.0</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 h-auto flex-wrap rounded-2xl p-1">
          <TabsTrigger value="active-contracts">Active Janitorial Contracts</TabsTrigger>
          <TabsTrigger value="historical-jobs">Historical Janitorial Jobs</TabsTrigger>
          <TabsTrigger value="walkthroughs">Janitorial Walkthroughs</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="calculator">Janitorial Pricing Calculator</TabsTrigger>
          <TabsTrigger value="new-bid">New Bid / Proposal</TabsTrigger>
        </TabsList>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <TabsContent value="active-contracts" className="mt-0">
              <Card className="rounded-2xl"><CardHeader><CardTitle>Active Janitorial Contracts</CardTitle></CardHeader><CardContent>
                <Table><TableHeader><TableRow><TableHead>Contract</TableHead><TableHead>Client</TableHead><TableHead>Location</TableHead><TableHead>Monthly</TableHead><TableHead>Next Visit</TableHead></TableRow></TableHeader><TableBody>{contracts.map((c)=><TableRow key={c.id}><TableCell>{c.contractName}</TableCell><TableCell>{c.client}</TableCell><TableCell>{c.location}</TableCell><TableCell>{usd(c.monthlyValue)}</TableCell><TableCell>{c.nextVisit}</TableCell></TableRow>)}</TableBody></Table>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="historical-jobs" className="mt-0"><Card className="rounded-2xl"><CardHeader><CardTitle>Historical Janitorial Jobs</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Seattle launch dataset synced: 118 completed jobs, 96% QA pass rate.</CardContent></Card></TabsContent>
            <TabsContent value="walkthroughs" className="mt-0"><Card className="rounded-2xl"><CardHeader><CardTitle>Janitorial Walkthroughs</CardTitle></CardHeader><CardContent className="text-sm">Upcoming: Rainier Medical (Apr 18), Kent Industrial (Apr 20), Everett Plaza (Apr 22).</CardContent></Card></TabsContent>

            <TabsContent value="pipeline" className="mt-0">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {(["Leads", "Opportunities", "Won Contracts", "Lost / Archived"] as PipelineColumn[]).map((col) => (
                  <Card key={col} className="rounded-2xl"><CardHeader><CardTitle className="text-base">{col}</CardTitle></CardHeader><CardContent className="space-y-2">{pipelineItems.filter((p)=>p.column===col).map((p)=><div key={p.id} className="rounded-xl border p-3 text-sm"><div className="font-semibold">{p.clientName}</div><div>{p.location} · {p.buildingType}</div><div>{usd(p.estimatedMonthlyValue)} · AI {p.aiConfidence}%</div><div className="mt-2 flex gap-2"><Button size="sm" variant="outline" onClick={()=>setActiveTab("new-bid")}>Convert to Proposal</Button><Button size="sm" onClick={()=>markWon(p.clientId,p.estimatedMonthlyValue)}>Mark as Won</Button></div></div>)}</CardContent></Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="clients" className="mt-0 space-y-3">
              <div className="flex flex-wrap gap-2">{["All Clients", "Seattle", "Medical", "High Value", "Leads", "Active"].map((f)=><Button key={f} variant={clientFilter===f?"default":"outline"} onClick={()=>setClientFilter(f)}>{f}</Button>)}</div>
              <Card className="rounded-2xl"><CardContent className="pt-4">
                <Table><TableHeader><TableRow><TableHead>Client Name</TableHead><TableHead>Location</TableHead><TableHead>Primary Contact</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Total Contract Value</TableHead><TableHead>Last Proposal Date</TableHead><TableHead># Buildings</TableHead><TableHead>CRM Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filteredClients.map((c)=><TableRow key={c.id}><TableCell>{c.clientName}</TableCell><TableCell>{c.location}</TableCell><TableCell>{c.primaryContact}</TableCell><TableCell>{c.email}</TableCell><TableCell>{c.phone}</TableCell><TableCell>{usd(c.totalContractValue)}</TableCell><TableCell>{c.lastProposalDate}</TableCell><TableCell>{c.numberOfBuildings}</TableCell><TableCell><Badge>{c.crmStatus}</Badge></TableCell><TableCell className="space-x-2"><Button size="sm" variant="outline" onClick={()=>setSelectedClient(c)}>View Details</Button><Button size="sm" variant="outline" onClick={()=>setActiveTab("new-bid")}>New Proposal</Button><Button size="sm" onClick={()=>console.log("Sync to External CRM", c.clientName)}>Sync to External CRM</Button></TableCell></TableRow>)}</TableBody></Table>
              </CardContent></Card>

              {selectedClient && (
                <Card className="rounded-2xl"><CardHeader><CardTitle>{selectedClient.clientName} Details</CardTitle></CardHeader><CardContent className="space-y-3">
                  <div className="text-sm">{selectedClient.notes}</div>
                  <div className="space-y-1 text-sm"><div className="font-medium">Email Log</div>{selectedClient.emailLog.map((e)=><div key={e.id} className="rounded-lg border p-2">{e.subject} · {e.to} · {e.sentAt} · {e.attachmentName}</div>)}</div>
                </CardContent></Card>
              )}
            </TabsContent>

            <TabsContent value="calculator" className="mt-0"><Card className="rounded-2xl"><CardHeader><CardTitle>Janitorial Pricing Calculator</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><div>Per Visit: {usd(result.summary.perVisit)}</div><div>Monthly: {usd(result.summary.monthlyRecurring)}</div><div>One-Time: {usd(result.summary.oneTime)}</div><Button variant="outline" onClick={()=>setActiveTab("new-bid")}>Convert to Full Bid</Button></CardContent></Card></TabsContent>

            <TabsContent value="new-bid" className="mt-0 space-y-4">
              <Card className="rounded-2xl"><CardHeader><CardTitle>Multimodal Capture</CardTitle></CardHeader><CardContent>
                <Tabs defaultValue="typed-form"><TabsList><TabsTrigger value="typed-form">Typed Form</TabsTrigger><TabsTrigger value="voice-notes">Voice Notes</TabsTrigger><TabsTrigger value="photos">Photos</TabsTrigger><TabsTrigger value="floor-plan">Floor Plan</TabsTrigger></TabsList>
                  <TabsContent value="typed-form" className="space-y-2"><Label>Site Notes</Label><Textarea placeholder="Building notes..." /></TabsContent>
                  <TabsContent value="voice-notes">Voice capture ready.</TabsContent>
                  <TabsContent value="photos">Photo upload placeholder.</TabsContent>
                  <TabsContent value="floor-plan">Floor plan capture placeholder.</TabsContent>
                </Tabs>
              </CardContent></Card>

              <Card className="rounded-2xl"><CardHeader><CardTitle>Editable Areas</CardTitle></CardHeader><CardContent className="space-y-2">{areas.map((a,idx)=><div key={a.id} className="grid grid-cols-4 gap-2"><Input value={a.name} onChange={(e)=>setAreas((p)=>p.map((x,i)=>i===idx?{...x,name:e.target.value}:x))}/><Input type="number" value={a.sqft} onChange={(e)=>setAreas((p)=>p.map((x,i)=>i===idx?{...x,sqft:Number(e.target.value)}:x))}/><Input type="number" value={a.cleaningRate} onChange={(e)=>setAreas((p)=>p.map((x,i)=>i===idx?{...x,cleaningRate:Number(e.target.value)}:x))}/><Input type="number" value={a.complexity} onChange={(e)=>setAreas((p)=>p.map((x,i)=>i===idx?{...x,complexity:Number(e.target.value)}:x))}/></div>)}</CardContent></Card>

              <Card className="rounded-2xl"><CardHeader><CardTitle>Editable Scope + Pricing Transparency</CardTitle></CardHeader><CardContent className="space-y-2">{scope.map((s,idx)=><div key={s.id} className="grid grid-cols-4 gap-2"><Input value={s.task} onChange={(e)=>setScope((p)=>p.map((x,i)=>i===idx?{...x,task:e.target.value}:x))}/><Input value={s.frequency} onChange={(e)=>setScope((p)=>p.map((x,i)=>i===idx?{...x,frequency:e.target.value}:x))}/><Input type="number" value={s.minutesPerVisit} onChange={(e)=>setScope((p)=>p.map((x,i)=>i===idx?{...x,minutesPerVisit:Number(e.target.value)}:x))}/><Input value={s.notes} onChange={(e)=>setScope((p)=>p.map((x,i)=>i===idx?{...x,notes:e.target.value}:x))}/></div>)}
                <div className="rounded-xl border p-3 text-sm">{result.pricing.lineItems.map((li)=><div key={li.item} className="flex justify-between"><span>{li.item} {li.note ? `(${li.note})` : ""}</span><span>{usd(li.amount)}</span></div>)}</div>
                <div className="grid gap-2 md:grid-cols-2"><div>Per Visit: {usd(result.summary.perVisit)}</div><div>Monthly: {usd(result.summary.monthlyRecurring)}</div><div>One-time: {usd(result.summary.oneTime)}</div><div>Rate/SqFt: {result.summary.perSqFtRate.toFixed(2)}</div></div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" onClick={() => {
                    const c = clients[0];
                    setLeads((prev) => [...prev, { id: uid(), clientId: c.id, clientName: c.clientName, location: c.location, buildingType: c.buildingType, estimatedMonthlyValue: result.summary.monthlyRecurring, lastActivity: new Date().toISOString().slice(0, 10), aiConfidence: 90, source: "Proposal", notes: "Saved from bid" }]);
                    setClients((prev)=>prev.map((x)=>x.id===c.id?{...x,crmStatus:"Lead",lastProposalDate:new Date().toISOString().slice(0,10)}:x));
                    addOrUpdatePipeline(c, "Leads", result.summary.monthlyRecurring);
                  }}>Save as Lead</Button>
                  <Button variant="outline" onClick={() => {
                    const c = clients[0];
                    setOpportunities((prev) => [...prev, { id: uid(), clientId: c.id, clientName: c.clientName, location: c.location, buildingType: c.buildingType, estimatedMonthlyValue: result.summary.monthlyRecurring, lastActivity: new Date().toISOString().slice(0, 10), aiConfidence: 92, proposalId: uid(), stage: "Proposal Sent" }]);
                    setClients((prev)=>prev.map((x)=>x.id===c.id?{...x,crmStatus:"Opportunity"}:x));
                    addOrUpdatePipeline(c, "Opportunities", result.summary.monthlyRecurring);
                  }}>Create Opportunity</Button>
                  <Button onClick={() => markWon(clients[0].id, result.summary.monthlyRecurring)}>Mark as Won & Create Contract</Button>
                  <Button variant="secondary" onClick={() => { setEmailDraft((d)=>({...d,to:clients[0]?.email || d.to,subject:`Janitorial Services Proposal - ${areas[0]?.name || "Building"}`})); setEmailOpen(true); }}>Send Proposal via Email</Button>
                </div>
              </CardContent></Card>
            </TabsContent>
          </div>

          <div className="space-y-4">
            <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">Quick Settings</CardTitle></CardHeader><CardContent className="space-y-1 text-sm"><div>Labor Rate: {usd(settings.laborRate)}</div><div>Other Direct: {usd(settings.otherDirect)}</div><div>Supplies: {settings.suppliesPct}%</div><div>Overhead: {settings.overheadPct}%</div><div>Profit: {settings.profitPct}%</div><div>CRM Status: {settings.internalCrmEnabled && settings.crmProvider !== "None" ? "Connected" : "Not Connected"}</div><Button className="mt-2 w-full" onClick={()=>setSettingsOpen(true)}>Edit All Settings</Button></CardContent></Card>

            <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-sky-800 via-blue-700 to-indigo-700 text-white shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-base text-white">Quick Links</CardTitle></CardHeader>
              <CardContent className="pt-0"><div className="flex flex-wrap gap-2">{["AI Assistant Chat", "Company Branding", "Labor Rates", "Recent Jobs", "Task Library"].map((item) => (<Button key={item} variant="ghost" className="h-9 rounded-xl bg-white/10 px-3 text-sm font-medium text-white hover:bg-white hover:text-blue-700">{item}</Button>))}</div></CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onSave={setSettings} />

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="rounded-3xl"><DialogHeader><DialogTitle>Send Proposal Email</DialogTitle></DialogHeader>
          <div className="space-y-2"><Label>To</Label><Input value={emailDraft.to} onChange={(e)=>setEmailDraft((p)=>({...p,to:e.target.value}))} /><Label>Subject</Label><Input value={emailDraft.subject} onChange={(e)=>setEmailDraft((p)=>({...p,subject:e.target.value}))} /><Label>Body</Label><Textarea rows={8} value={emailDraft.body} onChange={(e)=>setEmailDraft((p)=>({...p,body:e.target.value}))} /><div className="text-sm">Attachment: {emailDraft.attachmentName}</div></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setEmailOpen(false)}>Cancel</Button><Button onClick={()=>{
            const log: EmailLog = { id: uid(), to: emailDraft.to, subject: emailDraft.subject, body: emailDraft.body, sentAt: new Date().toISOString(), attachmentName: emailDraft.attachmentName };
            console.log("Send email placeholder", log);
            setEmailLogs((prev)=>[log,...prev]);
            setClients((prev)=>prev.map((c)=>c.email===emailDraft.to?{...c,emailLog:[log,...c.emailLog]}:c));
            setEmailOpen(false);
          }}>Send Email</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
