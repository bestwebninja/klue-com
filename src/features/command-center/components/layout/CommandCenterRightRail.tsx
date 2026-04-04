import { CloudSun, ShieldCheck, Siren, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RightRailConfig } from "../../templates/types";

const toneClasses = {
  info: "border-blue-500/30 bg-blue-500/10",
  warning: "border-amber-500/40 bg-amber-500/10",
  critical: "border-rose-500/40 bg-rose-500/10",
} as const;

export function CommandCenterRightRail({ data }: { data?: RightRailConfig }) {
  return (
    <aside className="space-y-3">
      <Card className="bg-card/70 border-border/70">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Siren className="h-4 w-4 text-primary" />Alerts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.alerts ?? []).map((alert) => (
            <div key={alert.key} className={`rounded-lg border p-2 text-sm ${toneClasses[alert.tone ?? "info"]}`}>
              <p className="font-medium">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/70">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><CloudSun className="h-4 w-4 text-primary" />Weather</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <p>{data?.weather?.condition ?? "Sunny"} · {data?.weather?.temperature ?? "74°F"}</p>
          <p className="text-xs text-muted-foreground">{data?.weather?.location ?? "Service Region"}</p>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/70">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Compliance</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Score: <span className="font-semibold">{data?.compliance?.score ?? "94"}</span></p>
          <p className="text-xs text-muted-foreground">{data?.compliance?.status ?? "All critical checks passing"}</p>
          <p className="text-xs text-muted-foreground">Next audit: {data?.compliance?.nextAudit ?? "Tue 10:00 AM"}</p>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-border/70">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Quick Actions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.quickActions ?? ["Create Work Order", "Escalate Alert", "Run All Agents"]).map((action) => (
            <Button key={action} size="sm" variant="outline" className="w-full justify-start">{action}</Button>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
