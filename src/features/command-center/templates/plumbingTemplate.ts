import type { DashboardTemplate } from "./types";

export const plumbingTemplate: DashboardTemplate = {
  key: "trade_plumbing_v1",
  version: "v1",
  audience: "trade",
  trade: "plumbing",
  name: "Plumbing Command Center",
  config: {
    sidebarNav: [{ key: "today", label: "Today" }, { key: "pipeline", label: "Pipeline" }, { key: "analytics", label: "Analytics" }],
    kpis: [
      { key: "emergency_ratio", label: "Emergency vs Scheduled", value: "38/62", delta: "+6%", tone: "warning" },
      { key: "avg_ticket", label: "Average Ticket Size", value: "$842", delta: "+4%", tone: "positive" },
      { key: "material_variance", label: "Material Cost Variance", value: "3.1%", delta: "-1.2%", tone: "positive" },
      { key: "leak_roi", label: "Leak Detection ROI", value: "2.8x", tone: "positive" },
    ],
    insights: [{ key: "leak", title: "Leak Hunter signal", description: "Prioritize slab leak jobs in 85260 for ROI uplift." }],
    quickActions: [{ key: "dispatch", label: "Dispatch emergency crew", description: "Open high-priority dispatch modal" }],
    agents: [{ key: "leak_hunter", label: "Leak Hunter", description: "Detect probable leak clusters and upsell opportunities." }],
    integrations: [{ key: "weather", provider: "weather", status: "mock" }],
    pipelineViews: ["board", "calendar", "map"],
    benchmarkMetrics: ["ticket_size", "truck_roll_efficiency"],
    simulatorPresets: [{ key: "material_spike", label: "Copper Spike", materialCostIncrease: 18, delayDays: 1, laborVariance: 2, closeRateChange: -1, marginCompression: 4 }],
  },
};
