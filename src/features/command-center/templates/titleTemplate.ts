import type { DashboardTemplate } from "./types";

export const titleTemplate: DashboardTemplate = {
  key: "title_ops_v1",
  version: "v1",
  audience: "title",
  name: "Title Ops Command Center",
  config: {
    sidebarNav: [{ key: "today", label: "Today" }, { key: "pipeline", label: "Intake" }, { key: "documents", label: "Documents" }],
    kpis: [
      { key: "days_to_close", label: "Avg Days to Close", value: "21", delta: "-1.3", tone: "positive" },
      { key: "doc_error", label: "Document Error Rate", value: "1.9%", tone: "positive" },
      { key: "nps", label: "NPS", value: "68", delta: "+3", tone: "positive" },
    ],
    insights: [{ key: "handoff", title: "Lender packet handoff", description: "4 files require balancing before release." }],
    quickActions: [{ key: "exceptions", label: "Resolve title exceptions", description: "Open flagged exceptions queue." }],
    agents: [{ key: "escrow_automator", label: "Escrow Automator", description: "Automates checklist and disclosure balancing." }],
    integrations: [{ key: "esign", provider: "esign", status: "mock" }],
    pipelineViews: ["board", "calendar"],
    benchmarkMetrics: ["days_to_close", "exception_clear_time"],
    simulatorPresets: [{ key: "doc_rework", label: "Document Rework", materialCostIncrease: 0, delayDays: 3, laborVariance: 4, closeRateChange: -1, marginCompression: 1 }],
  },
};
