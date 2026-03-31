import { supabase } from '@/integrations/supabase/client';

interface ZipResolution {
  zip_code: string;
  city?: string;
  state?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
}

const CACHE_REFRESH_HOURS = 6;

const isStale = (refreshedAt?: string | null) => {
  if (!refreshedAt) return true;
  const ageMs = Date.now() - new Date(refreshedAt).getTime();
  return ageMs > CACHE_REFRESH_HOURS * 60 * 60 * 1000;
};

export const resolveZipLocation = async (zipCode: string): Promise<ZipResolution> => {
  const { data: cached } = await supabase
    .from('zip_code_intelligence_cache')
    .select('zip_code, city, state, county, latitude, longitude')
    .eq('zip_code', zipCode)
    .maybeSingle();

  if (cached) {
    return {
      zip_code: cached.zip_code,
      city: cached.city ?? undefined,
      state: cached.state ?? undefined,
      county: cached.county ?? undefined,
      latitude: cached.latitude ? Number(cached.latitude) : undefined,
      longitude: cached.longitude ? Number(cached.longitude) : undefined,
    };
  }

  const response = await fetch(`/api/v1/onboarding/zip-intelligence/${zipCode}`);
  if (!response.ok) return { zip_code: zipCode };
  const payload = await response.json();
  return payload?.location ?? { zip_code: zipCode };
};

export const syncZipIntelligence = async (zipCode: string) => {
  const { data: cached } = await supabase
    .from('zip_code_intelligence_cache')
    .select('*')
    .eq('zip_code', zipCode)
    .maybeSingle();

  if (cached && !isStale(cached.refreshed_at)) {
    return cached;
  }

  const response = await fetch(`/api/v1/internal/geo-intelligence/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zipCode }),
  });

  if (!response.ok) {
    const fallback = await fetch(`/api/v1/onboarding/zip-intelligence/${zipCode}`, { method: 'POST' });
    if (!fallback.ok) return cached;
    const payload = await fallback.json();
    return payload?.cache ?? cached;
  }

  return cached;
};
