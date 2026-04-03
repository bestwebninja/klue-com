# Vertical Expert Agent Build Artifacts

This directory scaffolds canonical outputs for the slash commands requested in planning sessions.
Each command has a YAML artifact with an explicit `command`, `owner`, `inputs`, and `outputs` contract.

- Canonical seed artifact (merged shared patterns + command registry): `vertical-expert-agents.seed.yaml`

- `/build-shared-foundation` → `build-shared-foundation.yaml`
- `/build-v1-agent` → `build-v1-agent.yaml`
- `/build-v2-agent` → `build-v2-agent.yaml`
- `/build-v3-agent` → `build-v3-agent.yaml`
- `/build-v4-agent` → `build-v4-agent.yaml`
- `/build-v5-agent` → `build-v5-agent.yaml`
- `/build-v6-agent` → `build-v6-agent.yaml`
- `/build-v7-agent` → `build-v7-agent.yaml`
- `/build-v8-agent` → `build-v8-agent.yaml`
- `/build-v9-agent` → `build-v9-agent.yaml`
- `/build-v10-agent` → `build-v10-agent.yaml`

- `/build-shared-command-schema` → `shared/build-shared-command-schema.yaml`
- `/build-shared-input-output-contracts` → `shared/build-shared-input-output-contracts.yaml`
- `/build-shared-standard-outputs` → `shared/build-shared-standard-outputs.yaml`
- `/build-shared-quote-evaluation-model` → `shared/build-shared-quote-evaluation-model.yaml`
- `/build-shared-rebundlable-module-schema` → `shared/build-shared-rebundlable-module-schema.yaml`
- `/build-kluje-build-agent-core` → `shared/build-kluje-build-agent-core.yaml`


## Codex execution order

For orchestrated multi-agent builds and release packaging, use:
- `codex-execution-order.yaml`

Command phases:
- Shared foundation: `/build-shared-foundation`
- Agent builds: `/build-v1-agent` through `/build-v10-agent`
- Validation:
  - `/validate-shared-contract-consistency`
  - `/validate-agent-command-coverage`
  - `/validate-output-schema-alignment`
  - `/validate-guardrail-completeness`
  - `/validate-rebundlable-module-attachments`
- Packaging:
  - `/build-master-agent-registry`
  - `/build-cross-agent-dependency-map`
  - `/build-release-ready-yaml`

## V1 — Home Trades Expert
- `/v1/build-intake-question-tree` → `v1/build-intake-question-tree.yaml`
- `/v1/build-command-contracts` → `v1/build-command-contracts.yaml`
- `/v1/build-output-json-schemas` → `v1/build-output-json-schemas.yaml`
- `/v1/build-risk-taxonomy` → `v1/build-risk-taxonomy.yaml`
- `/v1/build-provider-type-taxonomy` → `v1/build-provider-type-taxonomy.yaml`
- `/v1/build-guardrails` → `v1/build-guardrails.yaml`
- `/v1/build-prompt-templates` → `v1/build-prompt-templates.yaml`

## V2 — Design & Build Expert
- `/v2/build-intake-question-tree` → `v2/build-intake-question-tree.yaml`
- `/v2/build-command-contracts` → `v2/build-command-contracts.yaml`
- `/v2/build-output-json-schemas` → `v2/build-output-json-schemas.yaml`
- `/v2/build-design-brief-schema` → `v2/build-design-brief-schema.yaml`
- `/v2/build-portfolio-rubric` → `v2/build-portfolio-rubric.yaml`
- `/v2/build-guardrails` → `v2/build-guardrails.yaml`
- `/v2/build-prompt-templates` → `v2/build-prompt-templates.yaml`

## V3 — Living Solutions Expert
- `/v3/build-intake-question-tree` → `v3/build-intake-question-tree.yaml`
- `/v3/build-command-contracts` → `v3/build-command-contracts.yaml`
- `/v3/build-output-json-schemas` → `v3/build-output-json-schemas.yaml`
- `/v3/build-recurring-service-taxonomy` → `v3/build-recurring-service-taxonomy.yaml`
- `/v3/build-bundle-logic` → `v3/build-bundle-logic.yaml`
- `/v3/build-guardrails` → `v3/build-guardrails.yaml`
- `/v3/build-prompt-templates` → `v3/build-prompt-templates.yaml`

