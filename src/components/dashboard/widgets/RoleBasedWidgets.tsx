import type { Database } from '@/integrations/supabase/types';
import type { WidgetKey } from '@/types/onboarding';
import { WIDGET_REGISTRY } from '@/components/dashboard/registry/widgetRegistry';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface RoleBasedWidgetsProps {
  widgets: WidgetKey[];
  layout?: Record<string, { colSpan?: number; rowSpan?: number }>;
  profile: Profile | null;
}

const getSpanClasses = (colSpan?: number, rowSpan?: number) => {
  const classes: string[] = [];
  if (colSpan === 2) classes.push('md:col-span-2');
  if (colSpan === 3) classes.push('xl:col-span-3');
  if (rowSpan === 2) classes.push('md:row-span-2');
  return classes.join(' ');
};

export const RoleBasedWidgets = ({ widgets, layout, profile }: RoleBasedWidgetsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {widgets.map((widgetKey) => {
        const definition = WIDGET_REGISTRY[widgetKey];
        if (!definition) return null;
        const widgetLayout = layout?.[widgetKey];
        return (
          <div key={widgetKey} className={getSpanClasses(widgetLayout?.colSpan, widgetLayout?.rowSpan)}>
            {definition.render({ profile })}
          </div>
        );
      })}
    </div>
  );
};
