export type MarketplaceAgentCode =
  | "A0_ROUTER_ORCHESTRATOR"
  | "A1_CUSTOMER_CONCIERGE"
  | "A2_JOB_INTAKE_SCOPING"
  | "A3_MATCHING_QUOTE_DISPATCH"
  | "A4_QUOTE_COMPARISON_ADVISOR"
  | "A5_SCHEDULING_MESSAGING_COORDINATOR"
  | "A6_ASK_EXPERT_MODERATOR"
  | "A7_TRUST_VERIFICATION_COMPLIANCE"
  | "A8_SUPPORT_DISPUTE_TRIAGE";

export type MarketplaceAgentTaskStatus = "queued" | "in_progress" | "waiting" | "completed" | "failed" | "cancelled";

export type MarketplaceAgentPriority = "low" | "normal" | "high" | "urgent";

export interface MarketplaceAgentTaskContext {
  leadId?: string;
  quoteRequestId?: string;
  routingRunId?: string;
  conversationId?: string;
  areaRiskScore?: number;
  areaRiskBand?: "low" | "moderate" | "elevated" | "high";
  trustSignals?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MarketplaceAgentTaskCreateRequest {
  tenantId: string;
  agentCode: MarketplaceAgentCode;
  source: "api" | "workflow" | "system" | "manual";
  priority?: MarketplaceAgentPriority;
  dedupeKey?: string;
  correlationId?: string;
  requestedBy?: string;
  summary: string;
  input: Record<string, unknown>;
  context?: MarketplaceAgentTaskContext;
}

export interface MarketplaceAgentTaskRecord {
  id: string;
  tenantId: string;
  agentCode: MarketplaceAgentCode;
  status: MarketplaceAgentTaskStatus;
  priority: MarketplaceAgentPriority;
  source: "api" | "workflow" | "system" | "manual";
  dedupeKey?: string;
  correlationId: string;
  requestedBy?: string;
  summary: string;
  input: Record<string, unknown>;
  context: MarketplaceAgentTaskContext;
  output: Record<string, unknown>;
  failureCode?: string;
  failureMessage?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface MarketplaceAgentTransitionRequest {
  taskId: string;
  status: MarketplaceAgentTaskStatus;
  output?: Record<string, unknown>;
  failureCode?: string;
  failureMessage?: string;
}

export interface MarketplaceAgentWorkflowTemplate {
  templateId: string;
  agentCode: MarketplaceAgentCode;
  name: string;
  description: string;
  triggerEvent: string;
  nextAgentCodes: MarketplaceAgentCode[];
  deterministicRules: string[];
}

export interface MarketplaceRouterDecision {
  tenantId: string;
  taskId: string;
  selectedAgentCode: MarketplaceAgentCode;
  reasonCodes: string[];
  requiresHumanReview: boolean;
  confidence: number;
}
