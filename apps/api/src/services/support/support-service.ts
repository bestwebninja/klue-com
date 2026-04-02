import type {
  DisputeCreateRequest,
  DisputeEvidence,
  DisputeEvidenceCreateRequest,
  DisputeRecord,
  SupportTicket,
  SupportTicketCreateRequest,
} from "@kluje/shared";
import { buildTriageDecision, classifyIssue } from "./triage";
import type { SupportService, SupportTicketEvent } from "./types";

const tickets = new Map<string, SupportTicket>();
const ticketEvents = new Map<string, SupportTicketEvent[]>();
const disputes = new Map<string, DisputeRecord>();
const disputeEvidence = new Map<string, DisputeEvidence[]>();

const nowIso = () => new Date().toISOString();

const appendTicketEvent = (ticketId: string, event: Omit<SupportTicketEvent, "id" | "createdAt">) => {
  const eventRecord: SupportTicketEvent = {
    id: crypto.randomUUID(),
    createdAt: nowIso(),
    ...event,
  };
  const current = ticketEvents.get(ticketId) ?? [];
  current.push(eventRecord);
  ticketEvents.set(ticketId, current);
};

export const supportService: SupportService = {
  createTicket(input: SupportTicketCreateRequest): SupportTicket {
    const createdAt = nowIso();
    const classification = classifyIssue(input.classification);
    const triage = buildTriageDecision(classification);

    const ticket: SupportTicket = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      requesterUserId: input.requesterUserId,
      requesterEmail: input.requesterEmail,
      subject: input.subject,
      description: input.description,
      classification: triage.classification,
      priority: input.priority ?? "medium",
      status: "open",
      escalationState: triage.escalationState,
      relatedLeadId: input.relatedLeadId,
      metadata: { ...(input.metadata ?? {}), triageQueue: triage.queue },
      createdAt,
      updatedAt: createdAt,
    };

    tickets.set(ticket.id, ticket);

    appendTicketEvent(ticket.id, {
      ticketId: ticket.id,
      eventType: "created",
      actorUserId: ticket.requesterUserId,
      payload: {
        requesterEmail: ticket.requesterEmail,
        priority: ticket.priority,
      },
    });

    appendTicketEvent(ticket.id, {
      ticketId: ticket.id,
      eventType: "classified",
      actorUserId: ticket.requesterUserId,
      payload: {
        classification: triage.classification,
        escalationState: triage.escalationState,
        triageQueue: triage.queue,
      },
    });

    return ticket;
  },

  getTicket(ticketId: string) {
    const ticket = tickets.get(ticketId);
    if (!ticket) return null;

    return {
      ticket,
      events: ticketEvents.get(ticketId) ?? [],
    };
  },

  createDispute(input: DisputeCreateRequest): DisputeRecord {
    const createdAt = nowIso();
    const dispute: DisputeRecord = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      ticketId: input.ticketId,
      initiatedByUserId: input.initiatedByUserId,
      issueClassification: classifyIssue(input.issueClassification),
      reason: input.reason,
      amountCents: input.amountCents,
      currency: input.currency,
      status: "submitted",
      escalationState: input.escalationState ?? "pending_review",
      metadata: input.metadata ?? {},
      createdAt,
      updatedAt: createdAt,
    };

    disputes.set(dispute.id, dispute);

    if (dispute.ticketId && tickets.has(dispute.ticketId)) {
      appendTicketEvent(dispute.ticketId, {
        ticketId: dispute.ticketId,
        eventType: "dispute_linked",
        actorUserId: dispute.initiatedByUserId,
        payload: {
          disputeId: dispute.id,
          reason: dispute.reason,
          escalationState: dispute.escalationState,
        },
      });
    }

    return dispute;
  },

  addDisputeEvidence(disputeId: string, input: DisputeEvidenceCreateRequest) {
    if (!disputes.has(disputeId)) return null;

    const evidence: DisputeEvidence = {
      id: crypto.randomUUID(),
      disputeId,
      evidenceType: input.evidenceType,
      uri: input.uri,
      note: input.note,
      submittedByUserId: input.submittedByUserId,
      createdAt: nowIso(),
    };

    const current = disputeEvidence.get(disputeId) ?? [];
    current.push(evidence);
    disputeEvidence.set(disputeId, current);

    return evidence;
  },

  escalateDispute(disputeId: string) {
    const dispute = disputes.get(disputeId);
    if (!dispute) return null;

    const updated: DisputeRecord = {
      ...dispute,
      escalationState: "escalated_internal",
      status: "under_review",
      escalatedAt: nowIso(),
      updatedAt: nowIso(),
    };

    disputes.set(disputeId, updated);
    return updated;
  },
};
