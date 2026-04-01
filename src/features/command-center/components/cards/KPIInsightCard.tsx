import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KPIInsightCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return <Card><CardHeader><CardTitle className="text-sm">{label}</CardTitle></CardHeader><CardContent><div className="text-2xl font-semibold">{value}</div>{delta ? <p className="text-xs text-muted-foreground">{delta}</p> : null}</CardContent></Card>;
}
