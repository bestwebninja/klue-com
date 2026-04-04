import { LucideIcon } from "lucide-react";

export type Audience = "trade" | "finance" | "title";
export type TradeKey = "plumbing" | "electrical" | "hvac" | "roofing" | "remodeling" | "finishing" | "landscaping" | "windows_doors";
export type BusinessFocus = "service_repair" | "new_build" | "mixed";
export type PipelineViewType = "board" | "calendar" | "map";

export interface NavItemConfig { key: string; label: string; icon?: LucideIcon; section?: "operations" | "systems"; }
export interface KPIConfig {
  key: string;
  label: string;
  value: string;
  delta?: string;
  tone?: "neutral" | "positive" | "warning";
  icon?: "trending" | "dollar" | "clock" | "users";
  trend?: number[];
}
export interface InsightCardConfig { key: string; title: string; description: string; }
export interface QuickActionConfig { key: string; label: string; description: string; }
export interface AgentConfig { key: string; label: string; description: string; status?: "active" | "idle"; }
export interface IntegrationConfig { key: string; provider: string; status: "connected" | "mock" | "disconnected"; }
export interface SimulatorPreset { key: string; label: string; materialCostIncrease: number; delayDays: number; laborVariance: number; closeRateChange: number; marginCompression: number; }

export interface PipelineCardConfig {
  id: string;
  label: string;
  stage: "New" | "Dispatch" | "In Progress" | "Complete";
  priority?: "low" | "medium" | "high";
  owner?: string;
  eta?: string;
}

export interface DashboardAlertConfig { key: string; title: string; detail: string; tone?: "info" | "warning" | "critical"; }
export interface ComplianceSummaryConfig { score: string; status: string; nextAudit: string; }
export interface RightRailConfig {
  alerts: DashboardAlertConfig[];
  weather?: { condition: string; temperature: string; location: string };
  compliance?: ComplianceSummaryConfig;
  quickActions?: string[];
}

export interface DashboardTemplateConfig {
  sidebarNav: NavItemConfig[];
  kpis: KPIConfig[];
  insights: InsightCardConfig[];
  quickActions: QuickActionConfig[];
  agents: AgentConfig[];
  integrations: IntegrationConfig[];
  pipelineViews: PipelineViewType[];
  benchmarkMetrics: string[];
  simulatorPresets: SimulatorPreset[];
  pipelineItems?: PipelineCardConfig[];
  rightRail?: RightRailConfig;
  footerStatus?: { lastSync: string; connection: "online" | "degraded" | "offline" };
}

export interface DashboardTemplate {
  key: string;
  version: string;
  audience: Audience;
  trade?: TradeKey;
  name: string;
  config: DashboardTemplateConfig;
}
