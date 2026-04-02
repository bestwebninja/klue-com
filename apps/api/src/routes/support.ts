import { Router } from "express";
import { z } from "zod";
import { escalationStates, issueClassifications } from "@kluje/shared";
import { supportService } from "../services/support/support-service";

const router = Router();

const ticketCreateSchema = z.object({
  tenantId: z.string().uuid(),
  requesterUserId: z.string().uuid().optional(),
  requesterEmail: z.string().email(),
  subject: z.string().trim().min(1),
  description: z.string().trim().min(1),
  classification: z.enum(issueClassifications),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  relatedLeadId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const disputeCreateSchema = z.object({
  tenantId: z.string().uuid(),
  ticketId: z.string().uuid().optional(),
  initiatedByUserId: z.string().uuid().optional(),
  issueClassification: z.enum(issueClassifications),
  reason: z.string().trim().min(1),
  amountCents: z.number().int().nonnegative().optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  escalationState: z.enum(escalationStates).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const evidenceCreateSchema = z.object({
  evidenceType: z.enum(["document", "image", "video", "chat_transcript", "other"]),
  uri: z.string().url(),
  note: z.string().trim().min(1).optional(),
  submittedByUserId: z.string().uuid().optional(),
});

router.post("/tickets", (req, res) => {
  const parsed = ticketCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ticket = supportService.createTicket(parsed.data);
  return res.status(201).json({ data: ticket });
});

router.get("/tickets/:ticketId", (req, res) => {
  const ticketId = z.string().uuid().safeParse(req.params.ticketId);
  if (!ticketId.success) return res.status(400).json({ error: "Invalid ticket id" });

  const ticket = supportService.getTicket(ticketId.data);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  return res.status(200).json({ data: ticket });
});

router.post("/disputes", (req, res) => {
  const parsed = disputeCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const dispute = supportService.createDispute(parsed.data);
  return res.status(201).json({ data: dispute });
});

router.post("/disputes/:disputeId/evidence", (req, res) => {
  const disputeId = z.string().uuid().safeParse(req.params.disputeId);
  if (!disputeId.success) return res.status(400).json({ error: "Invalid dispute id" });

  const parsed = evidenceCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const evidence = supportService.addDisputeEvidence(disputeId.data, parsed.data);
  if (!evidence) return res.status(404).json({ error: "Dispute not found" });

  return res.status(201).json({ data: evidence });
});

router.post("/disputes/:disputeId/escalate", (req, res) => {
  const disputeId = z.string().uuid().safeParse(req.params.disputeId);
  if (!disputeId.success) return res.status(400).json({ error: "Invalid dispute id" });

  const dispute = supportService.escalateDispute(disputeId.data);
  if (!dispute) return res.status(404).json({ error: "Dispute not found" });

  return res.status(200).json({ data: dispute });
});

export default router;
