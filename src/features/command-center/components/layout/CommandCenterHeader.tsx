import { Bell, Search, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { VoiceMicButton } from "./VoiceMicButton";

export function CommandCenterHeader(props: { workspaceId: string; onWorkspaceChange: (id: string) => void; voiceActive: boolean; onVoiceToggle: () => void }) {
  return <header className="border-b p-3 flex items-center gap-3">
    <WorkspaceSwitcher value={props.workspaceId} onChange={props.onWorkspaceChange} options={[{ id: props.workspaceId || "default", name: "Default Workspace" }]} />
    <VoiceMicButton active={props.voiceActive} onToggle={props.onVoiceToggle} />
    <div className="relative flex-1"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" placeholder="Global search" /></div>
    <Bell className="h-5 w-5" />
    <UserCircle2 className="h-6 w-6" />
  </header>;
}
