import { Bot, PlayCircle, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentConfig } from "../../templates/types";

export function AgentPanel({ agents }: { agents: AgentConfig[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Agents</h3>
        <p className="text-xs text-muted-foreground">Operational controls</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {agents.map((agent) => (
          <Card key={agent.key} className="border-border/70 bg-card/70">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4 text-primary" />{agent.label}</CardTitle>
                <span className={`text-xs rounded-full px-2 py-0.5 ${agent.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/25 text-slate-300"}`}>{agent.status ?? "idle"}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{agent.description}</p>
              <div className="flex gap-2">
                <Button size="sm" className="gap-1"><PlayCircle className="h-4 w-4" />Run</Button>
                <Button size="sm" variant="outline" className="gap-1"><Settings2 className="h-4 w-4" />Configure</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
