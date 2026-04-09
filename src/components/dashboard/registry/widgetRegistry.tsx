import type { Database } from '@/integrations/supabase/types';
import type { WidgetKey } from '@/types/onboarding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface WidgetContext {
  profile: Profile | null;
}

const ProfileSummaryWidget = ({ profile }: WidgetContext) => (
  <Card>
    <CardHeader><CardTitle>Profile Summary</CardTitle></CardHeader>
    <CardContent className="text-sm text-muted-foreground">
      <p>{profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Name pending'}</p>
      <p>{profile?.company_name || 'Company pending'} · {profile?.services_offered?.[0] || 'Service pending'}</p>
      <p>{profile?.city || 'City'}{profile?.state ? `, ${profile.state}` : ''} {profile?.zip_code || ''}</p>
    </CardContent>
  </Card>
);

const WeatherWidget = ({ profile }: WidgetContext) => (
  <Card>
    <CardHeader><CardTitle>Weather</CardTitle></CardHeader>
    <CardContent className="text-sm text-muted-foreground">Location-aware weather snapshot for {profile?.zip_code || 'your ZIP'} (cached + refreshable).</CardContent>
  </Card>
);

const AreaRiskWidget = ({ profile }: WidgetContext) => (
  <Card>
    <CardHeader><CardTitle>Area Risk</CardTitle></CardHeader>
    <CardContent className="text-sm text-muted-foreground">Crime/public safety trend summary for {profile?.zip_code || 'your market'} with cache-first fallback.</CardContent>
  </Card>
);

const NextBestActionWidget = ({ profile }: WidgetContext) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">AI Next Best Action <Badge>Scaffold</Badge></CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">
      Prioritize profile completion, local weather risk, and {profile?.services_offered?.[0] || 'service'} pipeline opportunities.
    </CardContent>
  </Card>
);

const SiteManagerWidget = () => (
  <Card>
    <CardHeader><CardTitle>Site Manager</CardTitle></CardHeader>
    <CardContent className="space-y-3 text-sm text-muted-foreground">
      <div>
        <p className="font-medium text-foreground">Site Manager Name</p>
        <p>Placeholder for main project manager assignment.</p>
      </div>
      <div>
        <p className="font-medium text-foreground">Assigned Project</p>
        <p>Placeholder for linked General Contractor project details.</p>
      </div>
      <div>
        <p className="font-medium text-foreground">Daily Notes</p>
        <p>Placeholder for day-to-day status updates and handoff notes.</p>
      </div>
      <div>
        <p className="font-medium text-foreground">Escalations / Requests</p>
        <p>Placeholder for open issues, blockers, and escalation requests.</p>
      </div>
    </CardContent>
  </Card>
);

const PlaceholderWidget = ({ title }: { title: string }) => (
  <Card>
    <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
    <CardContent className="text-sm text-muted-foreground">Widget scaffold ready. Data source wiring is intentionally deferred.</CardContent>
  </Card>
);

interface WidgetDefinition {
  key: WidgetKey;
  title: string;
  allowedRoles: Array<'general_contractor' | 'subcontractor'>;
  requiredDataSources: string[];
  refreshStrategy: 'cache_first' | 'on_demand' | 'realtime';
  priority: number;
  render: (context: WidgetContext) => JSX.Element;
}

export const WIDGET_REGISTRY: Record<WidgetKey, WidgetDefinition> = {
  profile_summary: { key: 'profile_summary', title: 'Profile Summary', allowedRoles: ['general_contractor', 'subcontractor'], requiredDataSources: ['profile'], refreshStrategy: 'on_demand', priority: 1, render: (context) => <ProfileSummaryWidget {...context} /> },
  profile_completion: { key: 'profile_completion', title: 'Profile Completion', allowedRoles: ['general_contractor', 'subcontractor'], requiredDataSources: ['profile'], refreshStrategy: 'on_demand', priority: 2, render: () => <PlaceholderWidget title="Profile Completion" /> },
  weather: { key: 'weather', title: 'Weather', allowedRoles: ['general_contractor', 'subcontractor'], requiredDataSources: ['geo_intelligence.weather'], refreshStrategy: 'cache_first', priority: 3, render: (context) => <WeatherWidget {...context} /> },
  area_risk: { key: 'area_risk', title: 'Area Risk', allowedRoles: ['general_contractor', 'subcontractor'], requiredDataSources: ['geo_intelligence.crime'], refreshStrategy: 'cache_first', priority: 4, render: (context) => <AreaRiskWidget {...context} /> },
  jobs: { key: 'jobs', title: 'Jobs', allowedRoles: ['general_contractor', 'subcontractor'], requiredDataSources: ['jobs'], refreshStrategy: 'realtime', priority: 5, render: () => <PlaceholderWidget title="Jobs" /> },
  site_manager: { key: 'site_manager', title: 'Site Manager', allowedRoles: ['subcontractor'], requiredDataSources: ['projects'], refreshStrategy: 'on_demand', priority: 6, render: () => <SiteManagerWidget /> },
  suppliers: { key: 'suppliers', title: 'Suppliers', allowedRoles: ['general_contractor', 'subcontractor'], requiredDataSources: ['suppliers', 'geo_intelligence.suppliers'], refreshStrategy: 'cache_first', priority: 7, render: () => <PlaceholderWidget title="Suppliers" /> },
  legal_logistics: { key: 'legal_logistics', title: 'Legal Logistics', allowedRoles: ['general_contractor'], requiredDataSources: ['compliance'], refreshStrategy: 'on_demand', priority: 8, render: () => <PlaceholderWidget title="Legal Logistics" /> },
  ai_next_action: { key: 'ai_next_action', title: 'AI Next Action', allowedRoles: ['general_contractor', 'subcontractor'], requiredDataSources: ['profile', 'geo_intelligence', 'jobs', 'suppliers'], refreshStrategy: 'cache_first', priority: 9, render: (context) => <NextBestActionWidget {...context} /> },
  project_alerts: { key: 'project_alerts', title: 'Project Alerts', allowedRoles: ['general_contractor', 'subcontractor'], requiredDataSources: ['projects'], refreshStrategy: 'realtime', priority: 10, render: () => <PlaceholderWidget title="Project Alerts" /> },
  compliance: { key: 'compliance', title: 'Compliance', allowedRoles: ['general_contractor', 'subcontractor'], requiredDataSources: ['compliance'], refreshStrategy: 'on_demand', priority: 11, render: () => <PlaceholderWidget title="Compliance" /> },
};
