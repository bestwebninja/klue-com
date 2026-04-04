import { useEffect } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CommandCenterLayout } from "../components/layout/CommandCenterLayout";
import { KPIInsightCard } from "../components/cards/KPIInsightCard";
import { PipelineBoard } from "../components/pipeline/PipelineBoard";
import { AgentPanel } from "../components/agents/AgentPanel";
import { useDashboardTemplate } from "../hooks/useDashboardTemplate";
import type { PipelineCardConfig } from "../templates/types";
import { MyDashboardView } from "../components/dashboard/MyDashboardView";

const fallbackPipeline: PipelineCardConfig[] = [
  { id: "f1", label: "Emergency water heater estimate", stage: "New", priority: "high", owner: "T. Lewis", eta: "Today" },
  { id: "f2", label: "Dispatch permit runner", stage: "Dispatch", priority: "medium", owner: "M. Khan", eta: "11:30 AM" },
  { id: "f3", label: "Install crew onsite", stage: "In Progress", priority: "medium", owner: "Crew B", eta: "2:15 PM" },
  { id: "f4", label: "Invoice + closeout package", stage: "Complete", priority: "low", owner: "Ops", eta: "Done" },
];

export default function TradeCommandCenterPage() {
  const { workspaceId = "default-workspace", tradeKey = "plumbing" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const template = useDashboardTemplate("trade", tradeKey as any);
  const section = searchParams.get("section") ?? "home";

  useEffect(() => {
    if (!searchParams.get("section")) {
      navigate(`${location.pathname}?section=home`, { replace: true });
    }
  }, [location.pathname, navigate, searchParams]);

  if (section === "home") {
    return (
      <CommandCenterLayout workspaceId={workspaceId} config={template?.config}>
        <MyDashboardView />
      </CommandCenterLayout>
    );
  }

  return (
    <CommandCenterLayout workspaceId={workspaceId} config={template?.config}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{template?.name ?? "Trade Command Center"}</h1>
        <p className="text-sm text-muted-foreground">Live operations, pipeline execution, and AI agent controls.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {template?.config.kpis.map((kpi) => (
          <KPIInsightCard key={kpi.key} {...kpi} />
        ))}
      </div>

      <PipelineBoard items={template?.config.pipelineItems ?? fallbackPipeline} />
      <AgentPanel agents={template?.config.agents ?? []} />
    </CommandCenterLayout>
  );
}
