import { Router } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth";
import { verificationStore } from "../services/verification-store";

const router = Router();

const startVerificationSchema = z.object({
  providerId: z.string().uuid(),
  notes: z.string().trim().max(2000).optional()
});

const documentUploadSchema = z.object({
  requestId: z.string().uuid(),
  providerId: z.string().uuid(),
  documentType: z.enum(["business_license", "insurance_certificate", "identity_document", "tax_document", "other"]),
  storageUrl: z.string().url(),
  checksum: z.string().trim().min(8).max(256).optional(),
  metadata: z.record(z.unknown()).default({})
});

const adminDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected", "needs_more_info"]),
  notes: z.string().trim().max(2000).optional(),
  reasonCode: z.string().trim().min(2).max(120).optional()
});

const isAdmin = (req: AuthRequest) => req.user?.role === "admin";

router.post("/verification/start", async (req: AuthRequest, res, next) => {
  try {
    const parsed = startVerificationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const tenantId = req.header("x-tenant-id") ?? "default-tenant";
    const now = new Date().toISOString();
    const requestId = crypto.randomUUID();

    const record = {
      id: requestId,
      tenantId,
      providerId: parsed.data.providerId,
      status: "pending" as const,
      requestedBy: req.user?.sub ?? "system",
      reviewedBy: null,
      notes: parsed.data.notes ?? null,
      createdAt: now,
      updatedAt: now,
      decidedAt: null
    };

    await verificationStore.createVerificationRequest(record);
    await verificationStore.addEvent({
      id: crypto.randomUUID(),
      tenantId,
      requestId,
      providerId: parsed.data.providerId,
      eventType: "verification_started",
      actorId: req.user?.sub ?? "system",
      payload: { notes: parsed.data.notes ?? null },
      createdAt: now
    });

    return res.status(201).json({
      requestId,
      providerId: record.providerId,
      status: record.status,
      createdAt: record.createdAt
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/verification/documents", async (req: AuthRequest, res, next) => {
  try {
    const parsed = documentUploadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const request = verificationStore.getVerificationRequest(parsed.data.requestId);
    if (!request) return res.status(404).json({ error: "Verification request not found" });
    if (request.providerId !== parsed.data.providerId) {
      return res.status(400).json({ error: "Provider ID does not match verification request" });
    }

    const now = new Date().toISOString();
    const documentId = crypto.randomUUID();

    await verificationStore.addDocument({
      id: documentId,
      requestId: parsed.data.requestId,
      providerId: parsed.data.providerId,
      tenantId: request.tenantId,
      documentType: parsed.data.documentType,
      storageUrl: parsed.data.storageUrl,
      checksum: parsed.data.checksum ?? null,
      metadata: parsed.data.metadata,
      status: "submitted",
      uploadedBy: req.user?.sub ?? "system",
      uploadedAt: now
    });

    await verificationStore.addEvent({
      id: crypto.randomUUID(),
      tenantId: request.tenantId,
      requestId: request.id,
      providerId: request.providerId,
      eventType: "document_uploaded",
      actorId: req.user?.sub ?? "system",
      payload: {
        documentId,
        documentType: parsed.data.documentType,
        metadata: parsed.data.metadata
      },
      createdAt: now
    });

    return res.status(201).json({
      documentId,
      requestId: parsed.data.requestId,
      providerId: parsed.data.providerId,
      status: "submitted",
      uploadedAt: now
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/verification/:providerId/status", (req, res) => {
  const providerId = z.string().uuid().safeParse(req.params.providerId);
  if (!providerId.success) return res.status(400).json({ error: "providerId must be a UUID" });

  const request = verificationStore.getVerificationRequestByProvider(providerId.data);
  if (!request) {
    return res.status(404).json({ error: "No verification request found for provider" });
  }

  return res.status(200).json({
    requestId: request.id,
    providerId: request.providerId,
    status: request.status,
    notes: request.notes,
    decidedAt: request.decidedAt,
    documents: verificationStore.getDocuments(request.id),
    complianceFlags: verificationStore.getComplianceFlags(request.providerId),
    events: verificationStore.getEvents(request.id),
    createdAt: request.createdAt,
    updatedAt: request.updatedAt
  });
});

router.post("/admin/verification/:requestId/decision", async (req: AuthRequest, res, next) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Admin role required" });

    const requestId = z.string().uuid().safeParse(req.params.requestId);
    if (!requestId.success) return res.status(400).json({ error: "requestId must be a UUID" });

    const parsed = adminDecisionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const existing = verificationStore.getVerificationRequest(requestId.data);
    if (!existing) return res.status(404).json({ error: "Verification request not found" });

    const now = new Date().toISOString();
    const updated = await verificationStore.updateVerificationRequest(existing.id, {
      status: parsed.data.decision,
      reviewedBy: req.user?.sub ?? "system",
      notes: parsed.data.notes ?? existing.notes,
      decidedAt: now,
      updatedAt: now
    });

    await verificationStore.addEvent({
      id: crypto.randomUUID(),
      tenantId: existing.tenantId,
      requestId: existing.id,
      providerId: existing.providerId,
      eventType: "decision_recorded",
      actorId: req.user?.sub ?? "system",
      payload: {
        decision: parsed.data.decision,
        notes: parsed.data.notes ?? null,
        reasonCode: parsed.data.reasonCode ?? null
      },
      createdAt: now
    });

    if (parsed.data.decision !== "approved") {
      await verificationStore.addComplianceFlag({
        id: crypto.randomUUID(),
        tenantId: existing.tenantId,
        providerId: existing.providerId,
        requestId: existing.id,
        source: "verification_review",
        code: parsed.data.reasonCode ?? "manual_review_failed",
        severity: parsed.data.decision === "rejected" ? "critical" : "warning",
        status: "open",
        details: {
          decision: parsed.data.decision,
          notes: parsed.data.notes ?? null
        },
        createdAt: now,
        resolvedAt: null
      });

      await verificationStore.addEvent({
        id: crypto.randomUUID(),
        tenantId: existing.tenantId,
        requestId: existing.id,
        providerId: existing.providerId,
        eventType: "compliance_flag_created",
        actorId: req.user?.sub ?? "system",
        payload: {
          source: "verification_review",
          reasonCode: parsed.data.reasonCode ?? "manual_review_failed",
          severity: parsed.data.decision === "rejected" ? "critical" : "warning"
        },
        createdAt: now
      });
    }

    return res.status(200).json({
      requestId: existing.id,
      providerId: existing.providerId,
      status: updated?.status ?? parsed.data.decision,
      decidedAt: now
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
