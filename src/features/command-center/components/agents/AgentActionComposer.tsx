import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AgentActionComposer() { return <div className="space-y-2"><Textarea placeholder="Compose an agent action payload" /><Button size="sm">Run agent</Button></div>; }
