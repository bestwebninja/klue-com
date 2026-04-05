import { ReactNode } from "react";
import { CommandCenterHeader } from "./CommandCenterHeader";
import { CommandCenterSidebar } from "./CommandCenterSidebar";
import { CommandCenterRightRail } from "./CommandCenterRightRail";
import { CommandCenterFooter } from "./CommandCenterFooter";
import { useVoiceSession } from "../../hooks/useVoiceSession";
import type { DashboardTemplateConfig } from "../../templates/types";

export function CommandCenterLayout({ workspaceId, children, config }: { workspaceId: string; children: ReactNode; config?: DashboardTemplateConfig }) {
  const voice = useVoiceSession();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CommandCenterHeader workspaceId={workspaceId} onWorkspaceChange={() => undefined} voiceActive={voice.active} onVoiceToggle={voice.toggle} />
      <main className="flex-1 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18)_0%,transparent_35%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card)/0.45)_100%)]">
        <div className="mx-auto grid w-full max-w-[1700px] grid-cols-1 gap-4 px-4 py-4 pb-[calc(var(--cookie-consent-offset,0px)+1rem)] md:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_320px] md:px-6">
          <CommandCenterSidebar basePath={`/command-center/${workspaceId}`} items={config?.sidebarNav} />
          <section className="space-y-4 rounded-xl border border-border/70 bg-background/35 p-4 md:p-5 overflow-auto">{children}</section>
          <div className="xl:block hidden">
            <div className="sticky top-4">
              <CommandCenterRightRail data={config?.rightRail} />
            </div>
          </div>
        </div>
      </main>
      <CommandCenterFooter lastSync={config?.footerStatus?.lastSync} connection={config?.footerStatus?.connection} />
    </div>
  );
}
