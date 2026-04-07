type ProviderProfileInput = {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  company_name?: string | null;
  services_offered?: string[] | null;
  zip_code?: string | null;
  city?: string | null;
  state?: string | null;
  county?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  service_type_label?: string | null;
  service_type_key?: string | null;
  dashboard_template_key?: string | null;
};

export function buildSafeProfileSnapshot(profile: ProviderProfileInput) {
  return {
    first_name: profile.first_name ?? null,
    last_name: profile.last_name ?? null,
    full_name: profile.full_name ?? null,
    company_name: profile.company_name ?? null,
    services_offered: profile.services_offered ?? [],
    zip_code: profile.zip_code ?? null,
    city: profile.city ?? null,
    state: profile.state ?? null,
    county: profile.county ?? null,
    latitude: profile.latitude ?? null,
    longitude: profile.longitude ?? null,
    service_type_label: profile.service_type_label ?? null,
    service_type_key: profile.service_type_key ?? null,
    dashboard_template_key: profile.dashboard_template_key ?? null,
  };
}
