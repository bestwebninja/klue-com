import type { DispatchRecord, HandoffRecord } from "./types";

export type DispatchInput = {
  runId: string;
  tenantId: string;
  correlationId: string;
  providerQueue: string[];
  dispatchMode: "single" | "fanout";
  metadata: Record<string, unknown>;
};

export const orchestrateDispatch = (input: DispatchInput): {
  handoffs: HandoffRecord[];
  dispatches: DispatchRecord[];
  summary: Record<string, unknown>;
} => {
  const now = new Date().toISOString();
  const targets = input.dispatchMode === "single" ? input.providerQueue.slice(0, 1) : input.providerQueue.slice(0, 3);
  const quoteRequestId = String(input.metadata.quoteRequestId ?? crypto.randomUUID());

  const handoffs: HandoffRecord[] = targets.map((targetRef, index) => ({
    id: crypto.randomUUID(),
    runId: input.runId,
    tenantId: input.tenantId,
    correlationId: input.correlationId,
    targetType: targetRef.includes("queue") ? "queue" : "provider",
    targetRef,
    status: "queued",
    payload: {
      sequence: index + 1,
      dispatchMode: input.dispatchMode,
      metadata: input.metadata
    },
    createdAt: now,
    updatedAt: now
  }));

  const dispatches: DispatchRecord[] = targets.map((providerId, index) => ({
    id: crypto.randomUUID(),
    runId: input.runId,
    quoteRequestId,
    tenantId: input.tenantId,
    providerId,
    correlationId: input.correlationId,
    status: "queued",
    attemptCount: 0,
    lastError: null,
    payload: {
      sequence: index + 1,
      quoteRequestId,
      metadata: input.metadata
    },
    createdAt: now,
    updatedAt: now
  }));

  return {
    handoffs,
    dispatches,
    summary: {
      dispatchMode: input.dispatchMode,
      attemptedTargets: targets.length,
      quoteRequestId,
      createdAt: now
    }
  };
};
