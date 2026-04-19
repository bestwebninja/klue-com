import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Wind, Target, Send, TrendingUp, Radar, ArrowLeft } from 'lucide-react';

type NodeSpec = {
  node: string;
  objective: string;
  output: string;
  prompt: string;
};

const appDefinitions = [
  {
    name: 'Market Map',
    outcome: 'Rank local HVAC accounts worth contacting this week to produce meetings and replacement opportunities.',
    kpi: 'Targets scored, tiered, and turned into why-now outreach angles in under 24 hours.',
    icon: Target,
  },
  {
    name: 'Outbound Copilot',
    outcome: 'Turn account intelligence into booked calls with operator-grade messaging and objections handled.',
    kpi: '5-touch / 12-business-day sequence generated with account-specific ROI offer mapping.',
    icon: Send,
  },
  {
    name: 'Job Value Maximizer',
    outcome: 'Increase revenue per booked job with ethical path recommendations and call guidance.',
    kpi: 'Higher conversion to replacements, memberships, and accessories without pressure-selling.',
    icon: TrendingUp,
  },
  {
    name: 'Competitive Watch',
    outcome: 'Detect local competitor changes early and convert changes into tactical sales talk tracks.',
    kpi: 'Weekly briefing: what changed, why it matters, what to say, and who to target now.',
    icon: Radar,
  },
];

const sharedSchemas = {
  Account: {
    account_id: 'string',
    company_name: 'string',
    territory: 'string',
    segment: 'residential | light_commercial | mixed',
    website: 'string',
    service_area: 'string[]',
    employee_band: '5-20 | 21-50 | 51-150',
    review_count: 'number',
    review_rating: 'number',
    signals: 'Signal[]',
    score: 'number(0-100)',
    tier: 'tier_1 | tier_2 | tier_3',
    primary_pitch_angle: 'string',
  },
  Contact: {
    contact_id: 'string',
    account_id: 'string',
    name: 'string',
    role: 'string',
    email: 'string | null',
    phone: 'string | null',
    persona: 'owner | gm | sales_manager | ops_manager | install_manager | dispatch_lead',
    buyer_motivations: 'string[]',
  },
  Opportunity: {
    opportunity_id: 'string',
    account_id: 'string',
    intent_class: 'emergency_repair | maintenance | replacement_candidate | heat_pump_upsell | iaq_accessory | commercial_service',
    estimated_value_band: 'low | medium | high | premium',
    recommended_path: 'repair | replace | replace_plus_finance | membership | accessory_upsell | deferred_follow_up',
    next_step: 'string',
    follow_up_date: 'YYYY-MM-DD',
  },
};

