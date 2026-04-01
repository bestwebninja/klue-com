export interface PipelineItem { id: string; label: string; stage: string; priority?: "low" | "medium" | "high"; owner?: string; }
