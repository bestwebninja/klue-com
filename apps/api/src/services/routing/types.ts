export type RoutingIntent = "urgent_service" | "planned_project" | "quote_only";

export type UserType = "homeowner" | "property_manager" | "enterprise_partner" | "unknown";

export type RoutingRuleMatch = {
  ruleId: string;
  ruleVersionId: string;
  name: string;
  reason: string;
  priority: number;
};

export type RoutingDecision = {
  id: string;
  runId: string;
  tenantId: string;
  correlationId: string;
  decisionType: "candidate_selection" | "priority";
  ruleId: string;
  ruleVersionId: string;
  outcome: string;
  score: number;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type RoutingRunRecord = {
  id: string;
  tenantId: string;
  leadId: string | null;
  correlationId: string;
  status: "evaluated" | "dispatched" | "failed";
  dryRun: boolean;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
  ruleVersionId: string;
  decisionMetadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type HandoffRecord = {
  id: string;
  runId: string;
  tenantId: string;
  targetType: "provider" | "partner" | "queue";
  targetRef: string;
  status: "queued" | "sent" | "acknowledged" | "failed";
  correlationId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
