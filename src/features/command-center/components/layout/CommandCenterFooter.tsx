import { Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommandCenterFooter({ lastSync = "Just now", connection = "online" }: { lastSync?: string; connection?: "online" | "degraded" | "offline" }) {
  const online = connection === "online";

  return (
    <footer className="border-t border-border/80 bg-card/40 px-4 py-2 md:px-6">
      <div className="mx-auto flex w-full max-w-[1700px] items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${online ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />} {connection}
          </span>
          <span>Last sync: {lastSync}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Export CSV</Button>
          <Button size="sm">Export PDF</Button>
        </div>
      </div>
    </footer>
  );
}
