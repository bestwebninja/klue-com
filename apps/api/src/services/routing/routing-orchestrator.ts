import { classifyIntentStub, type IntentClassificationInput } from "./intent-classifier";
import { detectUserTypeStub, type UserTypeInput } from "./user-type-detector";
import { evaluateDeterministicRules } from "./deterministic-rule-evaluator";
import { orchestrateDispatch } from "./dispatch-orchestrator";
import { routingStore } from "./routing-store";

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

  const evaluationPayload = {
    runId,
    intent,
    userType,
    matchedRule: deterministic.matchedRule,
    providerQueue: deterministic.providerQueue,
    dispatchMode: deterministic.dispatchMode,
    metadata: {
      ...deterministic.metadata,
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
        providerQueue: deterministic.providerQueue,
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
    dispatchMode: "single" | "fanout";
    metadata: Record<string, unknown>;
  };

  const orchestration = orchestrateDispatch({
    runId,
    tenantId: run.tenantId,
    correlationId,
    providerQueue: responsePayload.providerQueue,
    dispatchMode: responsePayload.dispatchMode,
    metadata: responsePayload.metadata
  });

  await routingStore.appendHandoffs(runId, orchestration.handoffs);

  const updatedRun = await routingStore.updateRun(runId, {
    status: "dispatched",
    responsePayload: {
      ...run.responsePayload,
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
    handoffs: routingStore.getHandoffs(runId)
  };
};
