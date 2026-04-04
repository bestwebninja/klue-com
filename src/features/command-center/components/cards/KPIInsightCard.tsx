import { Activity, Clock3, DollarSign, Sparkles, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KPIConfig } from "../../templates/types";

const iconMap = {
  trending: TrendingUp,
  dollar: DollarSign,
  clock: Clock3,
  users: Users,
} as const;

function Sparkline({ points = [] }: { points?: number[] }) {
  if (!points.length) return <div className="h-10 rounded-md bg-muted/40" />;
  const width = 120;
  const height = 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const path = points
    .map((point, idx) => {
      const x = (idx / (points.length - 1 || 1)) * width;
      const y = height - ((point - min) / span) * height;
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full">
      <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function KPIInsightCard({ label, value, delta, icon, trend }: Pick<KPIConfig, "label" | "value" | "delta" | "icon" | "trend">) {
  const Icon = (icon && iconMap[icon]) || Activity;
  const negative = Boolean(delta?.trim().startsWith("-"));

  return (
    <Card className="border-primary/15 bg-card/80 backdrop-blur-sm shadow-lg shadow-black/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
          <span className="rounded-md bg-primary/15 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-end justify-between gap-2">
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          {delta ? (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${negative ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}>
              <Sparkles className="h-3 w-3" /> {delta}
            </span>
          ) : null}
        </div>
        <Sparkline points={trend} />
      </CardContent>
    </Card>
  );
}
