import type { DashboardTemplate } from "./types";

export const windowsDoorsTemplate: DashboardTemplate = {
  key: "trade_windows_doors_v1",
  version: "v1",
  audience: "trade",
  trade: "windows_doors",
  name: "Windows & Doors Command Center",
  config: {
    sidebarNav: [{ key: "today", label: "Today" }, { key: "pipeline", label: "Pipeline" }],
    kpis: [{ key: "throughput", label: "Weekly Throughput", value: "19", tone: "neutral" }],
    insights: [{ key: "insight", title: "Install completion insight", description: "Weather-linked completion risk surfaced." }],
    quickActions: [{ key: "action", label: "Schedule installs", description: "Prioritize weather-safe jobs." }],
    agents: [{ key: "storm_scout", label: "Storm Scout", description: "Monitors storm impacts on install readiness." }],
    integrations: [{ key: "weather", provider: "weather", status: "mock" }],
    pipelineViews: ["board", "map"],
    benchmarkMetrics: ["install_cycle_time"],
    simulatorPresets: [{ key: "base", label: "Base", materialCostIncrease: 5, delayDays: 2, laborVariance: 3, closeRateChange: -1, marginCompression: 2 }],
  },
};
