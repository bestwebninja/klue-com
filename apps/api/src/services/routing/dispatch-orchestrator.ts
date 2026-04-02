import type { HandoffRecord } from "./types";

export type DispatchInput = {
  runId: string;
  tenantId: string;
  correlationId: string;
  providerQueue: string[];
  dispatchMode: "single" | "fanout";
  metadata: Record<string, unknown>;
};

export const orchestrateDispatch = (input: DispatchInput): { handoffs: HandoffRecord[]; summary: Record<string, unknown> } => {
  const now = new Date().toISOString();
  const targets = input.dispatchMode === "single" ? input.providerQueue.slice(0, 1) : input.providerQueue.slice(0, 3);

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

  return {
    handoffs,
    summary: {
      dispatchMode: input.dispatchMode,
      attemptedTargets: targets.length,
      createdAt: now
    }
  };
};
