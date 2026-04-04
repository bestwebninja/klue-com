import { Bell, Building2, ChevronDown, Search, ShieldCheck, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { VoiceMicButton } from "./VoiceMicButton";

export function CommandCenterHeader(props: { workspaceId: string; onWorkspaceChange: (id: string) => void; voiceActive: boolean; onVoiceToggle: () => void }) {
  return (
    <header className="border-b border-border/80 bg-[linear-gradient(90deg,hsl(var(--background))_0%,hsl(var(--card))_100%)] px-4 py-3 md:px-6">
      <div className="mx-auto flex w-full max-w-[1700px] items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Kluje</p>
            <p className="text-sm font-semibold">Command Center</p>
          </div>
        </div>
        <WorkspaceSwitcher value={props.workspaceId} onChange={props.onWorkspaceChange} options={[{ id: props.workspaceId || "default", name: "Default Workspace" }]} />
        <VoiceMicButton active={props.voiceActive} onToggle={props.onVoiceToggle} />
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
          <Input className="pl-9 bg-background/60 border-primary/25 focus-visible:ring-primary/60" placeholder="Search jobs, alerts, agents..." />
        </div>
        <button className="relative rounded-md border border-border/70 p-2 hover:bg-muted/50" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">3</span>
        </button>
        <button className="hidden md:flex items-center gap-2 rounded-lg border border-border/70 bg-card/50 px-2 py-1.5">
          <div className="rounded-md bg-primary/15 p-1 text-primary"><UserCircle2 className="h-4 w-4" /></div>
          <div className="text-left leading-tight">
            <p className="text-xs font-medium">Ops Lead</p>
            <p className="text-[11px] text-muted-foreground">Enterprise</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <Building2 className="h-5 w-5 text-muted-foreground md:hidden" />
      </div>
    </header>
  );
}
