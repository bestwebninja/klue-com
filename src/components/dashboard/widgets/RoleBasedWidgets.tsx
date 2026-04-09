import type { Database } from '@/integrations/supabase/types';
import type { WidgetKey } from '@/types/onboarding';
import { WIDGET_REGISTRY } from '@/components/dashboard/registry/widgetRegistry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Profile = Database['public']['Tables']['profiles']['Row'];

const SiteManagerConnectionCard = () => (
  <Card className="h-full">
    <CardHeader className="space-y-2 p-5 pb-2">
      <div className="flex flex-wrap items-center gap-2">
        <CardTitle className="text-base">Site Manager</CardTitle>
        <Badge variant="secondary">Future GC Sync</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Future connection point to the General Contractor Dashboard so the Main Project Manager can input details.
      </p>
    </CardHeader>
    <CardContent className="space-y-3 p-5 pt-2 text-sm">
      <div className="rounded-md border bg-muted/20 p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Site Manager Name</p>
        <p className="mt-1 font-medium text-foreground">Pending assignment</p>
      </div>
      <div className="rounded-md border bg-muted/20 p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Assigned Project</p>
        <p className="mt-1 font-medium text-foreground">Pending assignment</p>
      </div>
      <div className="rounded-md border bg-muted/20 p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Daily Notes</p>
        <p className="mt-1 text-muted-foreground">Awaiting project updates from Main Project Manager.</p>
      </div>
      <div className="rounded-md border bg-muted/20 p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Escalations / Requests</p>
        <p className="mt-1 text-muted-foreground">No escalations submitted.</p>
      </div>
    </CardContent>
  </Card>
);

export const RoleBasedWidgets = ({ widgets, profile }: { widgets: WidgetKey[]; profile: Profile | null }) => {
  const isSubcontractorDashboard = (profile as any)?.dashboard_template_key === 'subcontractor-default';

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
      {widgets.map((widgetKey) => {
        const definition = WIDGET_REGISTRY[widgetKey];
        if (!definition) return null;
        return (
          <div key={widgetKey} className="h-full [&>*]:h-full">
            {definition.render({ profile })}
          </div>
        );
      })}
      {isSubcontractorDashboard && (
        <div className="h-full md:col-span-2 xl:col-span-1">
          <SiteManagerConnectionCard />
        </div>
      )}
    </div>
  );
};
