import { issueClassifications, type IssueClassification } from "@kluje/shared";
import type { TicketTriageDecision } from "./types";

const billingIssueSet = new Set<IssueClassification>(["billing_payment"]);
const trustSafetyIssueSet = new Set<IssueClassification>(["provider_conduct", "safety_incident"]);

export const classifyIssue = (value: string): IssueClassification => {
  const candidate = value.trim().toLowerCase() as IssueClassification;
  return issueClassifications.includes(candidate) ? candidate : "other";
};

export const buildTriageDecision = (classification: IssueClassification): TicketTriageDecision => {
  if (trustSafetyIssueSet.has(classification)) {
    return {
      classification,
      escalationState: "pending_review",
      queue: "trust-and-safety",
    };
  }

  if (billingIssueSet.has(classification)) {
    return {
      classification,
      escalationState: "pending_review",
      queue: "support-billing",
    };
  }

  if (classification === "technical_issue") {
    return {
      classification,
      escalationState: "none",
      queue: "support-ops",
    };
  }

  return {
    classification,
    escalationState: "none",
    queue: "support-general",
  };
};