const workflowNodes: { workflow: string; sequence: string; nodes: NodeSpec[] }[] = [
  {
    workflow: 'Workflow 1 · Build Territory List',
    sequence: 'Territory Intake → ICP Qualification → Signal Extraction → Account Scoring → Why-Now Narrative',
    nodes: [
      {
        node: 'Territory Intake',
        objective: 'Normalize city/state/ZIP/radius/segment/campaign objective into a single deterministic territory request.',
        output: '{ territory_request, validation_flags, normalized_filters }',
        prompt: 'Objective: normalize territory input for U.S. HVAC prospecting. Input: user territory fields. Output JSON only with keys territory_request, validation_flags, normalized_filters. Constraints: reject missing geography or objective. Do not infer unknown ZIP. Commercial rule: include campaign objective that ties to booked jobs in <30 days.',
      },
      {
        node: 'ICP Qualification',
        objective: 'Keep true residential/light-commercial HVAC field-service operators, reject irrelevant businesses.',
        output: '{ qualified:boolean, qualification_reasons[], reject_reasons[], confidence }',
        prompt: 'Objective: determine if company fits HVAC OS ICP. Input: company facts and public evidence snippets. Output JSON only. Apply hard filters: must provide HVAC field service; employee band 5-150 preferred; active lead capture required. Downgrade confidence if evidence is weak. Include explicit commercial reason for qualification or rejection.',
      },
      {
        node: 'Signal Extraction',
        objective: 'Extract monetizable signals from public evidence and map to revenue implications.',
        output: '{ signals:[{type,evidence,implication,urgency,confidence}] }',
        prompt: 'Objective: extract HVAC revenue signals. Input: website/review/job-posting snippets. Output JSON only with signals array. Each signal must include evidence, commercial implication, urgency(low|medium|high), confidence(0-1). Allowed signal types: financing, heat_pump, same_day_service, maintenance_plan, hiring_spike, review_shift, premium_vs_discount, expansion. Never output raw evidence without implication.',
      },
      {
        node: 'Account Scoring',
        objective: 'Score each account 0-100 using weighted fit and urgency criteria.',
        output: '{ score, tier, weighted_breakdown, pay_likelihood }',
        prompt: 'Objective: score HVAC accounts for immediate outbound. Input: qualified account + signals. Output JSON only. Weights: ICP_fit 30, signal_strength 25, urgency 20, digital_maturity 15, willingness_to_pay 10. Return score 0-100, tier_1 >=80, tier_2 60-79, tier_3 <60. Include weighted_breakdown and pay_likelihood. Lower score when data is incomplete.',
      },
      {
        node: 'Why-Now Narrative',
        objective: 'Produce concise rep guidance: why contact now, what angle to use, and what next step to take.',
        output: '{ why_now, pitch_angle, urgency_level, next_step }',
        prompt: 'Objective: convert score + signals into immediate sales action. Input: account object with score and signals. Output JSON only. why_now max 60 words. pitch_angle must map to one monetizable outcome (bookings, replacements, ticket size, review leakage, competitor pressure). next_step must be one actionable rep task due within 48 hours.',
      },
    ],
  },
  {
    workflow: 'Workflow 2 · Launch Outbound',
    sequence: 'Selected Account → Persona Selection → Offer Mapping → Outreach Generation → Follow-Up Sequencing → Objection Handling',
    nodes: [
      {
        node: 'Persona Selection',
        objective: 'Pick buyer persona by company size and operating profile.',
        output: '{ persona, reasoning, secondary_persona }',
        prompt: 'Objective: pick most likely HVAC buyer persona. Input: account profile + size + operating profile. Output JSON only with persona, reasoning, secondary_persona. Allowed personas: owner, gm, sales_manager, ops_manager, install_manager, dispatch_lead. Keep reasoning under 35 words and include one operational indicator.',
      },
      {
        node: 'Offer Mapping',
        objective: 'Choose the single best short-term ROI offer for that account.',
        output: '{ selected_offer, roi_hypothesis, proof_asset }',
        prompt: 'Objective: map account to highest-probability offer. Input: account signals + persona. Output JSON only. Allowed offers: territory mapping, competitor promo intel, booking script optimization, replacement/heat-pump detection, review-loss diagnosis. Select one offer and provide roi_hypothesis with estimated 30-day impact range.',
      },
      {
        node: 'Outreach Generation',
        objective: 'Create operator-style outreach assets using one observation, one pain implication, one CTA.',
        output: '{ subject, cold_email, call_opener, voicemail, sms }',
        prompt: 'Objective: generate outreach that sounds like HVAC operator-to-operator. Input: account + selected_offer + persona. Output JSON only with subject, cold_email, call_opener, voicemail, sms. Each asset must include 1 concrete observation, 1 pain implication, 1 clear CTA. Ban generic AI language and buzzwords.',
      },
      {
        node: 'Follow-Up Sequencing',
        objective: 'Produce 5 touches over 12 business days with distinct angles.',
        output: '{ touches:[{day,channel,angle,message}] }',
        prompt: 'Objective: create 5-touch sequence over 12 business days. Input: outreach assets + account context. Output JSON only. Angles required exactly once each: demand_signal, competitive_threat, missed_bookings, ticket_size, low_friction_proof. Keep each message under 75 words.',
      },
      {
        node: 'Objection Handling',
        objective: 'Generate short rebuttals tied to operational outcomes.',
        output: '{ objections:[{objection,response,next_question}] }',
        prompt: 'Objective: produce concise HVAC sales rebuttals. Input: selected_offer and persona. Output JSON only covering objections: we have CRM, enough leads, send info, too busy, already do marketing, not interested. Each response under 45 words plus one next_question to reopen conversation.',
      },
    ],
  },
  {
    workflow: 'Workflow 3 · Increase Ticket Size',
    sequence: 'Lead Intent Classification → High-Ticket Opportunity Evaluation → Call Script Coaching → CRM Note Generation',
    nodes: [
      {
        node: 'Lead Intent Classification',
        objective: 'Classify service opportunity into an intent bucket.',
        output: '{ intent_class, confidence, key_evidence }',
        prompt: 'Objective: classify HVAC opportunity intent. Input: call transcript or intake notes. Output JSON only. Allowed intent_class values: emergency_repair, maintenance, replacement_candidate, heat_pump_upsell, iaq_accessory, commercial_service. Include confidence and 2 evidence points. Lower confidence if evidence is sparse.',
      },
      {
        node: 'High-Ticket Opportunity Evaluation',
        objective: 'Recommend highest-value ethical path based on need and probability.',
        output: '{ recommended_path, value_band, rationale, risk_flags }',
        prompt: 'Objective: choose ethical revenue path. Input: intent_class + customer context + equipment hints. Output JSON only. Path options: repair, replace, replace_plus_finance, membership, accessory_upsell, deferred_follow_up. Must include rationale with customer-benefit first and any risk_flags where upsell is not justified.',
      },
      {
        node: 'Call Script Coaching',
        objective: 'Generate trust-forward talk tracks for CSR/advisor/rep.',
        output: '{ opening, discovery_questions[], transition, financing_phrase, close }',
        prompt: 'Objective: generate practical HVAC call language. Input: recommended_path + persona context. Output JSON only. Style: clear, non-pushy, operator-grade. Include opening, 4 discovery_questions, one transition line, one financing phrase, one close. Avoid hype and manipulative language.',
      },
      {
        node: 'CRM Note Generation',
        objective: 'Create clean structured notes for next actions and handoffs.',
        output: '{ summary, customer_pain, recommended_offer, next_step, follow_up_date, escalation_flags[] }',
        prompt: 'Objective: generate CRM-ready operational notes. Input: interaction summary + recommended_path. Output JSON only. Keep summary <= 70 words. Include explicit next_step owner and follow_up_date. Add escalation_flags when safety, financing confusion, or dissatisfaction appears.',
      },
    ],
  },
  {
    workflow: 'Workflow 4 · Competitive Monitoring',
    sequence: 'Competitor Snapshot → Change Detection → Weekly Brief Writing',
    nodes: [
      {
        node: 'Competitor Snapshot',
        objective: 'Capture current competitor market signals in structured form.',
        output: '{ competitor_id, snapshot_date, signals:[{type,evidence,confidence}] }',
        prompt: 'Objective: summarize competitor positioning from public evidence. Input: website/promotions/reviews snippets. Output JSON only. Track: offer_signals, pricing_cues, financing_cues, review_themes, trust_signals, likely_weaknesses. Include confidence score for each signal.',
      },
      {
        node: 'Change Detection',
        objective: 'Compare current vs previous snapshot and flag meaningful deltas.',
        output: '{ changes:[{type,change,commercial_impact,affected_accounts}] }',
        prompt: 'Objective: detect meaningful local competitor changes. Input: previous and current snapshot. Output JSON only. Report only material changes: promos, financing pushes, heat-pump shifts, service-area expansion, review spikes/drops, trust-language shifts. Every change must include commercial_impact and affected_accounts list.',
      },
      {
        node: 'Weekly Brief Writing',
        objective: 'Create tactical weekly brief for sales conversations.',
        output: '{ what_changed, why_it_matters, what_to_say_this_week, affected_accounts }',
        prompt: 'Objective: write concise tactical weekly HVAC brief. Input: detected changes + account mapping. Output tightly controlled text in 4 sections: what changed, why it matters, what to say this week, which accounts are affected. Max 220 words. No generic commentary.',
      },
    ],
  },
];

