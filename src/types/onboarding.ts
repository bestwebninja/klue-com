export type WidgetKey =
  | 'profile_summary'
  | 'profile_completion'
  | 'weather'
  | 'area_risk'
  | 'jobs'
  | 'suppliers'
  | 'legal_logistics'
  | 'ai_next_action'
  | 'project_alerts'
  | 'compliance';

export interface Profile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  service_type_key: string | null;
  service_type_label: string | null;
  zip_code: string | null;
  city: string | null;
  state: string | null;
  county: string | null;
  country_code: string;
  lat: number | null;
  lng: number | null;
  coverage_radius_miles: number;
  profile_completion_pct: number;
  onboarding_status: string;
  dashboard_template_key: string | null;
  dashboard_version: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  owner_user_id: string;
  company_name: string;
  legal_name: string | null;
  website_url: string | null;
  phone: string | null;
  email: string | null;
  service_type_key: string | null;
  primary_zip_code: string | null;
  city: string | null;
  state: string | null;
  county: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceType {
  key: string;
  label: string;
  dashboard_template_key: string;
  is_active: boolean;
  sort_order: number;
}

export interface DashboardTemplateConfig {
  key: string;
  label: string;
  userCategory: string;
  description?: string;
  version: number;
  navItems: Array<{ key: string; label: string }>;
  widgetKeys: WidgetKey[];
  defaultLayout: Record<string, { colSpan?: number; rowSpan?: number }>;
  featureFlags?: string[];
}

export interface UserDashboardPreferences {
  user_id: string;
  template_key: string;
  hidden_widget_keys: string[];
  pinned_widget_keys: string[];
  widget_layout_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ZipCodeResult {
  zipCode: string;
  city?: string;
  state?: string;
  county?: string;
  lat?: number;
  lng?: number;
}

export interface GeoIntelligence {
  zip_code: string;
  weather_summary_json: Record<string, unknown>;
  forecast_summary_json: Record<string, unknown>;
  crime_summary_json: Record<string, unknown>;
  logistics_summary_json: Record<string, unknown>;
  supplier_summary_json: Record<string, unknown>;
  weather_refreshed_at?: string;
  crime_refreshed_at?: string;
  updated_at: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  serviceType: string;
  zipCode: string;
}

export interface SignupResponse {
  userId: string;
  dashboardTemplateKey: string;
  location: {
    zipCode: string;
    city?: string;
    state?: string;
    county?: string;
    lat?: number;
    lng?: number;
  };
}

export interface ProfileBootstrapResponse {
  profile: Profile | null;
  template: DashboardTemplateConfig | null;
  preferences: UserDashboardPreferences | null;
  geoIntelligence: GeoIntelligence | null;
}

export interface DashboardConfigResponse {
  template: DashboardTemplateConfig | null;
  preferences: UserDashboardPreferences | null;
}
