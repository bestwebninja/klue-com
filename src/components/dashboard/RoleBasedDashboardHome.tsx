import type { Database } from '@/integrations/supabase/types';
import { resolveDashboardTemplate } from './templates/dashboardTemplateRegistry';
import { RoleBasedWidgets } from './widgets/RoleBasedWidgets';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const RoleBasedDashboardHome = ({ profile }: { profile: Profile | null }) => {
  const template = resolveDashboardTemplate(profile);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold leading-tight">{template.label}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{template.description || 'Template-driven dashboard shell with role-aware widgets, nav defaults, and permissions.'}</p>
      </div>
      <RoleBasedWidgets widgets={template.widgetKeys} profile={profile} />
    </div>
  );
};
