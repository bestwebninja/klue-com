import type { Database } from '@/integrations/supabase/types';
import type { WidgetKey } from '@/types/onboarding';
import { WIDGET_REGISTRY } from '@/components/dashboard/registry/widgetRegistry';
import { cn } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface WidgetLayoutConfig {
  colSpan?: number;
  rowSpan?: number;
}

export const RoleBasedWidgets = ({
  widgets,
  profile,
  layout,
}: {
  widgets: WidgetKey[];
  profile: Profile | null;
  layout?: Partial<Record<WidgetKey, WidgetLayoutConfig>>;
}) => {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2 md:auto-rows-fr xl:grid-cols-3">
      {widgets.map((widgetKey) => {
        const definition = WIDGET_REGISTRY[widgetKey];
        if (!definition) return null;
        const widgetLayout = layout?.[widgetKey];

        return (
          <div
            key={widgetKey}
            className={cn(
              'h-full',
              widgetLayout?.colSpan === 2 && 'md:col-span-2',
              widgetLayout?.colSpan === 3 && 'md:col-span-2 xl:col-span-3',
              widgetLayout?.rowSpan === 2 && 'md:row-span-2',
            )}
          >
            {definition.render({ profile })}
          </div>
        );
      })}
    </div>
  );
};
