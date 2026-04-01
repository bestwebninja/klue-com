import type { AgentDefinition } from "../../types";

export const agentRegistry: AgentDefinition[] = [
  { key: "leak_hunter", name: "Leak Hunter", inputSchemaKeys: ["workspaceId", "jobs"], outputSchemaKeys: ["riskClusters", "recommendedActions"] },
  { key: "code_guardian", name: "Code Guardian", inputSchemaKeys: ["workspaceId", "estimate"], outputSchemaKeys: ["violations", "fixes"] },
  { key: "rebate_maximizer", name: "Rebate Maximizer", inputSchemaKeys: ["zip", "sku"], outputSchemaKeys: ["eligiblePrograms"] },
  { key: "storm_scout", name: "Storm Scout", inputSchemaKeys: ["zip"], outputSchemaKeys: ["stormRisk"] },
  { key: "draw_guardian", name: "Draw Guardian", inputSchemaKeys: ["drawRequest"], outputSchemaKeys: ["riskScore", "flags"] },
  { key: "document_whisperer", name: "Document Whisperer", inputSchemaKeys: ["documentId"], outputSchemaKeys: ["entities", "issues"] },
  { key: "escrow_automator", name: "Escrow Automator", inputSchemaKeys: ["closingPacket"], outputSchemaKeys: ["tasks", "handoffStatus"] },
];
