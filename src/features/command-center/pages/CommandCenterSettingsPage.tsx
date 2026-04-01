import { useParams } from "react-router-dom";
import { CommandCenterLayout } from "../components/layout/CommandCenterLayout";

export default function CommandCenterSettingsPage() {
  const { workspaceId = "default-workspace" } = useParams();
  return <CommandCenterLayout workspaceId={workspaceId}><h1 className="text-2xl font-semibold">Command Center Settings</h1></CommandCenterLayout>;
}
