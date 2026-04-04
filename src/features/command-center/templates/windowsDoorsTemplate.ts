import type { DashboardTemplate } from "./types";

export const windowsDoorsTemplate: DashboardTemplate = {
  key: "trade_windows_doors_v1",
  version: "v1",
  audience: "trade",
  trade: "windows_doors",
  name: "Windows & Doors Command Center",
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
      { key: "installs_scheduled", label: "Installs Scheduled", value: "26", delta: "+2", icon: "users", trend: [15, 17, 18, 20, 22, 24, 26] },
      { key: "contract_value", label: "Contract Value", value: "$392k", delta: "+4.8%", icon: "dollar", trend: [300, 312, 325, 339, 354, 371, 392] },
      { key: "lead_to_install", label: "Lead-to-Install", value: "12.6 days", delta: "-1.0 days", icon: "clock", trend: [18.5, 17.8, 16.9, 15.7, 14.9, 13.8, 12.6] },
      { key: "completion_quality", label: "Completion Quality", value: "98%", delta: "+0.7%", icon: "trending", trend: [94, 95, 95, 96, 97, 97, 98] },
    ],
    pipelineItems: [
      { id: "wd-1", label: "Double-pane retrofit lead", stage: "New", priority: "medium", owner: "Sales", eta: "Today" },
      { id: "wd-2", label: "Manufacturer slot booking", stage: "Dispatch", priority: "medium", owner: "Procurement", eta: "3:00 PM" },
      { id: "wd-3", label: "Patio slider install", stage: "In Progress", priority: "high", owner: "Install Team", eta: "4:30 PM" },
      { id: "wd-4", label: "Warranty registration sent", stage: "Complete", priority: "low", owner: "CS", eta: "Done" },
    ],
    insights: [{ key: "insight", title: "Install completion insight", description: "Weather-linked completion risk surfaced." }],
    quickActions: [{ key: "action", label: "Schedule installs", description: "Prioritize weather-safe jobs." }],
    agents: [
      { key: "storm_scout", label: "Storm Scout", description: "Monitors storm impacts on install readiness.", status: "active" },
      { key: "document_whisperer", label: "Document Whisperer", description: "Builds permit + warranty submission bundles.", status: "active" },
      { key: "code_guardian", label: "Code Guardian", description: "Checks egress and energy-code fit by project.", status: "idle" },
    ],
    integrations: [{ key: "weather", provider: "weather", status: "mock" }],
    pipelineViews: ["board", "map"],
    benchmarkMetrics: ["install_cycle_time"],
    simulatorPresets: [{ key: "base", label: "Base", materialCostIncrease: 5, delayDays: 2, laborVariance: 3, closeRateChange: -1, marginCompression: 2 }],
    rightRail: {
      alerts: [{ key: "wd-alert", title: "Supplier delay", detail: "Bronze hardware line delayed by 48 hours.", tone: "warning" }],
      weather: { condition: "Light rain", temperature: "58°F", location: "Portland, OR" },
      compliance: { score: "97", status: "Energy-label docs complete", nextAudit: "Wed 9:45 AM" },
      quickActions: ["Resequence Install Slots", "Contact Supplier", "Run Forecast"],
    },
    footerStatus: { lastSync: "5 min ago", connection: "online" },
  },
};
