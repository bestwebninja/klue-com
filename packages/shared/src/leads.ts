export type IntakeStatus = "pending" | "in_review" | "needs_info" | "ready_for_routing";

export type LeadTimeline = "urgent" | "this_week" | "this_month" | "flexible";

export type ScopeUrgency = "asap" | "planned" | "researching";

export interface LeadAttachment {
  name: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface ScopeDetails {
  summary: string;
  urgency?: ScopeUrgency;
  deliverables?: string[];
  preferredStartDate?: string;
  accessibilityNeeds?: string[];
}

export interface LeadIntakeRequest {
  source: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  location: string;
  serviceCategory: string;
  intentScore: number;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: LeadTimeline;
  requirements?: string[];
  scope?: ScopeDetails;
  attachments?: LeadAttachment[];
}

export interface LeadIntakeMissingInformation {
  code: string;
  message: string;
  severity: "low" | "medium" | "high";
}

export interface LeadIntakeResponse {
  id: string;
  source: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  location: string;
  serviceCategory: string;
  intentScore: number;
  status: "new" | "routed" | "accepted" | "rejected";
  intakeStatus: IntakeStatus;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: LeadTimeline;
  requirements: string[];
  scope?: ScopeDetails;
  attachments: LeadAttachment[];
  normalizedCategory: string;
  normalizedLocation: string;
  intakeScore: number;
  missingInformation: LeadIntakeMissingInformation[];
  enrichmentNotes: string[];
  createdAt: string;
  updatedAt: string;
  routedAt?: string;
  assignedAgentId?: string;
  assignmentQueue: string[];
}
