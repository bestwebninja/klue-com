import { classifyIntentStub, type IntentClassificationInput } from "./intent-classifier";
import { detectUserTypeStub, type UserTypeInput } from "./user-type-detector";
import { evaluateDeterministicRules } from "./deterministic-rule-evaluator";
import { orchestrateDispatch } from "./dispatch-orchestrator";
import { routingStore } from "./routing-store";
import { searchProviders } from "./provider-routing-service";

export type EvaluateRoutingInput = {
  tenantId: string;
  leadId?: string;
  correlationId: string;
  dryRun?: boolean;
  leadSummary: string;
  serviceCategory: string;
  requester: UserTypeInput;
  requestedTimeline?: string;
  attributes?: Record<string, unknown>;
  budget?: number;
  zipCode?: string;
  topN?: number;
};

export const evaluateRouting = async (input: EvaluateRoutingInput) => {
  const now = new Date().toISOString();
  const runId = crypto.randomUUID();

  const intent = classifyIntentStub({
    leadSummary: input.leadSummary,
    serviceCategory: input.serviceCategory,
    requestedTimeline: input.requestedTimeline
  } satisfies IntentClassificationInput);

  const userType = detectUserTypeStub(input.requester);
  const deterministic = evaluateDeterministicRules({
    serviceCategory: input.serviceCategory,
    intent: intent.label,
    userType: userType.userType,
    dryRun: input.dryRun
  });

  const providerSearch = await searchProviders({
    tenantId: input.tenantId,
    serviceCategory: input.serviceCategory,
    budget: input.budget ?? null,
    zipCode: input.zipCode ?? null,
    intent: intent.label,
    topN: input.topN ?? (intent.label === "urgent_service" ? 3 : 1)
  });

  const selectedProviderIds = providerSearch.selected.map((candidate) => candidate.providerId);

  const evaluationPayload = {
    runId,
    intent,
    userType,
    matchedRule: deterministic.matchedRule,
    providerQueue: selectedProviderIds.length > 0 ? selectedProviderIds : deterministic.providerQueue,
    providerCandidates: providerSearch.selected,
    dispatchMode: deterministic.dispatchMode,
    metadata: {
      ...deterministic.metadata,
      hardConstraintFiltering: {
        totalProviders: providerSearch.totalProviders,
        filteredProviders: providerSearch.filteredCount
      },
      attributes: input.attributes ?? {}
    }
  };

  await routingStore.saveRun({
    id: runId,
    tenantId: input.tenantId,
    leadId: input.leadId ?? null,
    correlationId: input.correlationId,
    status: "evaluated",
    dryRun: Boolean(input.dryRun),
    requestPayload: {
      leadSummary: input.leadSummary,
      serviceCategory: input.serviceCategory,
      requestedTimeline: input.requestedTimeline,
      budget: input.budget,
      zipCode: input.zipCode,
      requester: input.requester,
      attributes: input.attributes
    },
    responsePayload: evaluationPayload,
    ruleVersionId: deterministic.matchedRule.ruleVersionId,
    decisionMetadata: {
      intentSignals: intent.signals,
      userTypeSignals: userType.signals,
      reason: deterministic.matchedRule.reason
    },
    createdAt: now,
    updatedAt: now
  });

  await routingStore.appendDecisions(runId, [
    {
      id: crypto.randomUUID(),
      runId,
      tenantId: input.tenantId,
      correlationId: input.correlationId,
      decisionType: "candidate_selection",
      ruleId: deterministic.matchedRule.ruleId,
      ruleVersionId: deterministic.matchedRule.ruleVersionId,
      outcome: deterministic.providerQueue.join(","),
      score: deterministic.dispatchMode === "fanout" ? 100 : 80,
      metadata: {
        providerQueue: evaluationPayload.providerQueue,
        selectedProviders: providerSearch.selected,
        intent: intent.label,
        userType: userType.userType
      },
      createdAt: now
    }
  ]);

  return evaluationPayload;
};

export const dispatchRoutingRun = async (runId: string, correlationId: string) => {
  const run = routingStore.getRun(runId);
  if (!run) return null;

  const responsePayload = run.responsePayload as {
    providerQueue: string[];
    providerCandidates?: Array<{ providerId: string; score: number; reasoning: string[]; endpointUrl: string | null }>;
    dispatchMode: "single" | "fanout";
    metadata: Record<string, unknown>;
  };

  const quoteRequestId = crypto.randomUUID();
  const quoteRequestedAt = new Date().toISOString();
  await routingStore.saveQuoteRequest({
    id: quoteRequestId,
    tenantId: run.tenantId,
    runId,
    leadId: run.leadId,
    serviceCategory: String((run.requestPayload as Record<string, unknown>).serviceCategory ?? "unknown"),
    status: "evaluated",
    requestedAt: quoteRequestedAt,
    quoteByAt: null,
    reasoning: {
      decisionMetadata: run.decisionMetadata,
      providerCandidates: responsePayload.providerCandidates ?? []
    },
    outcomes: {
      dispatches: []
    },
    createdAt: quoteRequestedAt,
    updatedAt: quoteRequestedAt
  });

  const orchestration = orchestrateDispatch({
    runId,
    tenantId: run.tenantId,
    correlationId,
    providerQueue: responsePayload.providerQueue,
    dispatchMode: responsePayload.dispatchMode,
    metadata: {
      ...responsePayload.metadata,
      quoteRequestId,
      providerCandidates: responsePayload.providerCandidates ?? []
    }
  });

  await routingStore.appendHandoffs(runId, orchestration.handoffs);
  await routingStore.appendDispatches(runId, orchestration.dispatches);

  const failedDispatches = orchestration.dispatches.filter((item) => item.status === "failed").length;
  const quoteRequestStatus =
    failedDispatches === orchestration.dispatches.length
      ? "partially_failed"
      : failedDispatches > 0
        ? "partially_failed"
        : "dispatched";

  await routingStore.updateQuoteRequest(quoteRequestId, {
    status: quoteRequestStatus,
    outcomes: {
      dispatches: orchestration.dispatches,
      summary: orchestration.summary
    }
  });

  const updatedRun = await routingStore.updateRun(runId, {
    status: "dispatched",
    responsePayload: {
      ...run.responsePayload,
      quoteRequestId,
      dispatch: orchestration.summary
    },
    decisionMetadata: {
      ...run.decisionMetadata,
      dispatchCorrelationId: correlationId
    }
  });

  return {
    run: updatedRun,
    handoffs: orchestration.handoffs,
    summary: orchestration.summary
  };
};

export const getRoutingRun = (runId: string) => {
  const run = routingStore.getRun(runId);
  if (!run) return null;

  return {
    run,
    decisions: routingStore.getDecisions(runId),
    handoffs: routingStore.getHandoffs(runId),
    dispatches: routingStore.getDispatches(runId)
  };
};

export const getQuoteRequest = (id: string) => routingStore.getQuoteRequest(id);
