import type { MarketplaceAgentWorkflowTemplate } from "@kluje/shared";

export const MARKETPLACE_AGENT_WORKFLOW_TEMPLATES: MarketplaceAgentWorkflowTemplate[] = [
  {
    templateId: "wf_marketplace_new_intake_v1",
    agentCode: "A0_ROUTER_ORCHESTRATOR",
    name: "New customer intake to quote dispatch",
    description: "Routes new customer demand from concierge to job scope and dispatches quotes.",
    triggerEvent: "marketplace.customer.requested",
    nextAgentCodes: ["A1_CUSTOMER_CONCIERGE", "A2_JOB_INTAKE_SCOPING", "A3_MATCHING_QUOTE_DISPATCH"],
    deterministicRules: [
      "If contact and service category are missing then route to A1.",
      "If budget or timeline is missing then route to A2.",
      "If minimum scoping fields are present then route to A3."
    ]
  },
  {
    templateId: "wf_marketplace_quote_compare_v1",
    agentCode: "A4_QUOTE_COMPARISON_ADVISOR",
    name: "Quote comparison guidance",
    description: "Normalizes quotes and produces deterministic recommendation tiers.",
    triggerEvent: "marketplace.quote.batch.received",
    nextAgentCodes: ["A5_SCHEDULING_MESSAGING_COORDINATOR", "A7_TRUST_VERIFICATION_COMPLIANCE"],
    deterministicRules: [
      "Sort by completeness, coverage fit, and total cost.",
      "Escalate trust checks when provider verification is stale.",
      "Create scheduling request only when customer selects a finalist."
    ]
  },
  {
    templateId: "wf_marketplace_support_triage_v1",
    agentCode: "A8_SUPPORT_DISPUTE_TRIAGE",
    name: "Support and dispute triage",
    description: "Routes post-booking support signals and disputes to policy queues.",
    triggerEvent: "marketplace.support.ticket.created",
    nextAgentCodes: ["A6_ASK_EXPERT_MODERATOR", "A7_TRUST_VERIFICATION_COMPLIANCE"],
    deterministicRules: [
      "Safety, fraud, or payment disputes route to A7 immediately.",
      "Policy or workmanship interpretation questions route to A6.",
      "All other requests stay in A8 SLA queue."
    ]
  }
];
