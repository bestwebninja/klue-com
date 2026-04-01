import { useParams } from "react-router-dom";
import { CommandCenterLayout } from "../components/layout/CommandCenterLayout";
import { useDashboardTemplate } from "../hooks/useDashboardTemplate";
import { KPIInsightCard } from "../components/cards/KPIInsightCard";
import { PipelineBoard } from "../components/pipeline/PipelineBoard";
import { AgentPanel } from "../components/agents/AgentPanel";

export default function TradeCommandCenterPage() {
  const { workspaceId = "default-workspace", tradeKey = "plumbing" } = useParams();
  const template = useDashboardTemplate("trade", tradeKey as any);
  return <CommandCenterLayout workspaceId={workspaceId}><h1 className="text-2xl font-semibold">{template?.name ?? "Trade Command Center"}</h1><div className="grid md:grid-cols-4 gap-3">{template?.config.kpis.map((k) => <KPIInsightCard key={k.key} label={k.label} value={k.value} delta={k.delta} />)}</div><PipelineBoard items={[{ id: "1", label: "Urgent service call", stage: "Dispatch", priority: "high" }]} /><AgentPanel name={template?.config.agents[0]?.label ?? "Agent"} description={template?.config.agents[0]?.description ?? ""} /></CommandCenterLayout>;
}
