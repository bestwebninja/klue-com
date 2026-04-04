import type { DashboardTemplate } from "./types";

export const plumbingTemplate: DashboardTemplate = {
  key: "trade_plumbing_v1",
  version: "v1",
  audience: "trade",
  trade: "plumbing",
  name: "Plumbing Command Center",
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
      { key: "emergency_ratio", label: "Emergency Mix", value: "38/62", delta: "+6%", tone: "warning", icon: "users", trend: [26, 29, 31, 32, 34, 36, 38] },
      { key: "avg_ticket", label: "Average Ticket", value: "$842", delta: "+4%", tone: "positive", icon: "dollar", trend: [730, 755, 780, 800, 810, 830, 842] },
      { key: "material_variance", label: "Material Variance", value: "3.1%", delta: "-1.2%", tone: "positive", icon: "clock", trend: [6.2, 5.5, 4.8, 4.3, 3.9, 3.4, 3.1] },
      { key: "leak_roi", label: "Leak Detection ROI", value: "2.8x", delta: "+0.3x", tone: "positive", icon: "trending", trend: [1.7, 1.9, 2.1, 2.2, 2.4, 2.6, 2.8] },
    ],
    pipelineItems: [
      { id: "pl-1", label: "Slab leak diagnostic · 85260", stage: "New", priority: "high", owner: "Dispatch", eta: "ASAP" },
      { id: "pl-2", label: "Tankless install quote review", stage: "Dispatch", priority: "medium", owner: "Ops", eta: "12:00 PM" },
      { id: "pl-3", label: "Drain scope and repair", stage: "In Progress", priority: "medium", owner: "Crew A", eta: "2:40 PM" },
      { id: "pl-4", label: "Fixture package closeout", stage: "Complete", priority: "low", owner: "Back Office", eta: "Done" },
    ],
    insights: [{ key: "leak", title: "Leak Hunter signal", description: "Prioritize slab leak jobs in 85260 for ROI uplift." }],
    quickActions: [{ key: "dispatch", label: "Dispatch emergency crew", description: "Open high-priority dispatch modal" }],
    agents: [
      { key: "leak_hunter", label: "Leak Hunter", description: "Detect probable leak clusters and upsell opportunities.", status: "active" },
      { key: "document_whisperer", label: "Document Whisperer", description: "Summarizes service photos and signatures.", status: "idle" },
      { key: "rebate_maximizer", label: "Rebate Maximizer", description: "Flags water-efficiency rebate opportunities.", status: "active" },
    ],
    integrations: [{ key: "weather", provider: "weather", status: "mock" }],
    pipelineViews: ["board", "calendar", "map"],
    benchmarkMetrics: ["ticket_size", "truck_roll_efficiency"],
    simulatorPresets: [{ key: "material_spike", label: "Copper Spike", materialCostIncrease: 18, delayDays: 1, laborVariance: 2, closeRateChange: -1, marginCompression: 4 }],
    rightRail: {
      alerts: [{ key: "pl-alert", title: "Emergency queue elevated", detail: "5 same-day calls still unassigned.", tone: "critical" }],
      weather: { condition: "Dry heat", temperature: "88°F", location: "Phoenix Metro" },
      compliance: { score: "93", status: "Backflow certifications due this week", nextAudit: "Wed 11:00 AM" },
      quickActions: ["Route Optimizer", "Request Additional Crew", "Generate Leak Report"],
    },
    footerStatus: { lastSync: "1 min ago", connection: "online" },
  },
};
