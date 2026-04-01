export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed";
export interface AgentDefinition { key: string; name: string; inputSchemaKeys: string[]; outputSchemaKeys: string[]; }
