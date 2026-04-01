import type { DashboardTemplate } from "./types";

export const electricalTemplate: DashboardTemplate = {
  key: "trade_electrical_v1",
  version: "v1",
  audience: "trade",
  trade: "electrical",
  name: "Electrical Command Center",
  config: {
    sidebarNav: [{ key: "today", label: "Today" }, { key: "pipeline", label: "Pipeline" }, { key: "compliance", label: "Compliance" }],
    kpis: [
      { key: "panel_close_rate", label: "Panel Upgrade Close Rate", value: "47%", delta: "+5%", tone: "positive" },
      { key: "ev_solar_opportunity", label: "EV/Solar Opportunity (ZIP)", value: "82", tone: "positive" },
      { key: "nec_score", label: "NEC Compliance Score", value: "94", delta: "+2", tone: "positive" },
    ],
    insights: [{ key: "generator", title: "Generator demand forecast", description: "High outage risk ZIPs show 22% demand lift." }],
    quickActions: [{ key: "load_calc", label: "Review load calculations", description: "Open in-progress permit/load checks" }],
    agents: [{ key: "code_guardian", label: "Code Guardian", description: "Flags NEC compliance risks in estimates." }],
    integrations: [{ key: "property", provider: "property_data", status: "mock" }],
    pipelineViews: ["board", "map"],
    benchmarkMetrics: ["permit_pass_rate", "upgrade_close_rate"],
    simulatorPresets: [{ key: "permit_delay", label: "Permit Delay", materialCostIncrease: 4, delayDays: 7, laborVariance: 6, closeRateChange: -2, marginCompression: 3 }],
  },
};
