import { RoleBasedDashboardHome } from "@/components/dashboard/RoleBasedDashboardHome";

export function MyDashboardView() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Dashboard</h1>
        <p className="text-sm text-muted-foreground">Home view for Command Center workspaces.</p>
      </div>
      <RoleBasedDashboardHome profile={null} />
    </div>
  );
}
