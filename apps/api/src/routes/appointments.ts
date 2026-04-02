import { Router } from "express";
import { z } from "zod";
import type { TenantRequest } from "../middleware/tenant";
import type { AuthRequest } from "../middleware/auth";
import { appointmentsService } from "../services/appointments/service";

const router = Router();

const createAppointmentSchema = z.object({
  threadId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  customerUserId: z.string().uuid().optional(),
  scheduledStartAt: z.string().datetime(),
  scheduledEndAt: z.string().datetime(),
  timezone: z.string().min(2).max(120),
  location: z.string().max(500).optional(),
  notes: z.string().max(3000).optional(),
});

const patchAppointmentSchema = z
  .object({
    action: z.enum(["reschedule", "cancel"]),
    scheduledStartAt: z.string().datetime().optional(),
    scheduledEndAt: z.string().datetime().optional(),
    timezone: z.string().min(2).max(120).optional(),
    location: z.string().max(500).optional(),
    notes: z.string().max(3000).optional(),
    cancellationReason: z.string().max(1000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action === "reschedule" && (!value.scheduledStartAt || !value.scheduledEndAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reschedule requires both scheduledStartAt and scheduledEndAt",
      });
    }

    if (value.action === "cancel" && !value.cancellationReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cancel requires cancellationReason",
      });
    }
  });

router.post("/", async (req: TenantRequest & AuthRequest, res) => {
  if (!req.user?.sub) return res.status(401).json({ error: "Unauthorized" });
  if (!req.tenantId) return res.status(400).json({ error: "Missing tenant context" });

  const parsed = createAppointmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (new Date(parsed.data.scheduledEndAt) <= new Date(parsed.data.scheduledStartAt)) {
    return res.status(400).json({ error: "scheduledEndAt must be after scheduledStartAt" });
  }

  const appointment = await appointmentsService.create({
    tenantId: req.tenantId,
    threadId: parsed.data.threadId,
    leadId: parsed.data.leadId,
    providerId: parsed.data.providerId,
    customerUserId: parsed.data.customerUserId,
    scheduledStartAt: parsed.data.scheduledStartAt,
    scheduledEndAt: parsed.data.scheduledEndAt,
    timezone: parsed.data.timezone,
    location: parsed.data.location,
    notes: parsed.data.notes,
    createdBy: req.user.sub,
  });

  return res.status(201).json({ data: appointment });
});

router.patch("/:appointmentId", async (req: TenantRequest, res) => {
  if (!req.tenantId) return res.status(400).json({ error: "Missing tenant context" });

  const appointmentId = z.string().uuid().safeParse(req.params.appointmentId);
  if (!appointmentId.success) return res.status(400).json({ error: "Invalid appointment id" });

  const parsed = patchAppointmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const appointment = await appointmentsService.patch(appointmentId.data, req.tenantId, parsed.data);
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });

  return res.status(200).json({ data: appointment });
});

export default router;