const rolloutPlan = [
  {
    window: 'Days 1-14 (May 1-14, 2026)',
    focus: 'Market Map + Outbound Copilot only',
    target: 'Generate and score 200-500 HVAC targets across 3 U.S. metros; ship outbound assets for pilot bookings.',
  },
  {
    window: 'Days 15-30 (May 15-30, 2026)',
    focus: 'Add Competitive Watch',
    target: 'Deliver weekly competitive briefs to improve messaging and increase meeting conversion.',
  },
  {
    window: 'Days 31-60 (May 31-Jun 29, 2026)',
    focus: 'Add Job Value Maximizer',
    target: 'Expand from meeting generation into conversion lift and average ticket growth.',
  },
  {
    window: 'Days 61-90 (Jun 30-Jul 29, 2026)',
    focus: 'Commercial packaging and scale',
    target: 'Tier 1 Territory Intel ($1.5k-$2.5k), Tier 2 Revenue Copilot ($3k-$5k), Tier 3 Market Command ($6k-$10k).',
  },
];

export default function HVACDept({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to dashboard">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold">Kluje HVAC OS</h2>
            <p className="text-sm text-muted-foreground">Revenue intelligence and execution system for U.S. HVAC operators (residential + light commercial).</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase-One Apps (Revenue First)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {appDefinitions.map((app) => {
            const Icon = app.icon;
            return (
              <div key={app.name} className="rounded-md border p-3 space-y-1.5">
                <div className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4 text-blue-500" /> {app.name}</div>
                <p className="text-sm text-muted-foreground">{app.outcome}</p>
                <p className="text-xs">{app.kpi}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shared Schemas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div>
            <Badge variant="secondary">Account</Badge>
            <pre className="mt-2 overflow-x-auto rounded bg-muted p-3">{JSON.stringify(sharedSchemas.Account, null, 2)}</pre>
          </div>
          <div>
            <Badge variant="secondary">Contact</Badge>
            <pre className="mt-2 overflow-x-auto rounded bg-muted p-3">{JSON.stringify(sharedSchemas.Contact, null, 2)}</pre>
          </div>
          <div>
            <Badge variant="secondary">Opportunity</Badge>
            <pre className="mt-2 overflow-x-auto rounded bg-muted p-3">{JSON.stringify(sharedSchemas.Opportunity, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Production Node Definitions + Exact Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workflowNodes.map((flow) => (
            <div key={flow.workflow} className="rounded-md border p-3 space-y-2">
              <div>
                <h3 className="font-semibold">{flow.workflow}</h3>
                <p className="text-xs text-muted-foreground">{flow.sequence}</p>
              </div>
              <Separator />
              {flow.nodes.map((node) => (
                <div key={node.node} className="space-y-1.5">
                  <p className="text-sm font-medium">{node.node}</p>
                  <p className="text-xs"><span className="font-semibold">Objective:</span> {node.objective}</p>
                  <p className="text-xs"><span className="font-semibold">Output:</span> {node.output}</p>
                  <p className="text-xs leading-relaxed"><span className="font-semibold">System Prompt:</span> {node.prompt}</p>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>90-Day Rollout + Commercial Packaging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {rolloutPlan.map((step) => (
            <div key={step.window} className="rounded-md border p-3">
              <p className="font-medium">{step.window}</p>
              <p><span className="font-semibold">Focus:</span> {step.focus}</p>
              <p className="text-muted-foreground">{step.target}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
