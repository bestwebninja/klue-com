import type { Database } from '@/integrations/supabase/types';
import { resolveDashboardTemplate } from './templates/dashboardTemplateRegistry';
import { RoleBasedWidgets } from './widgets/RoleBasedWidgets';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const RoleBasedDashboardHome = ({
  profile,
  isAdmin = false,
}: {
  profile: Profile | null;
  isAdmin?: boolean;
}) => {
  const template = resolveDashboardTemplate(profile);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
      <div className="space-y-1.5 px-0.5">
        <h2 className="text-2xl font-semibold tracking-tight">{template.label}</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {template.description || 'Template-driven dashboard shell with role-aware widgets, nav defaults, and permissions.'}
        </p>
      </div>
      <RoleBasedWidgets
        widgets={template.widgetKeys}
        profile={profile}
        dashboardCategory={template.userCategory}
        layout={template.defaultLayout}
        isAdmin={isAdmin}
      />
    </div>
  );
};
