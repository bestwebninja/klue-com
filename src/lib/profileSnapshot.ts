type ProviderProfileSnapshotInput = {
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
  lat?: number | null;
  lng?: number | null;
  service_type_label?: string | null;
  service_type_key?: string | null;
  dashboard_template_key?: string | null;
};

const PROFILE_SNAPSHOT_KEYS: (keyof ProviderProfileSnapshotInput)[] = [
  'first_name',
  'last_name',
  'full_name',
  'company_name',
  'services_offered',
  'zip_code',
  'city',
  'state',
  'county',
  'latitude',
  'longitude',
  'lat',
  'lng',
  'service_type_label',
  'service_type_key',
  'dashboard_template_key',
];

export const buildSafeProfileSnapshot = (
  profile: ProviderProfileSnapshotInput,
): ProviderProfileSnapshotInput =>
  PROFILE_SNAPSHOT_KEYS.reduce<ProviderProfileSnapshotInput>((snapshot, key) => {
    const value = profile[key];
    if (value !== undefined) {
      snapshot[key] = value;
    }
    return snapshot;
  }, {});
