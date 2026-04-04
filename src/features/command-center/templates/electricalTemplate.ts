import type { DashboardTemplate } from "./types";

export const electricalTemplate: DashboardTemplate = {
  key: "trade_electrical_v1",
  version: "v1",
  audience: "trade",
  trade: "electrical",
  name: "Electrical Command Center",
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
      { key: "panel_close_rate", label: "Panel Upgrade Close", value: "47%", delta: "+5%", tone: "positive", icon: "trending", trend: [31, 33, 37, 39, 41, 44, 47] },
      { key: "ev_solar_opportunity", label: "EV/Solar Opps", value: "82", delta: "+9", tone: "positive", icon: "users", trend: [55, 57, 63, 69, 71, 76, 82] },
      { key: "nec_score", label: "NEC Compliance", value: "94", delta: "+2", tone: "positive", icon: "clock", trend: [87, 88, 89, 90, 92, 93, 94] },
      { key: "avg_margin", label: "Gross Margin", value: "34%", delta: "-1.1%", tone: "warning", icon: "dollar", trend: [37, 36.2, 35.7, 35.1, 34.8, 34.4, 34] },
    ],
    pipelineItems: [
      { id: "el-1", label: "Whole-home rewire estimate", stage: "New", priority: "high", owner: "Sales", eta: "Today" },
      { id: "el-2", label: "Permit + load calcs", stage: "Dispatch", priority: "medium", owner: "Permits", eta: "1:20 PM" },
      { id: "el-3", label: "EV charger rough-in", stage: "In Progress", priority: "medium", owner: "Crew C", eta: "4:00 PM" },
      { id: "el-4", label: "Generator install final", stage: "Complete", priority: "low", owner: "QA", eta: "Done" },
    ],
    insights: [{ key: "generator", title: "Generator demand forecast", description: "High outage risk ZIPs show 22% demand lift." }],
    quickActions: [{ key: "load_calc", label: "Review load calculations", description: "Open in-progress permit/load checks" }],
    agents: [
      { key: "code_guardian", label: "Code Guardian", description: "Flags NEC compliance risks in estimates.", status: "active" },
      { key: "storm_scout", label: "Storm Scout", description: "Monitors outage forecasts and demand spikes.", status: "active" },
      { key: "draw_guardian", label: "Draw Guardian", description: "Tracks project milestone payout readiness.", status: "idle" },
    ],
    integrations: [{ key: "property", provider: "property_data", status: "mock" }],
    pipelineViews: ["board", "map"],
    benchmarkMetrics: ["permit_pass_rate", "upgrade_close_rate"],
    simulatorPresets: [{ key: "permit_delay", label: "Permit Delay", materialCostIncrease: 4, delayDays: 7, laborVariance: 6, closeRateChange: -2, marginCompression: 3 }],
    rightRail: {
      alerts: [{ key: "el-alert", title: "Permit aging", detail: "3 permits older than 6 days require follow-up.", tone: "warning" }],
      weather: { condition: "Wind advisory", temperature: "69°F", location: "Denver Front Range" },
      compliance: { score: "94", status: "Critical NEC checks are green", nextAudit: "Thu 8:45 AM" },
      quickActions: ["Open Permit Queue", "Run Code Scan", "Assign Inspector"],
    },
    footerStatus: { lastSync: "30 sec ago", connection: "online" },
  },
};
