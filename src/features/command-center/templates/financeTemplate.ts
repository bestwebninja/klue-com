import type { DashboardTemplate } from "./types";

export const financeTemplate: DashboardTemplate = {
  key: "finance_lender_v1",
  version: "v1",
  audience: "finance",
  name: "Finance Lender Command Center",
  config: {
    sidebarNav: [{ key: "today", label: "Today" }, { key: "pipeline", label: "Pipeline" }, { key: "analytics", label: "Analytics" }],
    kpis: [
      { key: "portfolio_risk", label: "Portfolio Risk Score", value: "71", tone: "warning" },
      { key: "draw_approval", label: "Draw Approval Time", value: "2.4 days", delta: "-0.5d", tone: "positive" },
      { key: "default_probability", label: "Default Probability by ZIP", value: "3.8%", tone: "warning" },
    ],
    insights: [{ key: "draw", title: "Draw queue pressure", description: "12 projects exceed SLA and need review." }],
    quickActions: [{ key: "review_draw", label: "Review draw queue", description: "Open highest-risk draw requests." }],
    agents: [{ key: "draw_guardian", label: "Draw Guardian", description: "Screens draw requests for anomalies and fraud patterns." }],
    integrations: [{ key: "finance", provider: "finance", status: "mock" }],
    pipelineViews: ["board", "calendar"],
    benchmarkMetrics: ["approval_sla", "loss_rate"],
    simulatorPresets: [{ key: "rate_shock", label: "Rate Shock", materialCostIncrease: 0, delayDays: 5, laborVariance: 0, closeRateChange: -5, marginCompression: 2 }],
  },
};
