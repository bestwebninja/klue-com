import type { Database } from '@/integrations/supabase/types';
import type { WidgetKey } from '@/types/onboarding';
import { WIDGET_REGISTRY } from '@/components/dashboard/registry/widgetRegistry';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const RoleBasedWidgets = ({ widgets, profile }: { widgets: WidgetKey[]; profile: Profile | null }) => {
  return (
    <div className="grid items-stretch gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
      {widgets.map((widgetKey) => {
        const definition = WIDGET_REGISTRY[widgetKey];
        if (!definition) return null;
        return (
          <div key={widgetKey} className="h-full">
            {definition.render({ profile })}
          </div>
        );
      })}
    </div>
  );
};
