export type Role = "admin" | "advertiser_manager" | "analyst" | "billing_admin";

export type CampaignStatus =
  | "draft"
  | "pending_approval"
  | "active"
  | "paused"
  | "completed";

export type LeadStatus = "new" | "routed" | "accepted" | "rejected" | "refunded";

export type PlanCode = "free" | "pro_monthly" | "pro_annual" | "enterprise";

export interface ApiResponse<T> {
  data: T;
  nextCursor?: string | null;
}

export interface TenantScoped {
  tenantId: string;
  createdAt: string;
  updatedAt?: string;
}

export * from "./leads";

export * from "./marketplace-agents";
