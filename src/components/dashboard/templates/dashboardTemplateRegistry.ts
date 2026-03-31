import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export type WidgetKey =
  | 'profile-summary'
  | 'jobs-leads'
  | 'compliance'
  | 'weather'
  | 'crime-risk'
  | 'suppliers'
  | 'legal-logistics'
  | 'ai-recommendations';

export interface DashboardTemplate {
  key: string;
  label: string;
  nav: string[];
  widgets: WidgetKey[];
  permissions: string[];
}

const sharedWidgets: WidgetKey[] = ['profile-summary', 'jobs-leads', 'weather', 'crime-risk', 'ai-recommendations'];

export const DASHBOARD_TEMPLATE_REGISTRY: Record<string, DashboardTemplate> = {
  'general-contractor': {
    key: 'general-contractor',
    label: 'General Contractor / Master Admin',
    nav: ['home', 'projects', 'vendors', 'compliance', 'finance', 'ai'],
    widgets: [...sharedWidgets, 'compliance', 'suppliers', 'legal-logistics'],
    permissions: ['ops:full', 'vendors:manage', 'risk:full'],
  },
  hvac: { key: 'hvac', label: 'HVAC', nav: ['home', 'jobs', 'dispatch', 'weather', 'ai'], widgets: sharedWidgets, permissions: ['jobs:trade', 'risk:read'] },
  electrical: { key: 'electrical', label: 'Electrical', nav: ['home', 'jobs', 'permits', 'safety', 'ai'], widgets: sharedWidgets, permissions: ['jobs:trade', 'risk:read'] },
  plumbing: { key: 'plumbing', label: 'Plumbing', nav: ['home', 'jobs', 'inventory', 'service-area', 'ai'], widgets: sharedWidgets, permissions: ['jobs:trade', 'risk:read'] },
  roofing: { key: 'roofing', label: 'Roofing', nav: ['home', 'jobs', 'weather', 'claims', 'ai'], widgets: sharedWidgets, permissions: ['jobs:trade', 'risk:read'] },
  painting: { key: 'painting', label: 'Painting', nav: ['home', 'jobs', 'scheduling', 'supplies', 'ai'], widgets: sharedWidgets, permissions: ['jobs:trade', 'risk:read'] },
  carpentry: { key: 'carpentry', label: 'Carpentry', nav: ['home', 'jobs', 'materials', 'quality', 'ai'], widgets: sharedWidgets, permissions: ['jobs:trade', 'risk:read'] },
  subcontractor: { key: 'subcontractor', label: 'Sub Contractor', nav: ['home', 'jobs', 'messages', 'ai'], widgets: sharedWidgets, permissions: ['jobs:limited', 'risk:read'] },
  default: { key: 'default', label: 'Trade Dashboard', nav: ['home', 'jobs', 'messages', 'ai'], widgets: sharedWidgets, permissions: ['jobs:limited', 'risk:read'] },
};

export const resolveDashboardTemplate = (profile: Profile | null, contractorType?: string | null) => {
  if (!profile) return DASHBOARD_TEMPLATE_REGISTRY.default;

  const normalizedServices = (profile.services_offered ?? []).map((s) => s.toLowerCase());
  if (contractorType === 'general' || normalizedServices.some((service) => service.includes('general contractor'))) {
    return DASHBOARD_TEMPLATE_REGISTRY['general-contractor'];
  }

  const found = Object.keys(DASHBOARD_TEMPLATE_REGISTRY).find((key) =>
    key !== 'default' && key !== 'general-contractor' && normalizedServices.some((service) => service.includes(key)),
  );

  return found ? DASHBOARD_TEMPLATE_REGISTRY[found] : DASHBOARD_TEMPLATE_REGISTRY.subcontractor;
};
