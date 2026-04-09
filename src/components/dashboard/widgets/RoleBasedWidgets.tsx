import type { Database } from '@/integrations/supabase/types';
import type { WidgetKey } from '@/types/onboarding';
import { WIDGET_REGISTRY } from '@/components/dashboard/registry/widgetRegistry';

type Profile = Database['public']['Tables']['profiles']['Row'];
type DashboardRole = 'general_contractor' | 'subcontractor';

interface WidgetLayoutConfig {
  colSpan?: number;
  rowSpan?: number;
}

const getColSpanClasses = (colSpan?: number) => {
  if (colSpan === 2) return 'md:col-span-2';
  if (colSpan && colSpan >= 3) return 'md:col-span-2 xl:col-span-3';
  return '';
};

const getRowSpanClasses = (rowSpan?: number) => {
  if (rowSpan === 2) return 'md:row-span-2';
  if (rowSpan && rowSpan >= 3) return 'md:row-span-3';
  return '';
};

export const RoleBasedWidgets = ({
  widgets,
  profile,
  dashboardCategory,
  layout,
  isAdmin = false,
}: {
  widgets: WidgetKey[];
  profile: Profile | null;
  dashboardCategory: DashboardRole;
  layout?: Record<string, WidgetLayoutConfig>;
  isAdmin?: boolean;
}) => {
  const visibleWidgets = widgets.filter((widgetKey) => {
    const definition = WIDGET_REGISTRY[widgetKey];
    if (!definition) return false;
    if (isAdmin) return true;
    return definition.allowedRoles.includes(dashboardCategory);
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:auto-rows-fr md:gap-6 md:grid-cols-2 xl:grid-cols-3">
      {visibleWidgets.map((widgetKey) => {
        const definition = WIDGET_REGISTRY[widgetKey];
        if (!definition) return null;
        const widgetLayout = layout?.[widgetKey];
        const colSpanClassName = getColSpanClasses(widgetLayout?.colSpan);
        const rowSpanClassName = getRowSpanClasses(widgetLayout?.rowSpan);

        return (
          <div key={widgetKey} className={`h-full min-w-0 ${colSpanClassName} ${rowSpanClassName}`.trim()}>
            {definition.render({ profile })}
          </div>
        );
      })}
      {visibleWidgets.length === 0 ? (
        <div className="md:col-span-2 xl:col-span-3 rounded-lg border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
          No widgets are available for this dashboard yet.
        </div>
      ) : null}
    </div>
  );
};
