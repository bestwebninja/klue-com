import type {
  DisputeCreateRequest,
  DisputeEvidence,
  DisputeEvidenceCreateRequest,
  DisputeRecord,
  EscalationState,
  IssueClassification,
  SupportTicket,
  SupportTicketCreateRequest,
} from "@kluje/shared";

export type SupportTicketEventType = "created" | "classified" | "status_changed" | "dispute_linked" | "note_added";

export type SupportTicketEvent = {
  id: string;
  ticketId: string;
  eventType: SupportTicketEventType;
  actorUserId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type TicketTriageDecision = {
  classification: IssueClassification;
  escalationState: EscalationState;
  queue: "support-general" | "support-billing" | "trust-and-safety" | "support-ops";
};

export type SupportService = {
  createTicket(input: SupportTicketCreateRequest): SupportTicket;
  getTicket(ticketId: string): { ticket: SupportTicket; events: SupportTicketEvent[] } | null;
  createDispute(input: DisputeCreateRequest): DisputeRecord;
  addDisputeEvidence(disputeId: string, input: DisputeEvidenceCreateRequest): DisputeEvidence | null;
  escalateDispute(disputeId: string): DisputeRecord | null;
};
