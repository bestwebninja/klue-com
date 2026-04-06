import type { DashboardTemplate } from "./types";

export const remodelingTemplate: DashboardTemplate = {
  key: "trade_remodeling_v1",
  version: "v1",
  audience: "trade",
  trade: "remodeling",
  name: "Remodeling Command Center",
  config: {
    sidebarNav: [
      { key: "home", label: "Home", section: "operations" },
      { key: "today", label: "Today", section: "operations" },
      { key: "pipeline", label: "Pipeline", section: "operations" },
      { key: "analytics", label: "Analytics", section: "operations" },
      { key: "ai-agents", label: "AI Agents", section: "operations" },
      { key: "compliance", label: "Compliance", section: "systems" },
      { key: "integrations", label: "Integrations", section: "systems" },
      { key: "settings", label: "Settings", section: "systems" },
    ],
    kpis: [
      { key: "active_jobs", label: "Active Jobs", value: "28", delta: "+3.2%", icon: "users", trend: [18, 20, 21, 24, 25, 26, 28], tone: "positive" },
      { key: "booked_revenue", label: "Booked Revenue", value: "$2.1M", delta: "+7.9%", icon: "dollar", trend: [1.4, 1.5, 1.55, 1.7, 1.8, 1.95, 2.1], tone: "positive" },
      { key: "cycle_time", label: "Avg Cycle Time", value: "17.4 days", delta: "-1.1 days", icon: "clock", trend: [22, 21, 21, 20, 19, 18, 17], tone: "positive" },
      { key: "close_rate", label: "Quote Close Rate", value: "43%", delta: "+2.4%", icon: "trending", trend: [36, 37, 39, 40, 41, 42, 43], tone: "positive" },
    ],
    pipelineItems: [
      { id: "rm-1", label: "Kitchen redesign · Maple Ave", stage: "New", priority: "high", owner: "Sales", eta: "Today" },
      { id: "rm-2", label: "Bathroom refresh · 4th St", stage: "New", priority: "medium", owner: "Sales", eta: "Tomorrow" },
      { id: "rm-3", label: "Permit packet review", stage: "Dispatch", priority: "medium", owner: "Ops", eta: "1:00 PM" },
      { id: "rm-4", label: "Cabinet install · Lot 19", stage: "In Progress", priority: "high", owner: "Crew 3", eta: "3:15 PM" },
      { id: "rm-5", label: "Final walkthrough · Lakehouse", stage: "Complete", priority: "low", owner: "PM", eta: "Done" },
    ],
    insights: [{ key: "insight", title: "Performance insight", description: "Bundled cabinet + flooring jobs are converting 19% faster." }],
    quickActions: [{ key: "action", label: "Create action", description: "Run workflow action." }],
    agents: [
      { key: "rebate_maximizer", label: "Rebate Maximizer", description: "Find incentive opportunities for premium upgrades.", status: "active" },
      { key: "document_whisperer", label: "Document Whisperer", description: "Assembles permit docs and missing signatures.", status: "idle" },
      { key: "draw_guardian", label: "Draw Guardian", description: "Monitors draw milestones and funding readiness.", status: "active" },
    ],
    integrations: [{ key: "maps", provider: "maps", status: "mock" }],
    pipelineViews: ["board"],
    benchmarkMetrics: ["throughput"],
    simulatorPresets: [{ key: "base", label: "Base", materialCostIncrease: 5, delayDays: 2, laborVariance: 3, closeRateChange: -1, marginCompression: 2 }],
    rightRail: {
      alerts: [
        { key: "a1", title: "Permit window narrows", detail: "2 projects need submission before 4 PM.", tone: "warning" },
        { key: "a2", title: "Change order risk", detail: "Kitchen project on Maple Ave exceeds scope threshold.", tone: "critical" },
      ],
      weather: { condition: "Clear", temperature: "72°F", location: "Scottsdale, AZ" },
      compliance: { score: "96", status: "Permit compliance in healthy range", nextAudit: "Mon 9:30 AM" },
      quickActions: ["Generate Schedule", "Escalate Change Order", "Run Rebate Scan"],
    },
    footerStatus: { lastSync: "2 min ago", connection: "online" },
  },
};
