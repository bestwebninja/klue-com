const parseLatLng = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export interface ZipIntelligencePayload {
  location: {
    zip_code: string;
    city?: string;
    state?: string;
    county?: string;
    latitude?: number;
    longitude?: number;
  };
  weather: Record<string, unknown>;
  crime: Record<string, unknown>;
}

export const fetchZipIntelligence = async (zipCode: string): Promise<ZipIntelligencePayload> => {
  const zipResponse = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
  const zipData = zipResponse.ok ? await zipResponse.json() : null;
  const place = zipData?.places?.[0];

  const latitude = parseLatLng(place?.latitude);
  const longitude = parseLatLng(place?.longitude);

  const weatherResponse = latitude && longitude
    ? await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,wind_speed_10m&timezone=auto`)
    : null;
  const weatherData = weatherResponse && weatherResponse.ok ? await weatherResponse.json() : { status: 'unavailable' };

  return {
    location: {
      zip_code: zipCode,
      city: place?.['place name'],
      state: place?.state,
      county: undefined,
      latitude,
      longitude,
    },
    weather: weatherData,
    crime: {
      status: 'integration-point',
      provider: 'public-safety-data-source',
      message: 'Attach FBI/NIBRS or municipal provider in production.',
    },
  };
};
