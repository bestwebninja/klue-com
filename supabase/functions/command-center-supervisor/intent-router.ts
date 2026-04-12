/**
 * Intent Router — Neural Command OS
 *
 * Takes a natural language query and produces a structured routing plan:
 * which agents to invoke, in what order, and why.
 *
 * Uses a fast, structured OpenAI call (JSON mode) for low-latency classification.
 * The routing plan drives the orchestrator.
 */

export const ROUTER_MODEL = "gpt-4.1-mini";

// ---------------------------------------------------------------------------
// Intent taxonomy
// ---------------------------------------------------------------------------

/** High-level intent labels that map to agent groups */
export type IntentLabel =
  | "renovation_workflow"   // Full project scope: storm + code + docs + leak
  | "zoning_entitlement"   // Permits, compliance, approval paths
  | "lending_capital"      // Draw review, escrow, cash-flow
  | "bid_estimating"       // Job cost estimation and bid strategy
  | "market_intelligence"  // Local market analysis and opportunity scoring
  | "proposal_generation"  // Client-facing project proposal generation
  | "risk_scan"            // General risk check across active jobs
  | "document_audit"       // Document extraction and packet assembly
  | "rebate_discovery"     // Incentive and rebate programs
  | "single_agent"         // Direct routing to one named agent
  | "full_audit";          // Run all agents

// ---------------------------------------------------------------------------
// Routing plan types
// ---------------------------------------------------------------------------

export interface RoutingStage {
  stage: number;
  agentKeys: string[];
  mode: "parallel" | "sequential";
  rationale: string;
  /** Optional condition string for deferred stages (evaluated post-execution) */
  condition?: string;
}

export interface NudgeRule {
  trigger: string;
  suggestedAction: string;
  targetAgentKey?: string;
}

export interface RoutingPlan {
  intent: IntentLabel;
  intentSummary: string;
  stages: RoutingStage[];
  nudges: NudgeRule[];
  /** Keys of all agents that will be invoked across all stages */
  allAgentKeys: string[];
}

// ---------------------------------------------------------------------------
// Intent → agent group mapping (static baseline)
// ---------------------------------------------------------------------------

