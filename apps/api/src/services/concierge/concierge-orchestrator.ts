import type {
  ConciergeMessage,
  ConciergeRespondResponse,
  ConciergeResponseType,
  ConciergeSessionContext,
  ConciergeSessionResponse
} from "@kluje/shared";
import { conciergeStore } from "./concierge-store";

type ConciergeResponderInput = {
  sessionId?: string;
  tenantId: string | null;
  message: string;
  context?: ConciergeSessionContext;
};

const categoryRules: Array<{ category: string; keywords: string[]; checklist: string[] }> = [
  {
    category: "plumbing",
    keywords: ["plumb", "pipe", "leak", "drain", "toilet", "water heater"],
    checklist: ["Describe issue location", "Share urgency and timeline", "Add property type"]
  },
  {
    category: "electrical",
    keywords: ["electrical", "breaker", "outlet", "wiring", "lighting", "panel"],
    checklist: ["List affected circuits", "Mention safety hazards", "Add expected service window"]
  },
  {
    category: "hvac",
    keywords: ["hvac", "ac", "air conditioning", "heating", "furnace", "thermostat"],
    checklist: ["Provide system type", "Include current symptoms", "Share last service date (if known)"]
  }
];

const faqRules: Array<{ keywords: string[]; response: string; references: string[] }> = [
  {
    keywords: ["price", "pricing", "cost", "fee"],
    response:
      "Marketplace pricing varies by provider and scope. Add budget guidance and request details to get tighter quotes.",
    references: ["pricing_overview", "quote_expectations"]
  },
  {
    keywords: ["verified", "trust", "background", "quality"],
    response:
      "Providers are ranked by marketplace fit signals and delivery performance. You can request additional verification details during intake.",
    references: ["provider_quality", "verification_process"]
  },
  {
    keywords: ["how long", "timeline", "when can", "start date"],
    response:
      "Timeline depends on provider capacity and urgency. Include preferred start date and urgency so we can prioritize matching.",
    references: ["timeline_guidance", "priority_routing"]
  }
];

const normalize = (value: string) => value.toLowerCase().trim();

const detectCategory = (message: string) => {
  const text = normalize(message);
  let best: { category?: string; score: number; checklist: string[] } = { score: 0, checklist: [] };

  for (const rule of categoryRules) {
    const matches = rule.keywords.filter((keyword) => text.includes(keyword)).length;
    if (matches > best.score) {
      best = {
        category: rule.category,
        score: matches,
        checklist: rule.checklist
      };
    }
  }

  return best;
};

const detectFaq = (message: string) => {
  const text = normalize(message);
  for (const faq of faqRules) {
    if (faq.keywords.some((keyword) => text.includes(keyword))) return faq;
  }
  return null;
};

const inferResponseType = (message: string): ConciergeResponseType => {
  const text = normalize(message);
  if (text.includes("?")) return "faq_response";
  if (text.includes("help") || text.includes("start") || text.includes("intake")) return "intake_guidance";
  return "category_suggestion";
};

const buildGuidanceText = (category: string | undefined, checklist: string[]) => {
  if (category) {
    return `Best-fit category: ${category}. To proceed, please share: ${checklist.join("; ")}.`;
  }
  return "Tell us the service type, location, urgency, and budget range to guide your intake.";
};

const toMessage = (
  sessionId: string,
  role: ConciergeMessage["role"],
  content: string,
  messageType: ConciergeMessage["messageType"],
  metadata: Record<string, unknown>
): ConciergeMessage => ({
  id: crypto.randomUUID(),
  sessionId,
  role,
  content,
  messageType,
  metadata,
  createdAt: new Date().toISOString()
});

export const respondConcierge = async (input: ConciergeResponderInput): Promise<ConciergeRespondResponse> => {
  const session =
    (input.sessionId ? conciergeStore.getSession(input.sessionId) : null) ??
    (await conciergeStore.createSession({
      tenantId: input.tenantId,
      context: input.context ?? { channel: "web" }
    }));

  const responseType = inferResponseType(input.message);
  const category = detectCategory(input.message);
  const faq = detectFaq(input.message);

  const responseText =
    responseType === "faq_response" && faq
      ? faq.response
      : buildGuidanceText(category.category, category.checklist);

  const customerMessage = toMessage(session.id, "customer", input.message, "response", {
    source: "api"
  });

  const conciergeMessage = toMessage(
    session.id,
    "concierge",
    responseText,
    responseType === "faq_response" ? "faq" : category.category ? "category_suggestion" : "guidance",
    {
      responseType,
      category: category.category ?? null,
      confidence: category.score > 0 ? Math.min(0.98, 0.45 + category.score * 0.18) : 0.52
    }
  );

  await conciergeStore.appendMessages(session.id, [customerMessage, conciergeMessage], session.tenantId);

  await conciergeStore.updateSession(session.id, {
    context: {
      ...session.context,
      ...input.context
    },
    guidanceState: {
      lastResponseType: responseType,
      lastCategory: category.category ?? null
    }
  });

  const allMessages = conciergeStore.getMessages(session.id);
  const confidence = category.score > 0 ? Math.min(0.98, 0.45 + category.score * 0.18) : 0.52;

  return {
    sessionId: session.id,
    responseType,
    responseText,
    suggestedCategory: category.category,
    confidence,
    guidanceChecklist:
      category.checklist.length > 0
        ? category.checklist
        : ["Service category", "Location", "Timeline", "Budget range"],
    faqReferences: faq?.references ?? [],
    extensionHooks: {
      mode: "deterministic_v1",
      aiReady: true,
      suggestedPromptTemplate: "concierge_intake_triage_v2"
    },
    messages: allMessages
  };
};

export const fetchConciergeSession = (sessionId: string): ConciergeSessionResponse | null => {
  const session = conciergeStore.getSession(sessionId);
  if (!session) return null;

  const { tenantId: _tenantId, ...sessionData } = session;
  return {
    session: sessionData,
    messages: conciergeStore.getMessages(sessionId)
  };
};
