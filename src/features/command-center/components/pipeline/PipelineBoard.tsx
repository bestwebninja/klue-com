import type { PipelineItem } from "../../types";
export function PipelineBoard({ items }: { items: PipelineItem[] }) { return <div className="grid md:grid-cols-3 gap-3">{items.map((item) => <div className="border rounded p-3" key={item.id}><p className="font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.stage}</p></div>)}</div>; }
