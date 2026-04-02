import type { RoutingIntent } from "./types";

export type IntentClassificationInput = {
  leadSummary: string;
  serviceCategory: string;
  requestedTimeline?: string;
};

export type IntentClassificationResult = {
  label: RoutingIntent;
  confidence: number;
  modelVersion: string;
  signals: string[];
};

export const classifyIntentStub = (input: IntentClassificationInput): IntentClassificationResult => {
  const normalized = `${input.leadSummary} ${input.requestedTimeline ?? ""}`.toLowerCase();

  if (/(asap|today|emergency|urgent)/.test(normalized)) {
    return {
      label: "urgent_service",
      confidence: 0.86,
      modelVersion: "intent-stub-v1",
      signals: ["contains_urgency_keyword", `category:${input.serviceCategory}`]
    };
  }

  if (/(quote|estimate|budget)/.test(normalized)) {
    return {
      label: "quote_only",
      confidence: 0.81,
      modelVersion: "intent-stub-v1",
      signals: ["contains_quote_keyword", `category:${input.serviceCategory}`]
    };
  }

  return {
    label: "planned_project",
    confidence: 0.73,
    modelVersion: "intent-stub-v1",
    signals: ["default_planned_project", `category:${input.serviceCategory}`]
  };
};
