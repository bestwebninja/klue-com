import { ReactNode } from "react";
import { CommandCenterHeader } from "./CommandCenterHeader";
import { CommandCenterSidebar } from "./CommandCenterSidebar";
import { CommandCenterRightRail } from "./CommandCenterRightRail";
import { CommandCenterFooter } from "./CommandCenterFooter";
import { useVoiceSession } from "../../hooks/useVoiceSession";

export function CommandCenterLayout({ workspaceId, children }: { workspaceId: string; children: ReactNode }) {
  const voice = useVoiceSession();

  return <div className="min-h-screen flex flex-col bg-background">
    <CommandCenterHeader workspaceId={workspaceId} onWorkspaceChange={() => undefined} voiceActive={voice.active} onVoiceToggle={voice.toggle} />
    <main className="flex-1 grid grid-cols-1 md:grid-cols-[220px_1fr_280px]">
      <CommandCenterSidebar basePath={`/command-center/${workspaceId}`} />
      <section className="p-4 space-y-4 overflow-auto">{children}</section>
      <div className="p-3 border-l"><CommandCenterRightRail /></div>
    </main>
    <CommandCenterFooter />
  </div>;
}
