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
        agentKeys: ["storm_scout", "code_guardian"],
        mode: "parallel",
        rationale: "Simultaneously assess weather delay risk and code compliance for the project.",
      },
      {
        agentKeys: ["leak_hunter"],
        mode: "parallel",
        rationale: "Scan for water/moisture risk clusters across related jobs.",
      },
      {
        agentKeys: ["document_whisperer"],
        mode: "sequential",
        rationale: "Assemble permit packet after code issues are identified.",
      },
    ],
    nudges: [
      {
        trigger: "storm_scout.stormRisk.overallRisk === 'high'",
        suggestedAction: "High storm risk detected — consider notifying subcontractors of potential delays.",
      },
      {
        trigger: "code_guardian.violations.filter(v => v.severity === 'critical').length > 0",
        suggestedAction: "Critical code violations found — recommend pausing permit submission until resolved.",
        targetAgentKey: "document_whisperer",
      },
    ],
  },

  zoning_entitlement: {
    stages: [
      {
        agentKeys: ["code_guardian", "document_whisperer"],
        mode: "parallel",
        rationale: "Check compliance and extract permit entities at the same time.",
      },
    ],
    nudges: [
      {
        trigger: "code_guardian.violations.length > 2",
        suggestedAction: "Multiple violations may delay entitlement — consider a pre-application meeting with the jurisdiction.",
      },
    ],
  },

  lending_capital: {
    stages: [
      {
        agentKeys: ["draw_guardian"],
        mode: "parallel",
        rationale: "Screen draw requests for fraud and overbilling patterns.",
      },
      {
        agentKeys: ["escrow_automator"],
        mode: "sequential",
        rationale: "Run closing coordination after draw status is confirmed.",
      },
    ],
    nudges: [
      {
        trigger: "draw_guardian.recommendation === 'reject'",
        suggestedAction: "Draw rejected — recommend requesting revised invoice and lien waiver before resubmission.",
      },
      {
        trigger: "escrow_automator.handoffStatus.blockerCount > 0",
        suggestedAction: "Closing blockers detected — prioritize clearing critical documents before funding.",
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
- "risk_scan": User wants a general risk check or status overview of active jobs.
- "document_audit": User wants document review, permit packet assembly, or entity extraction.
- "rebate_discovery": User asks about rebates, tax credits, or energy incentive programs.
- "single_agent": User explicitly names one agent or asks for one specific capability.
- "full_audit": User wants a comprehensive audit of everything.

If the query mentions a single agent by name or capability, set intent to "single_agent" and set
singleAgentKey to one of: leak_hunter, code_guardian, rebate_maximizer, storm_scout, draw_guardian,
document_whisperer, escrow_automator.

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
