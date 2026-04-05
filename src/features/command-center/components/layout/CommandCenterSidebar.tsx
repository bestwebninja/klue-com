import { BarChart3, CalendarDays, Cpu, Home, Link2, PanelLeftClose, Settings, ShieldAlert } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { NavItemConfig } from "../../templates/types";

const fallbackItems: NavItemConfig[] = [
  { key: "today", label: "Today", section: "operations" },
  { key: "pipeline", label: "Pipeline", section: "operations" },
  { key: "analytics", label: "Analytics", section: "operations" },
  { key: "ai-agents", label: "AI Agents", section: "operations" },
  { key: "compliance", label: "Compliance", section: "systems" },
  { key: "integrations", label: "Integrations", section: "systems" },
  { key: "settings", label: "Settings", section: "systems" },
];

const iconMap: Record<string, typeof CalendarDays> = {
  home: Home,
  today: CalendarDays,
  pipeline: PanelLeftClose,
  analytics: BarChart3,
  "ai-agents": Cpu,
  compliance: ShieldAlert,
  integrations: Link2,
  settings: Settings,
};

export function CommandCenterSidebar({ basePath, items }: { basePath: string; items?: NavItemConfig[] }) {
  const location = useLocation();
  const providedItems = items?.length ? items : fallbackItems;
  const navItems = providedItems;

  const grouped = {
    operations: navItems.filter((item) => (item.section ?? "operations") === "operations"),
    systems: navItems.filter((item) => (item.section ?? "operations") === "systems"),
  };

  const renderGroup = (title: string, groupItems: NavItemConfig[]) => (
    <div className="space-y-1.5">
      <p className="px-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      {groupItems.map((item) => {
        const Icon = item.icon ?? iconMap[item.key] ?? CalendarDays;
        const activeSection = new URLSearchParams(location.search).get("section") ?? "today";
        const active = activeSection === item.key;
        return (
          <Link
            key={item.key}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition ${active ? "border-primary/50 bg-primary/15 text-primary" : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40 hover:text-foreground"}`}
            to={`${basePath}?section=${item.key}`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="border-r border-border/70 bg-card/30 p-4">
      <nav className="space-y-4 sticky top-4">
        {renderGroup("Operations", grouped.operations)}
        <div className="h-px bg-border/60" />
        {renderGroup("Systems", grouped.systems)}
      </nav>
    </aside>
  );
}