const INTENT_AGENT_MAP: Record<IntentLabel, { stages: Omit<RoutingStage, "stage">[]; nudges: NudgeRule[] }> = {
  renovation_workflow: {
    stages: [
      {
        agentKeys: ["renovation_ai"],
        mode: "parallel",
        rationale: "Route to Renovation & Construction Workflow AI for end-to-end project orchestration: timeline, cash-flow simulation, and risk assessment.",
      },
    ],
    nudges: [
      {
        trigger: "renovation_ai.lendingNudge === true",
        suggestedAction: "Cash-flow gap detected — ask Kluje to 'find financing options' to route to Lending Capital AI.",
        targetAgentKey: "lending_ai",
      },
      {
        trigger: "renovation_ai.cashFlow.cashFlowGapSeverity === 'high'",
        suggestedAction: "Large cash-flow gap identified. Consider bridging with a construction draw line or HELOC.",
      },
    ],
  },

  zoning_entitlement: {
    stages: [
      {
        agentKeys: ["zoning_ai"],
        mode: "parallel",
        rationale: "Route to Zoning & Entitlement AI for permit approval scoring, compliance checklist, and entitlement path.",
      },
    ],
    nudges: [
      {
        trigger: "zoning_ai.approvalProbabilityPercent < 55",
        suggestedAction: "Low approval probability — schedule a pre-application meeting with the jurisdiction before submitting.",
      },
      {
        trigger: "zoning_ai.complianceChecklist.some(c => c.status === 'fail')",
        suggestedAction: "Compliance gaps found — resolve critical checklist items before filing.",
      },
    ],
  },

  lending_capital: {
    stages: [
      {
        agentKeys: ["lending_ai"],
        mode: "parallel",
        rationale: "Route to Lending & Capital AI for real-time underwriting, lender matching, and financing readiness scoring.",
      },
    ],
    nudges: [
      {
        trigger: "lending_ai.financingReadiness.band === 'not_ready'",
        suggestedAction: "Financing readiness is low — address documentation and quote gaps before approaching lenders.",
      },
      {
        trigger: "lending_ai.financingReadiness.band === 'near_ready'",
        suggestedAction: "Nearly financing-ready — close the remaining gaps and you can approach lenders within 2 weeks.",
      },
    ],
  },

  bid_estimating: {
    stages: [
      {
        agentKeys: ["bid_estimator"],
        mode: "parallel",
        rationale: "Route to Bid & Estimating AI for line-item cost analysis, margin modeling, and competitive bid positioning.",
      },
    ],
    nudges: [
      {
        trigger: "bid_estimator.competitiveness.winProbabilityPercent < 50",
        suggestedAction: "Win probability below 50% — review pricing strategy and consider adjusting the bid amount.",
      },
      {
        trigger: "bid_estimator.marginAnalysis.recommendedMarginPercent < 18",
        suggestedAction: "Margin is thin — ensure your overhead and profit are fully accounted for in this estimate.",
      },
    ],
  },

  proposal_generation: {
    stages: [
      {
        agentKeys: ["proposal_ai"],
        mode: "parallel",
        rationale: "Route to Client Proposal AI to generate a professional, client-ready project proposal with scope, payment schedule, and warranty.",
      },
    ],
    nudges: [
      {
        trigger: "proposal_ai.proposal.totalAmountUsd > 50000",
        suggestedAction: "Large project — consider routing to Lending Capital AI so your client has financing options ready.",
        targetAgentKey: "lending_ai",
      },
    ],
  },

  market_intelligence: {
    stages: [
      {
        agentKeys: ["market_intel"],
        mode: "parallel",
        rationale: "Route to Market Intelligence AI for local opportunity analysis, competitor density, and seasonal demand patterns.",
      },
    ],
    nudges: [
      {
        trigger: "market_intel.opportunityScore > 75",
        suggestedAction: "High-opportunity market detected — consider increasing capacity or marketing spend to capture share.",
      },
      {
        trigger: "market_intel.competitorDensity === 'low'",
        suggestedAction: "Low competitor density found — you have a significant first-mover advantage in this market.",
      },
    ],
  },

  risk_scan: {
    stages: [
      {
        agentKeys: ["storm_scout", "leak_hunter", "code_guardian"],
        mode: "parallel",
        rationale: "Broad parallel risk scan across weather, water, and code dimensions.",
      },
    ],
    nudges: [],
  },

  document_audit: {
    stages: [
      {
        agentKeys: ["document_whisperer"],
        mode: "parallel",
        rationale: "Full document extraction and packet readiness check.",
      },
    ],
    nudges: [
      {
        trigger: "document_whisperer.packetReadiness.readinessScore < 0.7",
        suggestedAction: "Packet readiness below 70% — collect missing documents before submitting permit application.",
      },
    ],
  },

  rebate_discovery: {
    stages: [
      {
        agentKeys: ["rebate_maximizer"],
        mode: "parallel",
        rationale: "Scan active jobs for eligible rebate and incentive programs.",
      },
    ],
    nudges: [],
  },

  single_agent: {
    stages: [],  // Filled dynamically by the router
    nudges: [],
  },

  full_audit: {
    stages: [
      {
        agentKeys: ["storm_scout", "leak_hunter", "code_guardian"],
        mode: "parallel",
        rationale: "Stage 1: Risk scan across all dimensions simultaneously.",
      },
      {
        agentKeys: ["rebate_maximizer", "draw_guardian"],
        mode: "parallel",
        rationale: "Stage 2: Financial opportunity and draw integrity checks.",
      },
      {
        agentKeys: ["document_whisperer", "escrow_automator"],
        mode: "parallel",
        rationale: "Stage 3: Document audit and closing readiness.",
      },
    ],
    nudges: [],
  },
};

// ---------------------------------------------------------------------------
// LLM-powered intent classification
// ---------------------------------------------------------------------------

