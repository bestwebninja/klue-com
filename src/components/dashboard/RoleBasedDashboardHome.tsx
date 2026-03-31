import type { Database } from '@/integrations/supabase/types';
import { resolveDashboardTemplate } from './templates/dashboardTemplateRegistry';
import { RoleBasedWidgets } from './widgets/RoleBasedWidgets';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const RoleBasedDashboardHome = ({ profile }: { profile: Profile | null }) => {
  const template = resolveDashboardTemplate(profile, null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{template.label}</h2>
        <p className="text-sm text-muted-foreground">Template-driven dashboard shell with role-aware widgets, nav defaults, and permissions.</p>
      </div>
      <RoleBasedWidgets widgets={template.widgets} profile={profile} />
    </div>
  );
};
