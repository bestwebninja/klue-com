import { useParams } from "react-router-dom";
import { CommandCenterLayout } from "../components/layout/CommandCenterLayout";
import { useDashboardTemplate } from "../hooks/useDashboardTemplate";
import { KPIInsightCard } from "../components/cards/KPIInsightCard";
import { DocumentDrawer } from "../components/documents/DocumentDrawer";

export default function TitleCommandCenterPage() {
  const { workspaceId = "default-workspace" } = useParams();
  const template = useDashboardTemplate("title");
  return <CommandCenterLayout workspaceId={workspaceId}><h1 className="text-2xl font-semibold">{template?.name}</h1><div className="grid md:grid-cols-3 gap-3">{template?.config.kpis.map((k) => <KPIInsightCard key={k.key} label={k.label} value={k.value} delta={k.delta} />)}</div><DocumentDrawer /></CommandCenterLayout>;
}
