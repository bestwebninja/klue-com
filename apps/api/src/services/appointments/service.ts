import { hasSupabaseAdmin, supabaseAdmin } from "../supabase-admin";
import { messagingStore, type ReminderRecord } from "../messaging/store";

export type AppointmentRecord = {
  id: string;
  tenantId: string;
  threadId?: string;
  leadId?: string;
  providerId?: string;
  customerUserId?: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  timezone: string;
  location?: string;
  notes?: string;
  status: "scheduled" | "rescheduled" | "cancelled" | "completed";
  cancellationReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

const appointments = new Map<string, AppointmentRecord>();

const persistSupabase = async (table: string, payload: Record<string, unknown>) => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return;

  const { error } = await supabaseAdmin.from(table).insert(payload);
  if (error) {
    console.warn(`[appointments-service] failed to persist ${table}: ${error.message}`);
  }
};

const updateSupabase = async (
  table: string,
  values: Record<string, unknown>,
  whereColumn: string,
  whereValue: string
) => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return;

  const { error } = await supabaseAdmin.from(table).update(values).eq(whereColumn, whereValue);
  if (error) {
    console.warn(`[appointments-service] failed to update ${table}: ${error.message}`);
  }
};

const buildAppointmentReminder = (input: {
  tenantId: string;
  appointmentId: string;
  recipientUserId?: string;
  scheduledStartAt: string;
  timezone: string;
}): ReminderRecord => {
  const startMs = new Date(input.scheduledStartAt).getTime();
  const reminderMs = Math.max(Date.now(), startMs - 1000 * 60 * 60 * 24);
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    tenantId: input.tenantId,
    appointmentId: input.appointmentId,
    reminderType: "appointment",
    channel: "sms",
    recipientUserId: input.recipientUserId,
    scheduledFor: new Date(reminderMs).toISOString(),
    status: "queued",
    payload: {
      type: "appointment_24h",
      appointmentId: input.appointmentId,
      timezone: input.timezone,
    },
    createdAt: now,
    updatedAt: now,
  };
};

export const appointmentsService = {
  async create(input: Omit<AppointmentRecord, "id" | "status" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const appointment: AppointmentRecord = {
      ...input,
      id: crypto.randomUUID(),
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    };

    appointments.set(appointment.id, appointment);

    await persistSupabase("appointments", {
      id: appointment.id,
      tenant_id: appointment.tenantId,
      thread_id: appointment.threadId,
      lead_id: appointment.leadId,
      provider_id: appointment.providerId,
      customer_user_id: appointment.customerUserId,
      scheduled_start_at: appointment.scheduledStartAt,
      scheduled_end_at: appointment.scheduledEndAt,
      timezone: appointment.timezone,
      location: appointment.location,
      notes: appointment.notes,
      status: appointment.status,
      created_by: appointment.createdBy,
      created_at: appointment.createdAt,
      updated_at: appointment.updatedAt,
    });

    const reminder = buildAppointmentReminder({
      tenantId: appointment.tenantId,
      appointmentId: appointment.id,
      recipientUserId: appointment.customerUserId,
      scheduledStartAt: appointment.scheduledStartAt,
      timezone: appointment.timezone,
    });

    await messagingStore.saveReminder(reminder);
    await messagingStore.appendAuditEvent({
      tenantId: appointment.tenantId,
      eventType: "appointments.created",
      payload: {
        appointmentId: appointment.id,
        threadId: appointment.threadId,
        scheduledStartAt: appointment.scheduledStartAt,
      },
    });

    return appointment;
  },

  get(appointmentId: string, tenantId: string) {
    const appointment = appointments.get(appointmentId);
    if (!appointment || appointment.tenantId !== tenantId) return null;
    return appointment;
  },

  async patch(
    appointmentId: string,
    tenantId: string,
    patch: Pick<
      Partial<AppointmentRecord>,
      "scheduledStartAt" | "scheduledEndAt" | "timezone" | "location" | "notes" | "cancellationReason"
    > & { action: "reschedule" | "cancel" }
  ) {
    const existing = appointments.get(appointmentId);
    if (!existing || existing.tenantId !== tenantId) return null;

    const status = patch.action === "cancel" ? "cancelled" : "rescheduled";
    const next: AppointmentRecord = {
      ...existing,
      ...patch,
      status,
      updatedAt: new Date().toISOString(),
    };

    appointments.set(appointmentId, next);

    await updateSupabase(
      "appointments",
      {
        scheduled_start_at: next.scheduledStartAt,
        scheduled_end_at: next.scheduledEndAt,
        timezone: next.timezone,
        location: next.location,
        notes: next.notes,
        status: next.status,
        cancellation_reason: next.cancellationReason,
        updated_at: next.updatedAt,
      },
      "id",
      appointmentId
    );

    await messagingStore.appendAuditEvent({
      tenantId,
      eventType: patch.action === "cancel" ? "appointments.cancelled" : "appointments.rescheduled",
      payload: {
        appointmentId,
        scheduledStartAt: next.scheduledStartAt,
        scheduledEndAt: next.scheduledEndAt,
      },
    });

    return next;
  },
};
