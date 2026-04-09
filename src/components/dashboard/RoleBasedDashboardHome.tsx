import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2 } from 'lucide-react';
import { resolveDashboardTemplate } from './templates/dashboardTemplateRegistry';
import { RoleBasedWidgets } from './widgets/RoleBasedWidgets';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const RoleBasedDashboardHome = ({ profile }: { profile: Profile | null }) => {
  const template = resolveDashboardTemplate(profile);
  const isSubcontractorTemplate = template.userCategory === 'subcontractor';

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{template.label}</h2>
        <p className="text-sm text-muted-foreground">{template.description || 'Template-driven dashboard shell with role-aware widgets, nav defaults, and permissions.'}</p>
      </div>

      {isSubcontractorTemplate && (
        <Card className="border-border/70 shadow-none">
          <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-4 w-4" aria-hidden="true" />
                Site Manager Connection
              </CardTitle>
              <p id="site-manager-connection-note" className="text-sm leading-relaxed text-muted-foreground">
                Future link to the General Contractor Dashboard where the Main Project Manager can enter site manager details and handoff notes.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              disabled
              aria-describedby="site-manager-connection-note"
            >
              Coming Soon
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Assumption: this dashboard should remain read-only until the cross-dashboard intake flow is finalized.
            </p>
          </CardContent>
        </Card>
      )}

      <RoleBasedWidgets widgets={template.widgetKeys} profile={profile} />
    </div>
  );
};
