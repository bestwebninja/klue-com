import type { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WidgetKey } from '../templates/dashboardTemplateRegistry';

type Profile = Database['public']['Tables']['profiles']['Row'];

const widgetTitles: Record<WidgetKey, string> = {
  'profile-summary': 'Profile Summary',
  'jobs-leads': 'Jobs & Leads',
  compliance: 'Compliance',
  weather: 'Weather',
  'crime-risk': 'Crime / Area Risk',
  suppliers: 'Suppliers',
  'legal-logistics': 'Legal / Logistics',
  'ai-recommendations': 'Next Best Action',
};

export const RoleBasedWidgets = ({ widgets, profile }: { widgets: WidgetKey[]; profile: Profile | null }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {widgets.map((widget) => (
        <Card key={widget}>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              {widgetTitles[widget]}
              {widget === 'ai-recommendations' ? <Badge>AI-first</Badge> : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            {widget === 'profile-summary' && <p>{profile?.first_name || profile?.full_name || 'Complete profile'} · {profile?.company_name || 'Company pending'}</p>}
            {widget === 'weather' && <p>Weather intelligence is hydrated from zip cache and refreshed on interval.</p>}
            {widget === 'crime-risk' && <p>Public-safety snapshot is normalized by zip for risk-aware planning.</p>}
            {widget === 'ai-recommendations' && <p>Recommendations combine service type, location, profile completeness, assignments, suppliers, and risk.</p>}
            {!['profile-summary', 'weather', 'crime-risk', 'ai-recommendations'].includes(widget) && <p>Composable module attached through template registry.</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