const CLASSIFICATION_SYSTEM_PROMPT = `You are the Neural Command OS intent router for Kluje, a construction intelligence platform.

Your job is to classify a user's natural language query and return a routing plan JSON object.

Available intent labels and when to use them:
- "renovation_workflow": User wants to plan, monitor, or audit a renovation or construction project end-to-end.
- "zoning_entitlement": User asks about permits, zoning approvals, code compliance, or entitlement paths.
- "lending_capital": User asks about draw requests, financing, cash flow, or closing/escrow.
- "bid_estimating": User wants to estimate a job cost, price a project, or understand what to bid.
- "market_intelligence": User asks about local market conditions, competitor landscape, demand trends, or where to focus their business.
- "proposal_generation": User wants to generate a client proposal, write up a contract scope, or create a project quote document.
- "risk_scan": User wants a general risk check or status overview of active jobs.
- "document_audit": User wants document review, permit packet assembly, or entity extraction.
- "rebate_discovery": User asks about rebates, tax credits, or energy incentive programs.
- "single_agent": User explicitly names one agent or asks for one specific capability.
- "full_audit": User wants a comprehensive audit of everything.

If the query mentions a single agent by name or capability, set intent to "single_agent" and set
singleAgentKey to one of: leak_hunter, code_guardian, rebate_maximizer, storm_scout, draw_guardian,
document_whisperer, escrow_automator, renovation_ai, zoning_ai, lending_ai, bid_estimator, market_intel, proposal_ai.

Return ONLY this JSON object (no markdown, no extra text):
{
  "intent": "<intent_label>",
  "intentSummary": "<one sentence describing what the user wants>",
  "singleAgentKey": "<agent_key or null>",
  "confidence": <0.0 to 1.0>
}`;

export interface ClassificationResult {
  intent: IntentLabel;
  intentSummary: string;
  singleAgentKey: string | null;
  confidence: number;
}

export async function classifyIntent(
  openAiKey: string,
  query: string
): Promise<ClassificationResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ROUTER_MODEL,
      messages: [
        { role: "system", content: CLASSIFICATION_SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      temperature: 0,
      max_tokens: 256,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    // Fallback to risk_scan if classification fails
    return { intent: "risk_scan", intentSummary: query, singleAgentKey: null, confidence: 0 };
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  try {
    const parsed = JSON.parse(data.choices[0].message.content) as ClassificationResult;
    return parsed;
  } catch {
    return { intent: "risk_scan", intentSummary: query, singleAgentKey: null, confidence: 0 };
  }
}

// ---------------------------------------------------------------------------
// Build routing plan from classification
// ---------------------------------------------------------------------------

export function buildRoutingPlan(classification: ClassificationResult): RoutingPlan {
  const { intent, intentSummary, singleAgentKey } = classification;

  if (intent === "single_agent" && singleAgentKey) {
    const plan: RoutingPlan = {
      intent,
      intentSummary,
      stages: [{
        stage: 1,
        agentKeys: [singleAgentKey],
        mode: "parallel",
        rationale: `Direct routing to ${singleAgentKey} as requested.`,
      }],
      nudges: [],
      allAgentKeys: [singleAgentKey],
    };
    return plan;
  }

  const template = INTENT_AGENT_MAP[intent] ?? INTENT_AGENT_MAP.risk_scan;
  const stages = template.stages.map((s, i) => ({ ...s, stage: i + 1 }));
  const allAgentKeys = [...new Set(stages.flatMap((s) => s.agentKeys))];

  return {
    intent,
    intentSummary,
    stages,
    nudges: template.nudges,
    allAgentKeys,
  };
}

// ---------------------------------------------------------------------------
// Synthesis prompt
// ---------------------------------------------------------------------------

export const SYNTHESIS_SYSTEM_PROMPT = `You are the Neural Command OS synthesis engine for Kluje.

You receive the outputs of multiple specialized AI agents that have analyzed a construction project.
Your job is to produce a unified, actionable briefing for the project owner or contractor.

Guidelines:
- Lead with the most urgent finding.
- Combine insights across agents — surface cross-domain connections (e.g., storm risk + pending permit = double delay threat).
- List concrete next actions in priority order.
- Keep language direct and construction-industry appropriate.
- Identify any cross-agent nudges (e.g., cash-flow gap found → recommend routing to lending agent).

Return ONLY this JSON (no markdown):
{
  "headline": "<one sentence summary of the most important finding>",
  "narrative": "<3–5 sentence integrated summary of all agent findings>",
  "actions": [{ "priority": "high"|"medium"|"low", "action": string, "sourceAgent": string }],
  "nudges": [{ "trigger": string, "suggestedAction": string }],
  "riskLevel": "low"|"moderate"|"elevated"|"high",
  "confidence": <0.0 to 1.0>
}`;
