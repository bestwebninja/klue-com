import { Router } from "express";
import { z } from "zod";

const router = Router();

const createAppointmentSchema = z.object({
  threadId: z.string().uuid().optional(),
  providerId: z.string().uuid(),
  leadId: z.string().uuid().optional(),
  scheduledFor: z.string().datetime(),
  timezone: z.string().trim().min(1),
  notes: z.string().trim().max(2000).optional()
});

const patchAppointmentSchema = z.object({
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]).optional(),
  scheduledFor: z.string().datetime().optional(),
  timezone: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(2000).optional()
});

type Appointment = z.infer<typeof createAppointmentSchema> & {
  id: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

const appointments = new Map<string, Appointment>();

router.post("/", (req, res) => {
  const parsed = createAppointmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const now = new Date().toISOString();
  const appointment: Appointment = {
    id: crypto.randomUUID(),
    status: "scheduled",
    createdAt: now,
    updatedAt: now,
    ...parsed.data
  };
  appointments.set(appointment.id, appointment);

  return res.status(201).json({ data: appointment });
});

router.get("/:appointmentId", (req, res) => {
  const parsedId = z.string().uuid().safeParse(req.params.appointmentId);
  if (!parsedId.success) return res.status(400).json({ error: "Invalid appointmentId" });

  const appointment = appointments.get(parsedId.data);
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });

  return res.status(200).json({ data: appointment });
});

router.patch("/:appointmentId", (req, res) => {
  const parsedId = z.string().uuid().safeParse(req.params.appointmentId);
  if (!parsedId.success) return res.status(400).json({ error: "Invalid appointmentId" });

  const existing = appointments.get(parsedId.data);
  if (!existing) return res.status(404).json({ error: "Appointment not found" });

  const parsed = patchAppointmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const next: Appointment = {
    ...existing,
    ...parsed.data,
    updatedAt: new Date().toISOString()
  };
  appointments.set(parsedId.data, next);

  return res.status(200).json({ data: next });
});

export default router;
