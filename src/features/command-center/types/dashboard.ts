export type CommandCenterAudience = "trade" | "finance" | "title";
export type CommandCenterTradeKey = "plumbing" | "electrical" | "hvac" | "roofing" | "remodeling" | "finishing" | "landscaping" | "windows_doors";

export interface DashboardInstance {
  id: string;
  businessUnitId: string;
  templateKey: string;
  audience: CommandCenterAudience;
  tradeKey?: CommandCenterTradeKey;
  status: "active" | "draft";
}
