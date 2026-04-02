import { hasSupabaseAdmin, supabaseAdmin } from "./supabase-admin";

export type VerificationStatus = "pending" | "approved" | "rejected" | "needs_more_info";
export type VerificationDocumentStatus = "submitted" | "accepted" | "rejected";
export type ComplianceSeverity = "info" | "warning" | "critical";
export type VerificationEventType =
  | "verification_started"
  | "document_uploaded"
  | "decision_recorded"
  | "compliance_flag_created";

export interface VerificationRequestRecord {
  id: string;
  tenantId: string;
  providerId: string;
  status: VerificationStatus;
  requestedBy: string;
  reviewedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  decidedAt: string | null;
}

export interface VerificationDocumentRecord {
  id: string;
  requestId: string;
  providerId: string;
  tenantId: string;
  documentType: string;
  storageUrl: string;
  checksum: string | null;
  metadata: Record<string, unknown>;
  status: VerificationDocumentStatus;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ComplianceFlagRecord {
  id: string;
  tenantId: string;
  providerId: string;
  requestId: string | null;
  source: string;
  code: string;
  severity: ComplianceSeverity;
  status: "open" | "resolved";
  details: Record<string, unknown>;
  createdAt: string;
  resolvedAt: string | null;
}

export interface VerificationEventRecord {
  id: string;
  tenantId: string;
  requestId: string | null;
  providerId: string;
  eventType: VerificationEventType;
  actorId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

const verificationRequests = new Map<string, VerificationRequestRecord>();
const documentsByRequest = new Map<string, VerificationDocumentRecord[]>();
const eventsByRequest = new Map<string, VerificationEventRecord[]>();
const complianceFlagsByProvider = new Map<string, ComplianceFlagRecord[]>();

const persistSupabase = async (table: string, payload: Record<string, unknown>) => {
  if (!hasSupabaseAdmin || !supabaseAdmin) return;

  const { error } = await supabaseAdmin.from(table).insert(payload);
  if (error) {
    console.warn(`[verification-store] failed to persist ${table}: ${error.message}`);
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
    console.warn(`[verification-store] failed to update ${table}: ${error.message}`);
  }
};

export const verificationStore = {
  async createVerificationRequest(record: VerificationRequestRecord) {
    verificationRequests.set(record.id, record);

    await persistSupabase("verification_requests", {
      id: record.id,
      tenant_id: record.tenantId,
      provider_id: record.providerId,
      status: record.status,
      requested_by: record.requestedBy,
      reviewed_by: record.reviewedBy,
      notes: record.notes,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
      decided_at: record.decidedAt
    });
  },

  getVerificationRequest(id: string) {
    return verificationRequests.get(id) ?? null;
  },

  getVerificationRequestByProvider(providerId: string) {
    const all = Array.from(verificationRequests.values()).filter((request) => request.providerId === providerId);
    all.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return all[0] ?? null;
  },

  async updateVerificationRequest(id: string, patch: Partial<VerificationRequestRecord>) {
    const existing = verificationRequests.get(id);
    if (!existing) return null;

    const next: VerificationRequestRecord = {
      ...existing,
      ...patch,
      updatedAt: patch.updatedAt ?? new Date().toISOString()
    };
    verificationRequests.set(id, next);

    await updateSupabase(
      "verification_requests",
      {
        status: next.status,
        reviewed_by: next.reviewedBy,
        notes: next.notes,
        decided_at: next.decidedAt,
        updated_at: next.updatedAt
      },
      "id",
      id
    );

    return next;
  },

  async addDocument(record: VerificationDocumentRecord) {
    const current = documentsByRequest.get(record.requestId) ?? [];
    documentsByRequest.set(record.requestId, [...current, record]);

    await persistSupabase("verification_documents", {
      id: record.id,
      request_id: record.requestId,
      provider_id: record.providerId,
      tenant_id: record.tenantId,
      document_type: record.documentType,
      storage_url: record.storageUrl,
      checksum: record.checksum,
      metadata: record.metadata,
      status: record.status,
      uploaded_by: record.uploadedBy,
      uploaded_at: record.uploadedAt
    });
  },

  getDocuments(requestId: string) {
    return documentsByRequest.get(requestId) ?? [];
  },

  async addEvent(event: VerificationEventRecord) {
    if (event.requestId) {
      const current = eventsByRequest.get(event.requestId) ?? [];
      eventsByRequest.set(event.requestId, [...current, event]);
    }

    await persistSupabase("verification_events", {
      id: event.id,
      tenant_id: event.tenantId,
      request_id: event.requestId,
      provider_id: event.providerId,
      event_type: event.eventType,
      actor_id: event.actorId,
      payload: event.payload,
      created_at: event.createdAt
    });
  },

  getEvents(requestId: string) {
    return eventsByRequest.get(requestId) ?? [];
  },

  async addComplianceFlag(flag: ComplianceFlagRecord) {
    const current = complianceFlagsByProvider.get(flag.providerId) ?? [];
    complianceFlagsByProvider.set(flag.providerId, [...current, flag]);

    await persistSupabase("compliance_flags", {
      id: flag.id,
      tenant_id: flag.tenantId,
      provider_id: flag.providerId,
      request_id: flag.requestId,
      source: flag.source,
      code: flag.code,
      severity: flag.severity,
      status: flag.status,
      details: flag.details,
      created_at: flag.createdAt,
      resolved_at: flag.resolvedAt
    });
  },

  getComplianceFlags(providerId: string) {
    return complianceFlagsByProvider.get(providerId) ?? [];
  }
};
