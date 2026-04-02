export const issueClassifications = [
  "account_access",
  "billing_payment",
  "service_quality",
  "provider_conduct",
  "technical_issue",
  "safety_incident",
  "other",
] as const;

export type IssueClassification = (typeof issueClassifications)[number];

export const escalationStates = [
  "none",
  "pending_review",
  "escalated_internal",
  "escalated_external",
  "resolved",
] as const;

export type EscalationState = (typeof escalationStates)[number];

export type SupportPriority = "low" | "medium" | "high" | "critical";

export type SupportTicketStatus = "open" | "triaged" | "waiting_on_customer" | "resolved" | "closed";

export interface SupportTicketCreateRequest {
  tenantId: string;
  requesterUserId?: string;
  requesterEmail: string;
  subject: string;
  description: string;
  classification: IssueClassification;
  priority?: SupportPriority;
  relatedLeadId?: string;
  metadata?: Record<string, unknown>;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  requesterUserId?: string;
  requesterEmail: string;
  subject: string;
  description: string;
  classification: IssueClassification;
  priority: SupportPriority;
  status: SupportTicketStatus;
  escalationState: EscalationState;
  relatedLeadId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeCreateRequest {
  tenantId: string;
  ticketId?: string;
  initiatedByUserId?: string;
  issueClassification: IssueClassification;
  reason: string;
  amountCents?: number;
  currency?: string;
  escalationState?: EscalationState;
  metadata?: Record<string, unknown>;
}

export type DisputeStatus = "submitted" | "under_review" | "needs_evidence" | "resolved" | "closed";

export interface DisputeRecord {
  id: string;
  tenantId: string;
  ticketId?: string;
  initiatedByUserId?: string;
  issueClassification: IssueClassification;
  reason: string;
  amountCents?: number;
  currency?: string;
  status: DisputeStatus;
  escalationState: EscalationState;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  escalatedAt?: string;
}

export interface DisputeEvidenceCreateRequest {
  evidenceType: "document" | "image" | "video" | "chat_transcript" | "other";
  uri: string;
  note?: string;
  submittedByUserId?: string;
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  evidenceType: DisputeEvidenceCreateRequest["evidenceType"];
  uri: string;
  note?: string;
  submittedByUserId?: string;
  createdAt: string;
}
