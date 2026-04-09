import type { Database } from '@/integrations/supabase/types';
import type { DashboardTemplateConfig, WidgetKey } from '@/types/onboarding';

type Profile = Database['public']['Tables']['profiles']['Row'];

const baseLayout = {
  profile_summary: { colSpan: 1 },
  weather: { colSpan: 1 },
  area_risk: { colSpan: 1 },
  ai_next_action: { colSpan: 2 },
};

const createTemplate = (config: DashboardTemplateConfig): DashboardTemplateConfig => config;

export const DASHBOARD_TEMPLATE_REGISTRY: Record<string, DashboardTemplateConfig> = {
  'general-contractor': createTemplate({
    key: 'general-contractor',
    label: 'General Contractor / Master Dashboard',
    userCategory: 'general_contractor',
    description: 'Advanced contractor operating system with multi-team controls.',
    version: 1,
    navItems: [
      { key: 'home', label: 'Home' },
      { key: 'projects', label: 'Projects' },
      { key: 'vendors', label: 'Vendors' },
      { key: 'compliance', label: 'Compliance' },
      { key: 'risk', label: 'Risk' },
      { key: 'ai', label: 'AI Ops' },
    ],
    widgetKeys: ['profile_summary', 'profile_completion', 'weather', 'area_risk', 'jobs', 'suppliers', 'legal_logistics', 'ai_next_action', 'project_alerts', 'compliance'],
    defaultLayout: baseLayout,
    featureFlags: ['advanced_ops', 'supplier_intelligence'],
  }),
  hvac: createTemplate({
    key: 'hvac', label: 'HVAC Dashboard', userCategory: 'subcontractor', description: 'Dispatch and weather-aware job flow.', version: 1,
    navItems: [{ key: 'home', label: 'Home' }, { key: 'jobs', label: 'Jobs' }, { key: 'dispatch', label: 'Dispatch' }, { key: 'ai', label: 'AI' }],
    widgetKeys: ['profile_summary', 'weather', 'area_risk', 'jobs', 'ai_next_action'],
    defaultLayout: baseLayout,
  }),
  plumbing: createTemplate({ key: 'plumbing', label: 'Plumbing Dashboard', userCategory: 'subcontractor', version: 1, navItems: [{ key: 'home', label: 'Home' }, { key: 'jobs', label: 'Jobs' }, { key: 'inventory', label: 'Inventory' }, { key: 'ai', label: 'AI' }], widgetKeys: ['profile_summary', 'weather', 'area_risk', 'jobs', 'ai_next_action'], defaultLayout: baseLayout }),
  electrical: createTemplate({ key: 'electrical', label: 'Electrical Dashboard', userCategory: 'subcontractor', version: 1, navItems: [{ key: 'home', label: 'Home' }, { key: 'jobs', label: 'Jobs' }, { key: 'safety', label: 'Safety' }, { key: 'ai', label: 'AI' }], widgetKeys: ['profile_summary', 'weather', 'area_risk', 'jobs', 'compliance', 'ai_next_action'], defaultLayout: baseLayout }),
  roofing: createTemplate({ key: 'roofing', label: 'Roofing Dashboard', userCategory: 'subcontractor', version: 1, navItems: [{ key: 'home', label: 'Home' }, { key: 'jobs', label: 'Jobs' }, { key: 'claims', label: 'Claims' }, { key: 'ai', label: 'AI' }], widgetKeys: ['profile_summary', 'weather', 'area_risk', 'jobs', 'project_alerts', 'ai_next_action'], defaultLayout: baseLayout }),
  painting: createTemplate({ key: 'painting', label: 'Painting Dashboard', userCategory: 'subcontractor', version: 1, navItems: [{ key: 'home', label: 'Home' }, { key: 'jobs', label: 'Jobs' }, { key: 'schedule', label: 'Schedule' }, { key: 'ai', label: 'AI' }], widgetKeys: ['profile_summary', 'weather', 'area_risk', 'jobs', 'ai_next_action'], defaultLayout: baseLayout }),
  carpentry: createTemplate({ key: 'carpentry', label: 'Carpentry Dashboard', userCategory: 'subcontractor', version: 1, navItems: [{ key: 'home', label: 'Home' }, { key: 'jobs', label: 'Jobs' }, { key: 'materials', label: 'Materials' }, { key: 'ai', label: 'AI' }], widgetKeys: ['profile_summary', 'weather', 'jobs', 'suppliers', 'ai_next_action'], defaultLayout: baseLayout }),
  'subcontractor-default': createTemplate({ key: 'subcontractor-default', label: 'Subcontractor Dashboard', userCategory: 'subcontractor', version: 1, navItems: [{ key: 'home', label: 'Home' }, { key: 'jobs', label: 'Jobs' }, { key: 'messages', label: 'Messages' }, { key: 'ai', label: 'AI' }], widgetKeys: ['profile_summary', 'weather', 'area_risk', 'jobs', 'site_manager', 'ai_next_action'], defaultLayout: baseLayout }),
};

export const resolveDashboardTemplate = (profile: Profile | null): DashboardTemplateConfig => {
  if (!profile) return DASHBOARD_TEMPLATE_REGISTRY['subcontractor-default'];

  const explicitTemplate = (profile as any).dashboard_template_key && DASHBOARD_TEMPLATE_REGISTRY[(profile as any).dashboard_template_key];
  if (explicitTemplate) return explicitTemplate;

  const normalizedServices = (profile.services_offered ?? []).map((s) => s.toLowerCase());
  const firstService = normalizedServices[0] ?? '';

  if (firstService.includes('general contractor')) return DASHBOARD_TEMPLATE_REGISTRY['general-contractor'];
  if (firstService.includes('hvac')) return DASHBOARD_TEMPLATE_REGISTRY.hvac;
  if (firstService.includes('plumb')) return DASHBOARD_TEMPLATE_REGISTRY.plumbing;
  if (firstService.includes('electr')) return DASHBOARD_TEMPLATE_REGISTRY.electrical;
  if (firstService.includes('roof')) return DASHBOARD_TEMPLATE_REGISTRY.roofing;
  if (firstService.includes('paint')) return DASHBOARD_TEMPLATE_REGISTRY.painting;
  if (firstService.includes('carpent')) return DASHBOARD_TEMPLATE_REGISTRY.carpentry;

  return DASHBOARD_TEMPLATE_REGISTRY['subcontractor-default'];
};

export type { WidgetKey };
