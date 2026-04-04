import type { DashboardTemplate } from "./types";

export const roofingTemplate: DashboardTemplate = {
  key: "trade_roofing_v1",
  version: "v1",
  audience: "trade",
  trade: "roofing",
  name: "Roofing Command Center",
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
      { key: "inspection_volume", label: "Inspections Booked", value: "42", delta: "+4", icon: "users", trend: [27, 29, 31, 34, 37, 39, 42] },
      { key: "avg_contract", label: "Avg Contract", value: "$14.8k", delta: "+5.1%", icon: "dollar", trend: [11.5, 12, 12.6, 13.2, 13.8, 14.2, 14.8] },
      { key: "claim_cycle", label: "Insurance Cycle", value: "11.2 days", delta: "-0.9 days", icon: "clock", trend: [15, 14.1, 13.8, 13.1, 12.6, 11.9, 11.2] },
      { key: "storm_win_rate", label: "Storm Win Rate", value: "52%", delta: "+3.4%", icon: "trending", trend: [42, 43, 45, 47, 49, 50, 52] },
    ],
    pipelineItems: [
      { id: "rf-1", label: "Storm damage lead intake", stage: "New", priority: "high", owner: "Inside Sales", eta: "Now" },
      { id: "rf-2", label: "Carrier adjuster scheduling", stage: "Dispatch", priority: "medium", owner: "Claims", eta: "2:15 PM" },
      { id: "rf-3", label: "Tear-off + underlayment", stage: "In Progress", priority: "high", owner: "Roof Crew 2", eta: "6:00 PM" },
      { id: "rf-4", label: "Warranty packet release", stage: "Complete", priority: "low", owner: "Admin", eta: "Done" },
    ],
    insights: [{ key: "insight", title: "Performance insight", description: "Neighborhood canvass leads convert 12% better after storms." }],
    quickActions: [{ key: "action", label: "Create action", description: "Run workflow action." }],
    agents: [
      { key: "storm_scout", label: "Storm Scout", description: "Monitors hail tracks and lead density.", status: "active" },
      { key: "document_whisperer", label: "Document Whisperer", description: "Assembles claim documentation packets.", status: "active" },
      { key: "escrow_automator", label: "Escrow Automator", description: "Tracks disbursement checkpoints for funded work.", status: "idle" },
    ],
    integrations: [{ key: "maps", provider: "maps", status: "mock" }],
    pipelineViews: ["board"],
    benchmarkMetrics: ["throughput"],
    simulatorPresets: [{ key: "base", label: "Base", materialCostIncrease: 5, delayDays: 2, laborVariance: 3, closeRateChange: -1, marginCompression: 2 }],
    rightRail: {
      alerts: [{ key: "rf-alert", title: "Hail path detected", detail: "New hail track intersects 3 active ZIP clusters.", tone: "warning" }],
      weather: { condition: "High winds", temperature: "61°F", location: "Oklahoma City" },
      compliance: { score: "91", status: "2 claims missing photo sequence metadata", nextAudit: "Tue 1:30 PM" },
      quickActions: ["Launch Storm Campaign", "Audit Claim Docs", "Assign Field Inspector"],
    },
    footerStatus: { lastSync: "1 min ago", connection: "online" },
  },
};
