import type { DashboardTemplate } from "./types";

export const finishingTemplate: DashboardTemplate = {
  key: "trade_finishing_v1",
  version: "v1",
  audience: "trade",
  trade: "finishing",
  name: "Finishing Command Center",
  config: {
    sidebarNav: [{ key: "today", label: "Today" }, { key: "pipeline", label: "Pipeline" }],
    kpis: [{ key: "throughput", label: "Weekly Throughput", value: "24", tone: "neutral" }],
    insights: [{ key: "insight", title: "Performance insight", description: "Template-ready alpha configuration." }],
    quickActions: [{ key: "action", label: "Create action", description: "Run workflow action." }],
    agents: [{ key: "rebate_maximizer", label: "Rebate Maximizer", description: "Find incentive opportunities." }],
    integrations: [{ key: "maps", provider: "maps", status: "mock" }],
    pipelineViews: ["board"],
    benchmarkMetrics: ["throughput"],
    simulatorPresets: [{ key: "base", label: "Base", materialCostIncrease: 5, delayDays: 2, laborVariance: 3, closeRateChange: -1, marginCompression: 2 }],
  },
};
