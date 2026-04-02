export type ConciergeRole = "customer" | "concierge" | "system";

export type ConciergeResponseType = "category_suggestion" | "intake_guidance" | "faq_response";

export interface ConciergeSessionContext {
  marketplace?: string;
  locale?: string;
  channel?: "web" | "mobile" | "partner_api" | "unknown";
  metadata?: Record<string, unknown>;
}

export interface ConciergeMessage {
  id: string;
  sessionId: string;
  role: ConciergeRole;
  messageType: "response" | "guidance" | "faq" | "category_suggestion" | "system";
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ConciergeRespondRequest {
  sessionId?: string;
  message: string;
  context?: ConciergeSessionContext;
}

export interface ConciergeRespondResponse {
  sessionId: string;
  responseType: ConciergeResponseType;
  responseText: string;
  suggestedCategory?: string;
  confidence: number;
  guidanceChecklist: string[];
  faqReferences: string[];
  extensionHooks: {
    mode: "deterministic_v1";
    aiReady: boolean;
    suggestedPromptTemplate: string;
  };
  messages: ConciergeMessage[];
}

export interface ConciergeSession {
  id: string;
  status: "active" | "closed";
  context: ConciergeSessionContext;
  guidanceState: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ConciergeSessionResponse {
  session: ConciergeSession;
  messages: ConciergeMessage[];
}
