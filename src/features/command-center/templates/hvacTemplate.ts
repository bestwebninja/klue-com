import type { DashboardTemplate } from "./types";

export const hvacTemplate: DashboardTemplate = {
  key: "trade_hvac_v1",
  version: "v1",
  audience: "trade",
  trade: "hvac",
  name: "Hvac Command Center",
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
      { key: "service_calls", label: "Service Calls", value: "64", delta: "+8%", icon: "users", trend: [42, 44, 48, 52, 56, 59, 64] },
      { key: "avg_job_value", label: "Avg Job Value", value: "$1,240", delta: "+3.6%", icon: "dollar", trend: [990, 1040, 1080, 1130, 1170, 1210, 1240] },
      { key: "response_time", label: "Avg Response", value: "2.1 hrs", delta: "-0.4 hrs", icon: "clock", trend: [3.4, 3.1, 2.9, 2.6, 2.5, 2.3, 2.1] },
      { key: "maintenance_renewal", label: "Plan Renewal", value: "71%", delta: "+1.8%", icon: "trending", trend: [61, 63, 64, 66, 68, 69, 71] },
    ],
    pipelineItems: [
      { id: "hv-1", label: "Seasonal tune-up bundle", stage: "New", priority: "medium", owner: "Sales", eta: "Today" },
      { id: "hv-2", label: "Dispatch condenser replacement", stage: "Dispatch", priority: "high", owner: "Ops", eta: "11:15 AM" },
      { id: "hv-3", label: "Heat pump retrofit", stage: "In Progress", priority: "high", owner: "Crew D", eta: "5:00 PM" },
      { id: "hv-4", label: "Final QA and invoicing", stage: "Complete", priority: "low", owner: "Office", eta: "Done" },
    ],
    insights: [{ key: "insight", title: "Cooling demand signal", description: "Afternoon call volumes are up 14% in newer subdivisions." }],
    quickActions: [{ key: "action", label: "Optimize routes", description: "Rebalance service calls by proximity and urgency." }],
    agents: [
      { key: "storm_scout", label: "Storm Scout", description: "Predicts demand surges tied to weather systems.", status: "active" },
      { key: "rebate_maximizer", label: "Rebate Maximizer", description: "Surfaces utility rebates for system upgrades.", status: "active" },
      { key: "document_whisperer", label: "Document Whisperer", description: "Builds completion packets and warranty docs.", status: "idle" },
    ],
    integrations: [{ key: "maps", provider: "maps", status: "mock" }],
    pipelineViews: ["board"],
    benchmarkMetrics: ["throughput"],
    simulatorPresets: [{ key: "base", label: "Base", materialCostIncrease: 5, delayDays: 2, laborVariance: 3, closeRateChange: -1, marginCompression: 2 }],
    rightRail: {
      alerts: [{ key: "hv-alert", title: "Heatwave prep", detail: "High-volume window expected tomorrow afternoon.", tone: "info" }],
      weather: { condition: "Partly cloudy", temperature: "83°F", location: "Austin, TX" },
      compliance: { score: "92", status: "Refrigerant logs up to date", nextAudit: "Fri 10:15 AM" },
      quickActions: ["Load Balance", "Start Rebate Batch", "Notify On-call Techs"],
    },
    footerStatus: { lastSync: "3 min ago", connection: "degraded" },
  },
};
