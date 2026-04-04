import type { DashboardTemplate } from "./types";

export const landscapingTemplate: DashboardTemplate = {
  key: "trade_landscaping_v1",
  version: "v1",
  audience: "trade",
  trade: "landscaping",
  name: "Landscaping Command Center",
  config: {
    sidebarNav: [
      { key: "today", label: "Today", section: "operations" },
      { key: "pipeline", label: "Pipeline", section: "operations" },
      { key: "analytics", label: "Analytics", section: "operations" },
      { key: "ai-agents", label: "AI Agents", section: "operations" },
      { key: "compliance", label: "Compliance", section: "systems" },
      { key: "integrations", label: "Integrations", section: "systems" },
      { key: "settings", label: "Settings", section: "systems" },
    ],
    kpis: [
      { key: "active_projects", label: "Active Projects", value: "31", delta: "+5", icon: "users", trend: [19, 21, 23, 25, 27, 29, 31] },
      { key: "upsell_revenue", label: "Upsell Revenue", value: "$124k", delta: "+9.2%", icon: "dollar", trend: [75, 79, 83, 91, 97, 108, 124] },
      { key: "crew_utilization", label: "Crew Utilization", value: "87%", delta: "+1.9%", icon: "clock", trend: [73, 75, 77, 80, 82, 85, 87] },
      { key: "close_ratio", label: "Design Close Ratio", value: "46%", delta: "+2.3%", icon: "trending", trend: [35, 36, 38, 40, 42, 44, 46] },
    ],
    pipelineItems: [
      { id: "ls-1", label: "Xeriscape redesign consult", stage: "New", priority: "medium", owner: "Sales", eta: "Today" },
      { id: "ls-2", label: "Irrigation zoning dispatch", stage: "Dispatch", priority: "high", owner: "Ops", eta: "10:40 AM" },
      { id: "ls-3", label: "Hardscape install phase 1", stage: "In Progress", priority: "high", owner: "Crew 4", eta: "5:20 PM" },
      { id: "ls-4", label: "Seasonal maintenance renewal", stage: "Complete", priority: "low", owner: "CSM", eta: "Done" },
    ],
    insights: [{ key: "insight", title: "Performance insight", description: "Water-smart packages close 18% better in HOA zones." }],
    quickActions: [{ key: "action", label: "Create action", description: "Run workflow action." }],
    agents: [
      { key: "storm_scout", label: "Storm Scout", description: "Predicts weather-driven scheduling conflicts.", status: "active" },
      { key: "rebate_maximizer", label: "Rebate Maximizer", description: "Maps water district rebate opportunities.", status: "active" },
      { key: "document_whisperer", label: "Document Whisperer", description: "Packages design approvals and contracts.", status: "idle" },
    ],
    integrations: [{ key: "maps", provider: "maps", status: "mock" }],
    pipelineViews: ["board"],
    benchmarkMetrics: ["throughput"],
    simulatorPresets: [{ key: "base", label: "Base", materialCostIncrease: 5, delayDays: 2, laborVariance: 3, closeRateChange: -1, marginCompression: 2 }],
    rightRail: {
      alerts: [{ key: "ls-alert", title: "Irrigation escalation", detail: "2 premium clients report pressure anomalies.", tone: "warning" }],
      weather: { condition: "Breezy", temperature: "78°F", location: "San Diego, CA" },
      compliance: { score: "90", status: "HOA approvals pending for 1 project", nextAudit: "Thu 9:00 AM" },
      quickActions: ["Run Crew Planner", "Send HOA Packet", "Generate Water Rebate Plan"],
    },
    footerStatus: { lastSync: "2 min ago", connection: "online" },
  },
};
