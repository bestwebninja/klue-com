import { useNavigate } from "react-router-dom";
import {
  Bell,
  BrainCircuit,
  Building2,
  ChevronDown,
  Command,
  FileText,
  Home,
  Link2,
  Megaphone,
  Mic,
  Search,
  Settings,
  ShieldCheck,
  TrendingDown,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const kpis = [
  { title: "Emergency Mix", value: "38%", delta: "+2.4%", icon: Megaphone, trend: [20, 24, 23, 29, 31, 35, 38] },
  { title: "Average Ticket", value: "$12.4k", delta: "+5.1%", icon: Building2, trend: [8, 8.8, 9.1, 10.4, 11.2, 11.8, 12.4] },
  { title: "Material Variance", value: "-1.8%", delta: "-0.7%", icon: TrendingDown, trend: [3.4, 3.2, 2.9, 2.7, 2.3, 2.1, 1.8] },
  { title: "Leak Detection ROI", value: "4.6x", delta: "+0.4x", icon: ShieldCheck, trend: [2.4, 2.8, 3.2, 3.6, 4.0, 4.2, 4.6] },
];

const pipeline = {
  New: [{ id: "RM-411", title: "Kitchen overhaul · Aspen Ct", priority: "high", owner: "Sales", eta: "Today" }],
  Dispatch: [{ id: "RM-389", title: "Crew assignment · Hillview", priority: "medium", owner: "Ops", eta: "11:30 AM" }],
  "In Progress": [{ id: "RM-362", title: "Master bath retrofit", priority: "high", owner: "Crew 2", eta: "2:15 PM" }],
  Complete: [{ id: "RM-340", title: "Final walkthrough + closeout", priority: "low", owner: "PM", eta: "Done" }],
};

const agents = [
  { name: "Leak Hunter", description: "Flags hidden leak risk patterns from notes + media.", status: "active" },
  { name: "Document Whisperer", description: "Builds permit packet drafts and signature checklists.", status: "idle" },
  { name: "Rebate Maximizer", description: "Surfaces utility rebates for upgrade scenarios.", status: "active" },
];

const rightRail = {
  alerts: [
    { id: "alert-1", title: "Permit window narrows", detail: "2 projects need submission before 4 PM.", tone: "warning" },
    { id: "alert-2", title: "Change order risk", detail: "Maple Ave scope variance crossed threshold.", tone: "critical" },
  ],
  weather: { location: "Scottsdale, AZ", condition: "Clear", temperature: "72°F" },
  compliance: { score: "96", status: "Permit compliance in healthy range", nextAudit: "Mon 9:30 AM" },
  quickActions: ["Generate Schedule", "Escalate Change Order", "Run Rebate Scan"],
};

const navSections = {
  OPERATIONS: ["Home", "Today", "Pipeline", "Analytics", "AI Agents"],
  SYSTEMS: ["Compliance", "Integrations", "Settings"],
};

function Sparkline({ trend }: { trend: number[] }) {
  const max = Math.max(...trend);
  const min = Math.min(...trend);
  const spread = Math.max(max - min, 1);

  return (
    <div className="mt-3 flex items-end gap-1">
      {trend.map((point, idx) => (
        <span
          key={`${point}-${idx}`}
          className="w-1.5 rounded-sm bg-amber-300/80"
          style={{ height: `${((point - min) / spread) * 20 + 6}px` }}
        />
      ))}
    </div>
  );
}

export default function RemodelingCommandCenterPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#07182f] text-slate-100">
      <header className="border-b border-amber-300/20 bg-[#081f3b] px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-amber-300/40 bg-amber-200/10 px-3 py-2 md:flex">
            <Command className="h-4 w-4 text-amber-300" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-200">Kluje</p>
              <p className="text-sm font-semibold">Command Center</p>
            </div>
          </div>

          <button className="flex items-center gap-2 rounded-md border border-amber-300/30 bg-[#0c284d] px-3 py-2 text-sm">
            Remodeling Workspace
            <ChevronDown className="h-4 w-4 text-amber-200" />
          </button>

          <button className="rounded-md border border-amber-300/35 bg-amber-300/10 p-2 text-amber-200" aria-label="Toggle voice session">
            <Mic className="h-4 w-4" />
          </button>

          <div className="relative min-w-[170px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-200/70" />
            <Input className="border-amber-300/25 bg-[#0d294f] pl-9 text-slate-100 placeholder:text-slate-300/70" placeholder="Search jobs, docs, agents..." />
          </div>

          <button className="relative rounded-md border border-amber-300/30 bg-[#0c284d] p-2" aria-label="Notifications">
            <Bell className="h-5 w-5 text-amber-200" />
            <span className="absolute -right-1 -top-1 rounded-full bg-amber-300 px-1.5 text-[10px] font-bold text-[#1b2f4f]">4</span>
          </button>

          <div className="hidden items-center gap-2 rounded-lg border border-amber-300/30 bg-[#0c284d] px-2 py-1.5 md:flex">
            <div className="rounded bg-amber-300/20 p-1 text-amber-200">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-medium">Remodel Ops</p>
              <p className="text-[11px] text-slate-300">Enterprise Org</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 py-4 pb-[calc(var(--cookie-consent-offset,0px)+1rem)] md:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_320px] md:px-6">
        <aside className="rounded-xl border border-amber-300/20 bg-[#0a2344] p-3">
          {Object.entries(navSections).map(([section, items]) => (
            <div key={section} className="mb-5 space-y-2">
              <p className="px-2 text-[11px] uppercase tracking-[0.16em] text-slate-300">{section}</p>
              {items.map((item, idx) => (
                <button
                  key={item}
                  className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-sm text-left transition ${section === "OPERATIONS" && idx === 0 ? "border-amber-300/60 bg-amber-300/15 text-amber-100" : "border-transparent text-slate-300 hover:border-amber-300/20 hover:bg-[#0f315e]"}`}
                >
                  {item === "AI Agents" ? <BrainCircuit className="h-4 w-4" /> : item === "Integrations" ? <Link2 className="h-4 w-4" /> : item === "Settings" ? <Settings className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  {item}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="space-y-4">
          <section className="rounded-xl border border-amber-300/20 bg-[#0a2344] p-4">
            <h1 className="text-2xl font-semibold tracking-tight text-amber-100">Remodeling Command Center</h1>
            <p className="text-sm text-slate-300">live operations, pipeline execution, and AI agent controls</p>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <article key={kpi.title} className="rounded-xl border border-amber-300/20 bg-[#0a2344] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">{kpi.title}</p>
                  <kpi.icon className="h-4 w-4 text-amber-200" />
                </div>
                <p className="mt-2 text-2xl font-semibold text-amber-100">{kpi.value}</p>
                <Badge className="mt-2 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/15">{kpi.delta}</Badge>
                <Sparkline trend={kpi.trend} />
              </article>
            ))}
          </section>

          <section className="rounded-xl border border-amber-300/20 bg-[#0a2344] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-amber-100">Pipeline Board</h2>
              <span className="text-xs text-slate-300">Drag-ready lanes</span>
            </div>
            <div className="grid gap-3 lg:grid-cols-4">
              {Object.entries(pipeline).map(([stage, cards]) => (
                <div key={stage} className="rounded-lg border border-amber-300/15 bg-[#0d294f] p-3">
                  <h3 className="mb-2 text-sm font-semibold text-amber-100">{stage}</h3>
                  {cards.map((card) => (
                    <article key={card.id} className="mb-2 rounded-md border border-amber-300/25 bg-[#12335d] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-amber-100">{card.id}</p>
                        <Badge variant="outline" className="border-amber-300/50 text-amber-200">{card.priority}</Badge>
                      </div>
                      <p className="text-sm text-slate-100">{card.title}</p>
                      <p className="mt-2 text-xs text-slate-300">{card.owner} · {card.eta}</p>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-amber-300/20 bg-[#0a2344] p-4">
            <h2 className="mb-3 text-lg font-semibold text-amber-100">AI Agents</h2>
            <div className="grid gap-3 lg:grid-cols-3">
              {agents.map((agent) => (
                <article key={agent.name} className="rounded-lg border border-amber-300/20 bg-[#0d294f] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium text-amber-100">{agent.name}</p>
                    <Badge className={agent.status === "active" ? "bg-emerald-400/15 text-emerald-300" : "bg-slate-400/20 text-slate-200"}>{agent.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-300">{agent.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="bg-amber-300 text-[#1f3455] hover:bg-amber-200">Run</Button>
                    <Button size="sm" variant="outline" className="border-amber-300/40 text-amber-100 hover:bg-amber-300/10">Configure</Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-4 space-y-4">
            <section className="rounded-xl border border-amber-300/20 bg-[#0a2344] p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-amber-200">Alerts</h2>
              <div className="space-y-2">
                {rightRail.alerts.map((alert) => (
                  <article
                    key={alert.id}
                    className={`rounded-lg border p-3 ${
                      alert.tone === "critical" ? "border-rose-300/35 bg-rose-500/10" : "border-amber-300/25 bg-amber-300/10"
                    }`}
                  >
                    <p className="text-sm font-medium text-amber-100">{alert.title}</p>
                    <p className="mt-1 text-xs text-slate-300">{alert.detail}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-amber-300/20 bg-[#0a2344] p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-amber-200">Weather</h2>
              <p className="text-xl font-semibold text-amber-100">{rightRail.weather.temperature}</p>
              <p className="text-sm text-slate-200">{rightRail.weather.condition}</p>
              <p className="mt-1 text-xs text-slate-300">{rightRail.weather.location}</p>
            </section>

            <section className="rounded-xl border border-amber-300/20 bg-[#0a2344] p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-amber-200">Compliance</h2>
              <p className="text-2xl font-semibold text-emerald-300">{rightRail.compliance.score}</p>
              <p className="mt-1 text-sm text-slate-200">{rightRail.compliance.status}</p>
              <p className="mt-2 text-xs text-slate-300">Next audit: {rightRail.compliance.nextAudit}</p>
            </section>

            <section className="rounded-xl border border-amber-300/20 bg-[#0a2344] p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-amber-200">Quick Actions</h2>
              <div className="space-y-2">
                {rightRail.quickActions.map((action) => (
                  <Button key={action} variant="outline" className="w-full justify-start border-amber-300/40 text-amber-100 hover:bg-amber-300/10">
                    {action}
                  </Button>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>

      <footer className="border-t border-amber-300/20 bg-[#081f3b] px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-emerald-300">
              <Wifi className="h-3.5 w-3.5" /> online
            </span>
            <span>Last sync: 2 min ago</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-amber-300/40 text-amber-100 hover:bg-amber-300/10">Export CSV</Button>
            <Button className="bg-amber-300 text-[#1f3455] hover:bg-amber-200">Export PDF</Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
