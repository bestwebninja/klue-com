import type {
  MarketplaceAgentCode,
  MarketplaceAgentTaskCreateRequest,
  MarketplaceAgentTaskRecord,
  MarketplaceAgentTransitionRequest,
  MarketplaceRouterDecision
} from "@kluje/shared";
import { MARKETPLACE_AGENT_WORKFLOW_TEMPLATES } from "./workflow-templates";

const taskStore = new Map<string, MarketplaceAgentTaskRecord>();

const nowIso = () => new Date().toISOString();

const taskId = () => crypto.randomUUID();

const correlationId = (provided?: string) => provided || crypto.randomUUID();

const defaultPriority = (code: MarketplaceAgentCode) => {
  if (code === "A7_TRUST_VERIFICATION_COMPLIANCE" || code === "A8_SUPPORT_DISPUTE_TRIAGE") return "high" as const;
  return "normal" as const;
};

export const createMarketplaceAgentTask = (request: MarketplaceAgentTaskCreateRequest): MarketplaceAgentTaskRecord => {
  const createdAt = nowIso();
  const record: MarketplaceAgentTaskRecord = {
    id: taskId(),
    tenantId: request.tenantId,
    agentCode: request.agentCode,
    status: "queued",
    priority: request.priority ?? defaultPriority(request.agentCode),
    source: request.source,
    dedupeKey: request.dedupeKey,
    correlationId: correlationId(request.correlationId),
    requestedBy: request.requestedBy,
    summary: request.summary,
    input: request.input,
    context: request.context ?? {},
    output: {},
    createdAt,
    updatedAt: createdAt
  };

  taskStore.set(record.id, record);
  return record;
};

export const listMarketplaceAgentTasks = (tenantId: string, agentCode?: MarketplaceAgentCode) => {
  return [...taskStore.values()].filter((task) => task.tenantId === tenantId && (!agentCode || task.agentCode === agentCode));
};

export const getMarketplaceAgentTask = (taskIdValue: string) => taskStore.get(taskIdValue);

export const transitionMarketplaceAgentTask = (request: MarketplaceAgentTransitionRequest) => {
  const current = taskStore.get(request.taskId);
  if (!current) return null;

  const updated: MarketplaceAgentTaskRecord = {
    ...current,
    status: request.status,
    output: request.output ?? current.output,
    failureCode: request.failureCode,
    failureMessage: request.failureMessage,
    startedAt: current.startedAt ?? (request.status === "in_progress" ? nowIso() : current.startedAt),
    completedAt:
      request.status === "completed" || request.status === "failed" || request.status === "cancelled"
        ? nowIso()
        : current.completedAt,
    updatedAt: nowIso()
  };

  taskStore.set(updated.id, updated);
  return updated;
};

export const decideNextMarketplaceAgent = (task: MarketplaceAgentTaskRecord): MarketplaceRouterDecision => {
  const reasonCodes: string[] = [];
  let selectedAgentCode: MarketplaceAgentCode = "A0_ROUTER_ORCHESTRATOR";

  if (!task.input.serviceCategory || !task.input.location) {
    selectedAgentCode = "A1_CUSTOMER_CONCIERGE";
    reasonCodes.push("missing_customer_basics");
  } else if (!task.input.timeline || !task.input.budgetRange) {
    selectedAgentCode = "A2_JOB_INTAKE_SCOPING";
    reasonCodes.push("missing_scope_fields");
  } else if (task.context?.areaRiskBand === "high") {
    selectedAgentCode = "A7_TRUST_VERIFICATION_COMPLIANCE";
    reasonCodes.push("high_area_risk_band");
  } else if (task.input.quotesReady === true) {
    selectedAgentCode = "A4_QUOTE_COMPARISON_ADVISOR";
    reasonCodes.push("quotes_available");
  } else {
    selectedAgentCode = "A3_MATCHING_QUOTE_DISPATCH";
    reasonCodes.push("scope_ready_for_matching");
  }

  const requiresHumanReview =
    task.priority === "urgent" ||
    selectedAgentCode === "A7_TRUST_VERIFICATION_COMPLIANCE" ||
    Boolean(task.input.disputeReason);

  return {
    tenantId: task.tenantId,
    taskId: task.id,
    selectedAgentCode,
    reasonCodes,
    requiresHumanReview,
    confidence: requiresHumanReview ? 0.72 : 0.91
  };
};

export const listMarketplaceAgentWorkflowTemplates = () => MARKETPLACE_AGENT_WORKFLOW_TEMPLATES;
