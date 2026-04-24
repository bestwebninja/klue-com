import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

type AdminUser = {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  company_name: string | null;
  company_id: string | null;
  role: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  cell_number: string | null;
  linkedin_url: string | null;
  trial_expires_at: string | null;
  can_edit_pricing: boolean;
  can_edit_branding: boolean;
  is_frozen: boolean;
  auth_user?: {
    id: string;
    email: string | null;
    created_at: string | null;
    last_sign_in_at: string | null;
    is_banned: boolean;
  } | null;
};
type AdminCompany = { id: string; name: string };

const EMPTY_CREATE_FORM = {
  firstName: "", surname: "", email: "", password: "",
  companyId: "", newCompanyName: "", role: "janitorial_owner",
  city: "", state: "", zip: "", cell: "", linkedin: "",
};

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
type FunnelStage = "Leads" | "Opportunities" | "Won Contracts";
type SalesReportRow = {
  id: string;
  client: string;
  stage: FunnelStage;
  monthlyValue: number;
  annualizedValue: number;
  lastActivity: string;
  source: string;
  confidence: number;
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

  // ── Admin Manager state ──────────────────────────────────────────────
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminCompanies, setAdminCompanies] = useState<AdminCompany[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ ...EMPTY_CREATE_FORM });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const [duplicateEmailPrompt, setDuplicateEmailPrompt] = useState<{ email: string } | null>(null);
  const [findExistingLoading, setFindExistingLoading] = useState(false);
  const [findExistingMsg, setFindExistingMsg] = useState("");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_CREATE_FORM, trial_expires_at: "", can_edit_pricing: false, can_edit_branding: false, is_frozen: false });

  const getInvokeErrorMessage = useCallback(async (
    error: unknown,
    fallbackData?: unknown,
  ) => {
    const dataRecord = (fallbackData && typeof fallbackData === "object")
      ? (fallbackData as Record<string, unknown>)
      : null;
    const errorRecord = (error && typeof error === "object")
      ? (error as Record<string, unknown>)
      : null;

    if (dataRecord?.error && typeof dataRecord.error === "string") {
      const detailParts = [
        dataRecord.error,
        typeof dataRecord.step === "string" ? `(step: ${dataRecord.step})` : null,
        typeof dataRecord.details === "string" ? `details: ${dataRecord.details}` : null,
      ].filter(Boolean);
      return detailParts.join(" ");
    }

    const context = errorRecord?.context;
    if (context && typeof context === "object" && "json" in (context as object)) {
      try {
        const payload = await (context as { json: () => Promise<Record<string, unknown>> }).json();
        if (typeof payload?.error === "string") {
          const detailParts = [
            payload.error,
            typeof payload.step === "string" ? `(step: ${payload.step})` : null,
            typeof payload.details === "string" ? `details: ${payload.details}` : null,
          ].filter(Boolean);
          return detailParts.join(" ");
        }
      } catch {
        // ignore parse errors and use fallback
      }
    }

    return typeof errorRecord?.message === "string"
      ? errorRecord.message
      : "Edge function request failed";
  }, []);

  const loadAdminData = useCallback(async () => {
    setAdminLoading(true);
    setAdminError("");
    const { data, error } = await supabase.functions.invoke("janitorial-admin-users", {
      body: { action: "list" },
    });
    setAdminLoading(false);
    if (error) {
      console.error("janitorial-admin-users list error", error);
      const message = await getInvokeErrorMessage(error, data);
      setAdminError(message);
      return;
    }
    setAdminUsers(data?.users ?? []);
    setAdminCompanies(data?.companies ?? []);
  }, [getInvokeErrorMessage]);

  const parseErrorPayload = useCallback(async (error: unknown, fallbackData?: unknown) => {
    const fallback = (fallbackData && typeof fallbackData === "object")
      ? (fallbackData as Record<string, unknown>)
      : null;
    if (fallback?.error) return fallback;

    const errorRecord = (error && typeof error === "object")
      ? (error as Record<string, unknown>)
      : null;
    const context = errorRecord?.context;
    if (context && typeof context === "object" && "json" in (context as object)) {
      try {
        return await (context as { json: () => Promise<Record<string, unknown>> }).json();
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    if (activeTab === "admin-manager") loadAdminData();
  }, [activeTab, loadAdminData]);

  const handleZipLookup = useCallback(async (zip: string) => {
    if (zip.length !== 5) return;
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!res.ok) return;
      const json = await res.json();
      const place = json["places"]?.[0];
      if (place) {
        setCreateForm(prev => ({
          ...prev,
          city: place["place name"] ?? prev.city,
          state: place["state abbreviation"] ?? prev.state,
        }));
      }
    } catch { /* silent */ }
  }, []);

  const handleCreateUser = async () => {
    setCreateLoading(true);
    setCreateMsg("");
    setDuplicateEmailPrompt(null);

    const isNewCompany = createForm.companyId === "__new__";
    const companyId = isNewCompany ? null : (createForm.companyId || null);
    const newCompanyName = isNewCompany ? (createForm.newCompanyName.trim() || null) : null;

    const { data, error } = await supabase.functions.invoke("janitorial-admin-users", {
      body: {
        action: "createUser",
        first_name: createForm.firstName.trim(),
        surname: createForm.surname.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        company_id: companyId,
        new_company_name: newCompanyName,
        role: createForm.role,
        city: createForm.city || null,
        state: createForm.state || null,
        zip_code: createForm.zip || null,
        cell_number: createForm.cell || null,
        linkedin_url: createForm.linkedin || null,
      },
    });
    setCreateLoading(false);

    if (error) {
      console.error("janitorial-admin-users createUser error", error);
      const errorPayload = await parseErrorPayload(error, data);
      const code = typeof errorPayload?.code === "string" ? errorPayload.code : "";
      const status = typeof errorPayload?.status === "number" ? errorPayload.status : null;
      if (code === "AUTH_USER_EXISTS" || status === 409) {
        setDuplicateEmailPrompt({ email: createForm.email.trim().toLowerCase() });
      }
      const detailedMessage = await getInvokeErrorMessage(error, data);
      setCreateMsg(`Error: ${detailedMessage}`);
      return;
    }

    if (data?.error) {
      setCreateMsg(`Error: ${data.error}`);
      return;
    }

    setCreateMsg(`Trial user created: ${data?.email ?? createForm.email}`);
    setCreateForm({ ...EMPTY_CREATE_FORM });
    setDuplicateEmailPrompt(null);
    setFindExistingMsg("");
    setShowCreateForm(false);
    loadAdminData();
  };

  const handleFindExistingByEmail = async () => {
    const email = createForm.email.trim().toLowerCase();
    if (!email) {
      setFindExistingMsg("Enter an email first.");
      return;
    }
    setFindExistingLoading(true);
    setFindExistingMsg("");
    const { data, error } = await supabase.functions.invoke("janitorial-admin-users", {
      body: { action: "findExistingUserByEmail", email },
    });
    setFindExistingLoading(false);
    if (error) {
      const message = await getInvokeErrorMessage(error, data);
      setFindExistingMsg(`Error: ${message}`);
      return;
    }
    if (data?.found) {
      setFindExistingMsg("Existing Auth user found for this email.");
      setDuplicateEmailPrompt({ email });
      return;
    }
    setFindExistingMsg("No existing Auth user found for this email.");
  };

  const handleAllocateExistingUser = async () => {
    setCreateLoading(true);
    setCreateMsg("");
    const isNewCompany = createForm.companyId === "__new__";
    const companyId = isNewCompany ? null : (createForm.companyId || null);
    const newCompanyName = isNewCompany ? (createForm.newCompanyName.trim() || null) : null;
    const { data, error } = await supabase.functions.invoke("janitorial-admin-users", {
      body: {
        action: "allocateTrialToExistingUser",
        email: createForm.email.trim().toLowerCase(),
        first_name: createForm.firstName.trim(),
        surname: createForm.surname.trim(),
        company_id: companyId,
        new_company_name: newCompanyName,
        role: createForm.role,
        city: createForm.city || null,
        state: createForm.state || null,
        zip_code: createForm.zip || null,
        cell_number: createForm.cell || null,
        linkedin_url: createForm.linkedin || null,
      },
    });
    setCreateLoading(false);
    if (error) {
      const message = await getInvokeErrorMessage(error, data);
      setCreateMsg(`Error: ${message}`);
      return;
    }
    setCreateMsg(`Allocated trial to existing user: ${data?.email ?? createForm.email}`);
    setDuplicateEmailPrompt(null);
    setShowCreateForm(false);
    setCreateForm({ ...EMPTY_CREATE_FORM });
    loadAdminData();
  };

  const handleFreezeUser = async (userId: string, freeze: boolean) => {
    const { data, error } = await supabase.functions.invoke("janitorial-admin-users", {
      body: { action: freeze ? "freeze" : "unfreeze", user_id: userId },
    });
    if (error) {
      console.error("janitorial-admin-users freeze/unfreeze error", error);
      const message = await getInvokeErrorMessage(error, data);
      setCreateMsg(`Error: ${message}`);
      return;
    }
    loadAdminData();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user everywhere? This removes both janitorial profile and Auth user permanently.")) return;
    const { data, error } = await supabase.functions.invoke("janitorial-admin-users", {
      body: { action: "deleteUserEverywhere", user_id: userId },
    });
    if (error) {
      console.error("janitorial-admin-users deleteUser error", error);
      const message = await getInvokeErrorMessage(error, data);
      setCreateMsg(`Error: ${message}`);
      return;
    }
    loadAdminData();
  };

  const handleRemoveJanitorialAccess = async (userId: string) => {
    if (!confirm("Remove janitorial access only? This keeps the Auth user account.")) return;
    const { data, error } = await supabase.functions.invoke("janitorial-admin-users", {
      body: { action: "removeJanitorialAccess", user_id: userId },
    });
    if (error) {
      const message = await getInvokeErrorMessage(error, data);
      setCreateMsg(`Error: ${message}`);
      return;
    }
    setCreateMsg("Removed janitorial access.");
    loadAdminData();
  };

  const startEditUser = (user: AdminUser) => {
    setEditUser(user);
    setEditForm({
      firstName: user.first_name ?? "",
      surname: user.surname ?? "",
      email: user.email ?? "",
      password: "",
      companyId: user.company_id ?? "",
      newCompanyName: "",
      role: user.role ?? "janitorial_owner",
      city: user.city ?? "",
      state: user.state ?? "",
      zip: user.zip_code ?? "",
      cell: user.cell_number ?? "",
      linkedin: user.linkedin_url ?? "",
      trial_expires_at: user.trial_expires_at ?? "",
      can_edit_pricing: !!user.can_edit_pricing,
      can_edit_branding: !!user.can_edit_branding,
      is_frozen: !!user.is_frozen,
    });
  };

  const handleUpdateUserProfile = async () => {
    if (!editUser) return;
    const isNewCompany = editForm.companyId === "__new__";
    const { data, error } = await supabase.functions.invoke("janitorial-admin-users", {
      body: {
        action: "updateUserProfile",
        user_id: editUser.id,
        email: editForm.email.trim().toLowerCase(),
        first_name: editForm.firstName.trim(),
        surname: editForm.surname.trim(),
        company_id: isNewCompany ? null : (editForm.companyId || null),
        new_company_name: isNewCompany ? (editForm.newCompanyName.trim() || null) : null,
        role: editForm.role,
        city: editForm.city || null,
        state: editForm.state || null,
        zip_code: editForm.zip || null,
        cell_number: editForm.cell || null,
        linkedin_url: editForm.linkedin || null,
        trial_expires_at: editForm.trial_expires_at || null,
        can_edit_pricing: editForm.can_edit_pricing,
        can_edit_branding: editForm.can_edit_branding,
        is_frozen: editForm.is_frozen,
      },
    });
    if (error) {
      const message = await getInvokeErrorMessage(error, data);
      setCreateMsg(`Error: ${message}`);
      return;
    }
    setCreateMsg("User profile updated.");
    setEditUser(null);
    loadAdminData();
  };

  const handleTogglePerm = async (userId: string, field: "can_edit_pricing" | "can_edit_branding", value: boolean) => {
    const { data, error } = await supabase.functions.invoke("janitorial-admin-users", {
      body: { action: "updatePermissions", user_id: userId, [field]: value },
    });
    if (error) {
      console.error("janitorial-admin-users updatePermissions error", error);
      const message = await getInvokeErrorMessage(error, data);
      setCreateMsg(`Error: ${message}`);
      return;
    }
    loadAdminData();
  };
  // ────────────────────────────────────────────────────────────────────

  const [clientFilter, setClientFilter] = useState("All Clients");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [reportsRefreshedAt, setReportsRefreshedAt] = useState(new Date().toISOString());

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

  const reportsRows = useMemo<SalesReportRow[]>(() => {
    const stageOrder: Record<FunnelStage, number> = { Leads: 0, Opportunities: 1, "Won Contracts": 2 };
    return pipelineItems
      .filter((item) => item.column !== "Lost / Archived")
      .map((item) => ({
        id: item.id,
        client: item.clientName,
        stage: item.column as FunnelStage,
        monthlyValue: item.estimatedMonthlyValue,
        annualizedValue: item.estimatedMonthlyValue * 12,
        lastActivity: item.lastActivity,
        source: item.column === "Won Contracts" ? "Contract Conversion" : "CRM Pipeline",
        confidence: item.aiConfidence,
      }))
      .sort((a, b) => stageOrder[a.stage] - stageOrder[b.stage]);
  }, [pipelineItems]);

  const salesKpis = useMemo(() => {
    const leadsCount = pipelineItems.filter((item) => item.column === "Leads").length;
    const opportunitiesCount = pipelineItems.filter((item) => item.column === "Opportunities").length;
    const wonCount = pipelineItems.filter((item) => item.column === "Won Contracts").length;
    const totalPipelineValue = pipelineItems
      .filter((item) => item.column !== "Lost / Archived")
      .reduce((sum, item) => sum + item.estimatedMonthlyValue, 0);
    const wonMonthly = contracts.reduce((sum, item) => sum + item.monthlyValue, 0);
    const conversionRate = opportunitiesCount > 0 ? (wonCount / opportunitiesCount) * 100 : 0;

    return { leadsCount, opportunitiesCount, wonCount, totalPipelineValue, wonMonthly, conversionRate };
  }, [contracts, pipelineItems]);

  const aiInsights = useMemo(() => {
    const strongestOpportunity = reportsRows
      .filter((row) => row.stage !== "Won Contracts")
      .sort((a, b) => b.confidence - a.confidence)[0];
    const highRiskLead = reportsRows
      .filter((row) => row.stage === "Leads")
      .sort((a, b) => a.confidence - b.confidence)[0];
    return {
      strongestOpportunity,
      highRiskLead,
    };
  }, [reportsRows]);

  return (
    <div className="min-h-screen bg-background p-4 text-foreground md:p-6">
      <div className="mb-4 rounded-3xl bg-gradient-to-r from-sky-800 via-blue-700 to-indigo-700 p-6 text-white">
        <h1 className="text-2xl font-bold">Janitorial Manager</h1>
        <p className="text-sm text-blue-100">Powered by CleanScope AI v5.0</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 h-auto flex-wrap rounded-2xl p-1">
          <TabsTrigger
            value="admin-manager"
            className="data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=inactive]:bg-[#2563eb]/20 data-[state=inactive]:text-[#2563eb] font-semibold"
          >
            ADMIN-MANAGER
          </TabsTrigger>
          <TabsTrigger value="active-contracts">Active Janitorial Contracts</TabsTrigger>
          <TabsTrigger value="historical-jobs">Historical Janitorial Jobs</TabsTrigger>
          <TabsTrigger value="walkthroughs">Janitorial Walkthroughs</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="sales-reports">Sales Reports</TabsTrigger>
          <TabsTrigger value="calculator">Janitorial Pricing Calculator</TabsTrigger>
          <TabsTrigger value="new-bid">New Bid / Proposal</TabsTrigger>
        </TabsList>

        {/* ── ADMIN-MANAGER tab (full-width, outside the 3-col grid) ── */}
        <TabsContent value="admin-manager" className="mt-0">
          <div className="space-y-4">
            {/* Top: Create Trial User button */}
            <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-2">
              <p className="text-sm font-semibold text-blue-800">Trial User Management</p>
              <button
                type="button"
                onClick={() => { setShowCreateForm(v => !v); setCreateMsg(""); }}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "#2563eb" }}
              >
                {showCreateForm ? "Cancel" : "Create Trial User"}
              </button>
            </div>

            {/* Create form (collapsible) */}
            {showCreateForm && (
              <Card className="rounded-2xl border-blue-200">
                <CardHeader className="py-3"><CardTitle className="text-sm text-blue-700">New Trial User (7-day access)</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><Label className="text-xs">First Name *</Label><Input value={createForm.firstName} onChange={e => setCreateForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Jane" /></div>
                    <div><Label className="text-xs">Surname *</Label><Input value={createForm.surname} onChange={e => setCreateForm(p => ({ ...p, surname: e.target.value }))} placeholder="Smith" /></div>
                    <div><Label className="text-xs">Email *</Label><Input type="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@company.com" /></div>
                    <div><Label className="text-xs">Password *</Label><Input type="password" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} placeholder="Temp password" /></div>
                    <div>
                      <Label className="text-xs">Company</Label>
                      <Select value={createForm.companyId} onValueChange={v => setCreateForm(p => ({ ...p, companyId: v, newCompanyName: v === "__new__" ? p.newCompanyName : "" }))}>
                        <SelectTrigger><SelectValue placeholder="Select or create company" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__new__">+ New company…</SelectItem>
                          {adminCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {createForm.companyId === "__new__" && (
                        <Input className="mt-1.5" placeholder="Company name" value={createForm.newCompanyName} onChange={e => setCreateForm(p => ({ ...p, newCompanyName: e.target.value }))} />
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Role *</Label>
                      <Select value={createForm.role} onValueChange={v => setCreateForm(p => ({ ...p, role: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="janitorial_owner">Owner</SelectItem>
                          <SelectItem value="janitorial_manager">Manager</SelectItem>
                          <SelectItem value="janitorial_sales_rep">Sales Rep</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">ZIP (optional — auto-fills City/State)</Label>
                      <Input
                        value={createForm.zip}
                        maxLength={5}
                        onChange={e => {
                          setCreateForm(p => ({ ...p, zip: e.target.value }));
                          handleZipLookup(e.target.value);
                        }}
                        placeholder="e.g. 98101"
                      />
                    </div>
                    <div><Label className="text-xs">City (optional)</Label><Input value={createForm.city} onChange={e => setCreateForm(p => ({ ...p, city: e.target.value }))} placeholder="Seattle" /></div>
                    <div><Label className="text-xs">State (optional)</Label><Input value={createForm.state} onChange={e => setCreateForm(p => ({ ...p, state: e.target.value }))} placeholder="WA" /></div>
                    <div><Label className="text-xs">Cell Number (optional)</Label><Input type="tel" value={createForm.cell} onChange={e => setCreateForm(p => ({ ...p, cell: e.target.value }))} placeholder="+1 (206) 555-0100" /></div>
                    <div><Label className="text-xs">LinkedIn URL (optional)</Label><Input value={createForm.linkedin} onChange={e => setCreateForm(p => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/jane" /></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={handleFindExistingByEmail} disabled={findExistingLoading}>
                      {findExistingLoading ? "Searching…" : "Search Existing by Email"}
                    </Button>
                    {findExistingMsg && <p className="text-sm text-muted-foreground">{findExistingMsg}</p>}
                  </div>
                  {duplicateEmailPrompt && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                      <p className="text-sm font-medium text-amber-900">
                        This email already exists. Allocate a janitorial trial to this existing user?
                      </p>
                      <Button
                        type="button"
                        className="mt-2"
                        onClick={handleAllocateExistingUser}
                        disabled={createLoading}
                      >
                        Allocate Trial to Existing User
                      </Button>
                    </div>
                  )}
                  {createMsg && <p className={`text-sm ${createMsg.startsWith("Error") ? "text-red-500" : "text-emerald-600"}`}>{createMsg}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                    <Button
                      disabled={createLoading || !createForm.firstName.trim() || !createForm.surname.trim() || !createForm.email.trim() || !createForm.password || !createForm.role || (createForm.companyId === "__new__" && !createForm.newCompanyName.trim())}
                      onClick={handleCreateUser}
                      style={{ backgroundColor: "#2563eb" }}
                      className="text-white hover:opacity-90"
                    >
                      {createLoading ? "Creating…" : "Create Trial User"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Users table (bottom) */}
            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm">Trial Users</CardTitle>
                <Button variant="outline" size="sm" onClick={loadAdminData} disabled={adminLoading}>
                  {adminLoading ? "Loading…" : "Refresh"}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {adminError && <p className="px-4 py-3 text-sm text-red-500">{adminError}</p>}
                {!adminLoading && adminUsers.length === 0 && !adminError && (
                  <p className="px-4 py-3 text-sm text-muted-foreground">No trial users yet.</p>
                )}
                {adminUsers.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>City / State</TableHead>
                          <TableHead>Cell</TableHead>
                          <TableHead>LinkedIn</TableHead>
                          <TableHead>Trial Ends</TableHead>
                          <TableHead>Pricing</TableHead>
                          <TableHead>Branding</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Auth</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers.map(u => (
                          <TableRow key={u.id} className={u.is_frozen ? "opacity-50" : ""}>
                            <TableCell className="font-medium whitespace-nowrap">{u.first_name} {u.surname}</TableCell>
                            <TableCell className="text-xs">{u.email}</TableCell>
                            <TableCell className="text-xs">{u.company_name ?? "—"}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{u.role.replace("janitorial_", "")}</Badge></TableCell>
                            <TableCell className="text-xs whitespace-nowrap">{[u.city, u.state].filter(Boolean).join(", ") || "—"}</TableCell>
                            <TableCell className="text-xs">
                              {u.cell_number ? <a href={`tel:${u.cell_number}`} className="text-primary hover:underline">{u.cell_number}</a> : "—"}
                            </TableCell>
                            <TableCell>
                              {u.linkedin_url ? (
                                <a href={u.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                  in
                                </a>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                              {u.trial_expires_at ? new Date(u.trial_expires_at).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={u.can_edit_pricing}
                                onCheckedChange={v => handleTogglePerm(u.id, "can_edit_pricing", v)}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={u.can_edit_branding}
                                onCheckedChange={v => handleTogglePerm(u.id, "can_edit_branding", v)}
                              />
                            </TableCell>
                            <TableCell>
                              <Badge className={u.is_frozen ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}>
                                {u.is_frozen ? "Frozen" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {u.auth_user ? (
                                <span>{u.auth_user.is_banned ? "Banned" : "Exists"}</span>
                              ) : (
                                <span className="text-red-500">Missing</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 whitespace-nowrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => startEditUser(u)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleFreezeUser(u.id, !u.is_frozen)}
                                >
                                  {u.is_frozen ? "Unfreeze" : "Freeze"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleRemoveJanitorialAccess(u.id)}
                                >
                                  Remove Access
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleDeleteUser(u.id)}
                                >
                                  Delete Everywhere
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>Edit Janitorial User</DialogTitle></DialogHeader>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label className="text-xs">First Name</Label><Input value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} /></div>
                  <div><Label className="text-xs">Surname</Label><Input value={editForm.surname} onChange={e => setEditForm(p => ({ ...p, surname: e.target.value }))} /></div>
                  <div><Label className="text-xs">Email</Label><Input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} /></div>
                  <div>
                    <Label className="text-xs">Role</Label>
                    <Select value={editForm.role} onValueChange={v => setEditForm(p => ({ ...p, role: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="janitorial_owner">Owner</SelectItem>
                        <SelectItem value="janitorial_manager">Manager</SelectItem>
                        <SelectItem value="janitorial_sales_rep">Sales Rep</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Company</Label>
                    <Select value={editForm.companyId} onValueChange={v => setEditForm(p => ({ ...p, companyId: v, newCompanyName: v === "__new__" ? p.newCompanyName : "" }))}>
                      <SelectTrigger><SelectValue placeholder="Select or create company" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__new__">+ New company…</SelectItem>
                        {adminCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {editForm.companyId === "__new__" && (
                      <Input className="mt-1.5" placeholder="Company name" value={editForm.newCompanyName} onChange={e => setEditForm(p => ({ ...p, newCompanyName: e.target.value }))} />
                    )}
                  </div>
                  <div><Label className="text-xs">Trial Expires (ISO)</Label><Input value={editForm.trial_expires_at} onChange={e => setEditForm(p => ({ ...p, trial_expires_at: e.target.value }))} /></div>
                  <div><Label className="text-xs">City</Label><Input value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} /></div>
                  <div><Label className="text-xs">State</Label><Input value={editForm.state} onChange={e => setEditForm(p => ({ ...p, state: e.target.value }))} /></div>
                  <div><Label className="text-xs">ZIP</Label><Input value={editForm.zip} onChange={e => setEditForm(p => ({ ...p, zip: e.target.value }))} /></div>
                  <div><Label className="text-xs">Cell</Label><Input value={editForm.cell} onChange={e => setEditForm(p => ({ ...p, cell: e.target.value }))} /></div>
                  <div><Label className="text-xs">LinkedIn</Label><Input value={editForm.linkedin} onChange={e => setEditForm(p => ({ ...p, linkedin: e.target.value }))} /></div>
                  <div className="flex items-center justify-between"><Label className="text-xs">Can Edit Pricing</Label><Switch checked={editForm.can_edit_pricing} onCheckedChange={v => setEditForm(p => ({ ...p, can_edit_pricing: v }))} /></div>
                  <div className="flex items-center justify-between"><Label className="text-xs">Can Edit Branding</Label><Switch checked={editForm.can_edit_branding} onCheckedChange={v => setEditForm(p => ({ ...p, can_edit_branding: v }))} /></div>
                  <div className="flex items-center justify-between"><Label className="text-xs">Frozen</Label><Switch checked={editForm.is_frozen} onCheckedChange={v => setEditForm(p => ({ ...p, is_frozen: v }))} /></div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                  <Button onClick={handleUpdateUserProfile}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

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

            <TabsContent value="sales-reports" className="mt-0 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Sales Reports Dashboard</h2>
                <Button
                  variant="outline"
                  onClick={() => setReportsRefreshedAt(new Date().toISOString())}
                >
                  Refresh Reports
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Last refreshed: {new Date(reportsRefreshedAt).toLocaleString()}</p>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="rounded-2xl"><CardHeader><CardTitle className="text-sm">Open Pipeline</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{usd(salesKpis.totalPipelineValue)}</CardContent></Card>
                <Card className="rounded-2xl"><CardHeader><CardTitle className="text-sm">Won Monthly Revenue</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{usd(salesKpis.wonMonthly)}</CardContent></Card>
                <Card className="rounded-2xl"><CardHeader><CardTitle className="text-sm">Lead → Won Conversion</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{salesKpis.conversionRate.toFixed(1)}%</CardContent></Card>
                <Card className="rounded-2xl"><CardHeader><CardTitle className="text-sm">Proposal Emails Sent</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{emailLogs.length}</CardContent></Card>
              </div>

              <Card className="rounded-2xl">
                <CardHeader><CardTitle>Pipeline Funnel</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Leads", value: salesKpis.leadsCount, barClass: "h-3 rounded-full bg-gradient-to-r from-sky-600 to-sky-500" },
                    { label: "Opportunities", value: salesKpis.opportunitiesCount, barClass: "h-3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500" },
                    { label: "Won Contracts", value: salesKpis.wonCount, barClass: "h-3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500" },
                  ].map((stage) => (
                    <div key={stage.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{stage.label}</span>
                        <span>{stage.value}</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted/50">
                        <div
                          className={stage.barClass}
                          style={{ width: `${Math.max(8, Math.min(100, stage.value * 22))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-2xl">
                  <CardHeader><CardTitle>Revenue Trend (30d)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-44 rounded-xl bg-gradient-to-t from-blue-700/20 via-blue-500/10 to-transparent p-4">
                      <div className="flex h-full items-end gap-2">
                        {[42, 38, 51, 47, 63, 57, 69].map((v, i) => (
                          <div key={i} className="flex-1 rounded-t bg-blue-500/70" style={{ height: `${v}%` }} />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardHeader><CardTitle>Sales Performance Mix</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-44 rounded-xl bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-sky-500/20 p-4">
                      <div className="space-y-3">
                        {[
                          ["New Bids", 62],
                          ["Renewals", 22],
                          ["Upsells", 16],
                        ].map(([label, pct]) => (
                          <div key={label}>
                            <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{pct}%</span></div>
                            <div className="h-2 rounded-full bg-muted/40">
                              <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl">
                <CardHeader><CardTitle>Detailed Sales Reports</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Monthly Value</TableHead>
                        <TableHead>Annualized</TableHead>
                        <TableHead>AI Confidence</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.client}</TableCell>
                          <TableCell><Badge variant="outline">{row.stage}</Badge></TableCell>
                          <TableCell>{usd(row.monthlyValue)}</TableCell>
                          <TableCell>{usd(row.annualizedValue)}</TableCell>
                          <TableCell>{row.confidence}%</TableCell>
                          <TableCell>{row.lastActivity}</TableCell>
                          <TableCell>{row.source}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-blue-500/40 bg-blue-500/5">
                <CardHeader><CardTitle>AI Insights</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    Highest-confidence active deal:{" "}
                    <strong>{aiInsights.strongestOpportunity?.client ?? "No active opportunities"}</strong>
                    {aiInsights.strongestOpportunity ? ` (${aiInsights.strongestOpportunity.confidence}% confidence)` : ""}.
                  </p>
                  <p>
                    Risk watch:{" "}
                    <strong>{aiInsights.highRiskLead?.client ?? "No lead-risk alerts"}</strong>
                    {aiInsights.highRiskLead ? ` is below threshold at ${aiInsights.highRiskLead.confidence}% confidence.` : "."}
                  </p>
                  <p>
                    Contracts + pipeline are synced from Active Contracts, CRM pipeline, proposal conversion actions, and email log events.
                  </p>
                </CardContent>
              </Card>
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
              <CardContent className="pt-0"><div className="flex flex-wrap gap-2">{[
                { label: "CRM Clients", tab: "clients" },
                { label: "Pipeline Board", tab: "pipeline" },
                { label: "Sales Reports", tab: "sales-reports" },
                { label: "New Proposal", tab: "new-bid" },
                { label: "Active Contracts", tab: "active-contracts" },
              ].map((item) => (
                <Button key={item.label} variant="ghost" onClick={() => setActiveTab(item.tab)} className="h-9 rounded-xl bg-white/10 px-3 text-sm font-medium text-white hover:bg-white hover:text-blue-700">{item.label}</Button>
              ))}</div></CardContent>
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
