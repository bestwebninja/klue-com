import { GripVertical } from "lucide-react";
import type { PipelineCardConfig } from "../../templates/types";

const stages: PipelineCardConfig["stage"][] = ["New", "Dispatch", "In Progress", "Complete"];

const priorityClasses = {
  low: "bg-blue-500/15 text-blue-200",
  medium: "bg-amber-500/15 text-amber-200",
  high: "bg-rose-500/15 text-rose-200",
} as const;

export function PipelineBoard({ items }: { items: PipelineCardConfig[] }) {
  return (
    <section className="rounded-xl border border-border/70 bg-card/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pipeline Board</h3>
        <p className="text-xs text-muted-foreground">Drag-and-drop ready</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-4 md:grid-cols-2">
        {stages.map((stage) => {
          const stageItems = items.filter((item) => item.stage === stage);
          return (
            <div key={stage} className="rounded-lg border border-border/70 bg-background/40 p-3 space-y-2 min-h-[220px]">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h4 className="text-sm font-semibold">{stage}</h4>
                <span className="rounded-full bg-muted px-2 text-xs">{stageItems.length}</span>
              </div>
              {stageItems.map((item) => (
                <article key={item.id} className="rounded-lg border border-border/70 bg-card p-3 space-y-2 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-5">{item.label}</p>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.owner || "Unassigned"}</span>
                    <span>{item.eta || "TBD"}</span>
                  </div>
                  {item.priority ? <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] capitalize ${priorityClasses[item.priority]}`}>{item.priority}</span> : null}
                </article>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
