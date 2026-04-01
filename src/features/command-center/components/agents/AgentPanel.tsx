import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AgentPanel({ name, description }: { name: string; description: string }) {
  return <Card><CardHeader><CardTitle>{name}</CardTitle></CardHeader><CardContent className="text-sm">{description}</CardContent></Card>;
}
