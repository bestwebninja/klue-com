import type { DashboardTemplate } from "./types";

export const finishingTemplate: DashboardTemplate = {
  key: "trade_finishing_v1",
  version: "v1",
  audience: "trade",
  trade: "finishing",
  name: "Finishing Command Center",
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
      { key: "punchlist_backlog", label: "Punchlist Backlog", value: "18", delta: "-4", icon: "users", trend: [31, 29, 27, 24, 22, 20, 18] },
      { key: "change_order_value", label: "Change Order Value", value: "$186k", delta: "+6.3%", icon: "dollar", trend: [120, 128, 136, 149, 160, 173, 186] },
      { key: "turnaround", label: "Turnaround Time", value: "3.4 days", delta: "-0.6 days", icon: "clock", trend: [5.7, 5.1, 4.9, 4.4, 4.1, 3.7, 3.4] },
      { key: "inspection_pass", label: "Inspection Pass", value: "96%", delta: "+1.2%", icon: "trending", trend: [88, 89, 91, 93, 94, 95, 96] },
    ],
    pipelineItems: [
      { id: "fn-1", label: "Final paint touchups", stage: "New", priority: "medium", owner: "PM", eta: "Today" },
      { id: "fn-2", label: "Dispatch flooring vendor", stage: "Dispatch", priority: "medium", owner: "Coordinator", eta: "12:45 PM" },
      { id: "fn-3", label: "Cabinet hardware install", stage: "In Progress", priority: "high", owner: "Finishing Crew", eta: "4:10 PM" },
      { id: "fn-4", label: "Client handoff packet", stage: "Complete", priority: "low", owner: "Admin", eta: "Done" },
    ],
    insights: [{ key: "insight", title: "Performance insight", description: "Bundled flooring + trim packages reduced callbacks by 16%." }],
    quickActions: [{ key: "action", label: "Create action", description: "Run workflow action." }],
    agents: [
      { key: "document_whisperer", label: "Document Whisperer", description: "Generates client-ready handoff packets.", status: "active" },
      { key: "code_guardian", label: "Code Guardian", description: "Flags finish-scope compliance issues.", status: "idle" },
      { key: "rebate_maximizer", label: "Rebate Maximizer", description: "Finds appliance and fixture incentive options.", status: "active" },
    ],
    integrations: [{ key: "maps", provider: "maps", status: "mock" }],
    pipelineViews: ["board"],
    benchmarkMetrics: ["throughput"],
    simulatorPresets: [{ key: "base", label: "Base", materialCostIncrease: 5, delayDays: 2, laborVariance: 3, closeRateChange: -1, marginCompression: 2 }],
    rightRail: {
      alerts: [{ key: "fn-alert", title: "Punchlist warning", detail: "2 premium projects exceed target close window.", tone: "warning" }],
      weather: { condition: "Mild", temperature: "67°F", location: "Nashville, TN" },
      compliance: { score: "95", status: "Final inspection docs complete", nextAudit: "Mon 2:00 PM" },
      quickActions: ["Start Punchlist Sweep", "Create Handoff Bundle", "Notify Homeowner"],
    },
    footerStatus: { lastSync: "4 min ago", connection: "online" },
  },
};
