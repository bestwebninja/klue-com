import type { RoutingIntent, RoutingRuleMatch, UserType } from "./types";

const defaultRule = {
  ruleId: "rule-default-routing",
  ruleVersionId: "rule-default-routing-v1",
  priority: 100,
  name: "Default marketplace route"
};

export type DeterministicRoutingInput = {
  serviceCategory: string;
  intent: RoutingIntent;
  userType: UserType;
  dryRun?: boolean;
};

export type DeterministicRoutingResult = {
  matchedRule: RoutingRuleMatch;
  providerQueue: string[];
  dispatchMode: "single" | "fanout";
  metadata: Record<string, unknown>;
};

const buildQueue = (serviceCategory: string, intent: RoutingIntent, userType: UserType): string[] => {
  const category = serviceCategory.toLowerCase();

  if (intent === "urgent_service") {
    return [`${category}-priority-1`, `${category}-priority-2`, "fallback-rapid-response"];
  }

  if (userType === "enterprise_partner") {
    return ["enterprise-dedicated-queue", `${category}-preferred`, "partner-overflow"];
  }

  if (intent === "quote_only") {
    return [`${category}-quotes`, `${category}-bid-pool`];
  }

  return [`${category}-standard`, "general-marketplace"];
};

export const evaluateDeterministicRules = (input: DeterministicRoutingInput): DeterministicRoutingResult => {
  const providerQueue = buildQueue(input.serviceCategory, input.intent, input.userType);

  const matchedRule: RoutingRuleMatch = {
    ruleId: defaultRule.ruleId,
    ruleVersionId: defaultRule.ruleVersionId,
    name: defaultRule.name,
    priority: defaultRule.priority,
    reason: `intent=${input.intent};userType=${input.userType}`
  };

  const dispatchMode = input.intent === "urgent_service" ? "fanout" : "single";

  return {
    matchedRule,
    providerQueue,
    dispatchMode,
    metadata: {
      deterministic: true,
      dryRun: Boolean(input.dryRun),
      engineVersion: "routing-deterministic-v1"
    }
  };
};