## V4 — Commercial & Facilities Expert
- `/v4/build-intake-question-tree` → `v4/build-intake-question-tree.yaml`
- `/v4/build-command-contracts` → `v4/build-command-contracts.yaml`
- `/v4/build-output-json-schemas` → `v4/build-output-json-schemas.yaml`
- `/v4/build-sla-taxonomy` → `v4/build-sla-taxonomy.yaml`
- `/v4/build-vendor-comparison-model` → `v4/build-vendor-comparison-model.yaml`
- `/v4/build-guardrails` → `v4/build-guardrails.yaml`
- `/v4/build-prompt-templates` → `v4/build-prompt-templates.yaml`

## V5 — Vertical 5 Command Center Operations Expert
- `/v5/build-intake-question-tree` → `v5/build-intake-question-tree.yaml`
- `/v5/build-command-contracts` → `v5/build-command-contracts.yaml`
- `/v5/build-output-json-schemas` → `v5/build-output-json-schemas.yaml`
- `/v5/build-risk-taxonomy` → `v5/build-risk-taxonomy.yaml`
- `/v5/build-provider-type-taxonomy` → `v5/build-provider-type-taxonomy.yaml`
- `/v5/build-compliance-warning-library` → `v5/build-compliance-warning-library.yaml`
- `/v5/build-prompt-variants` → `v5/build-prompt-variants.yaml`
- `/v5/build-universal-operating-layer` → `v5/build-universal-operating-layer.yaml`

## V6 — Business Services Expert
- `/v6/build-intake-question-tree` → `v6/build-intake-question-tree.yaml`
- `/v6/build-command-contracts` → `v6/build-command-contracts.yaml`
- `/v6/build-output-json-schemas` → `v6/build-output-json-schemas.yaml`
- `/v6/build-deliverable-type-taxonomy` → `v6/build-deliverable-type-taxonomy.yaml`
- `/v6/build-handoff-framework` → `v6/build-handoff-framework.yaml`
- `/v6/build-guardrails` → `v6/build-guardrails.yaml`
- `/v6/build-prompt-templates` → `v6/build-prompt-templates.yaml`

## V7 — Legal Services Expert
- `/v7/build-intake-question-tree` → `v7/build-intake-question-tree.yaml`
- `/v7/build-command-contracts` → `v7/build-command-contracts.yaml`
- `/v7/build-output-json-schemas` → `v7/build-output-json-schemas.yaml`
- `/v7/build-matter-type-taxonomy` → `v7/build-matter-type-taxonomy.yaml`
- `/v7/build-lawyer-type-taxonomy` → `v7/build-lawyer-type-taxonomy.yaml`
- `/v7/build-legal-guardrail-library` → `v7/build-legal-guardrail-library.yaml`
- `/v7/build-prompt-templates` → `v7/build-prompt-templates.yaml`

## V8 — Property Management Expert
- `/v8/build-intake-question-tree` → `v8/build-intake-question-tree.yaml`
- `/v8/build-command-contracts` → `v8/build-command-contracts.yaml`
- `/v8/build-output-json-schemas` → `v8/build-output-json-schemas.yaml`
- `/v8/build-tenancy-state-taxonomy` → `v8/build-tenancy-state-taxonomy.yaml`
- `/v8/build-turnover-workflow-taxonomy` → `v8/build-turnover-workflow-taxonomy.yaml`
- `/v8/build-management-support-taxonomy` → `v8/build-management-support-taxonomy.yaml`
- `/v8/build-prompt-templates` → `v8/build-prompt-templates.yaml`

## V9 — Real Estate Transactions Expert
- `/v9/build-intake-question-tree` → `v9/build-intake-question-tree.yaml`
- `/v9/build-command-contracts` → `v9/build-command-contracts.yaml`
- `/v9/build-output-json-schemas` → `v9/build-output-json-schemas.yaml`
- `/v9/build-transaction-stage-taxonomy` → `v9/build-transaction-stage-taxonomy.yaml`
- `/v9/build-service-dependency-map` → `v9/build-service-dependency-map.yaml`
- `/v9/build-deal-blocker-taxonomy` → `v9/build-deal-blocker-taxonomy.yaml`
- `/v9/build-prompt-templates` → `v9/build-prompt-templates.yaml`

## V10 — Kluje Build Agent for Vertical 10
- `/v10/build-intake-question-tree` → `v10/build-intake-question-tree.yaml`
- `/v10/build-command-contracts` → `v10/build-command-contracts.yaml`
- `/v10/build-output-json-schemas` → `v10/build-output-json-schemas.yaml`
- `/v10/build-cross-layer-decision-frame` → `v10/build-cross-layer-decision-frame.yaml`
- `/v10/build-dashboard-view-contracts` → `v10/build-dashboard-view-contracts.yaml`
- `/v10/build-prompt-templates` → `v10/build-prompt-templates.yaml`
