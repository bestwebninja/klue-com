/**
 * useWeather — fetches real weather data for a US ZIP code.
 *
 * API chain (all free, no key required):
 *   1. api.zippopotam.us/us/{zip}          → lat/lon, city, state
 *   2. api.weather.gov/points/{lat},{lon}  → NWS grid + station/forecast URLs
 *   3. (parallel) forecast URL             → 7-day period forecast
 *   3. (parallel) observationStations URL  → nearest ASOS/AWOS station ID
 *   4. stations/{id}/observations/latest  → current temp, wind, humidity, precip
 *
 * Results cached in-memory for 30 minutes per ZIP.
 */

import { useState, useEffect, useRef } from 'react';

// ─── Public interfaces ───────────────────────────────────────────────────────

export interface CurrentWeather {
  tempF: number;
  feelsLikeF: number;
  condition: string;
  conditionCode: number;
  windMph: number;
  windDir: string;
  humidity: number;
  uvIndex: number;
  precipMm: number;
  visibility: number;
  cloudCover: number;
}

export interface ForecastDay {
  date: string;
  maxTempF: number;
  minTempF: number;
  precipMm: number;
  condition: string;
  windMph: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

export interface ConstructionRiskFlags {
  /** Wind > 25 mph — scaffolding/roofing risk */
  highWind: boolean;
  /** Precip expected — concrete pour / drywall risk */
  rain: boolean;
  /** Temp < 40°F — concrete cure / paint risk */
  coldSnap: boolean;
  /** Temp > 95°F — worker heat stress / adhesive risk */
  extreme_heat: boolean;
  /** UV > 8 — worker sun exposure risk */
  highUv: boolean;
  level: 'low' | 'moderate' | 'high';
  summary: string;
}

export interface WeatherData {
  zip: string;
  city: string;
  state: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
  riskFlags: ConstructionRiskFlags;
  fetchedAt: number;
}

export interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Cache ───────────────────────────────────────────────────────────────────

const CACHE: Record<string, WeatherData> = {};
const CACHE_TTL_MS = 30 * 60 * 1000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const cToF = (c: number | null | undefined): number =>
  c != null ? Math.round(c * 9 / 5 + 32) : 70;

const msToMph = (ms: number | null | undefined): number =>
  ms != null ? Math.round(ms * 2.23694) : 0;

function degreesToDir(deg: number | null | undefined): string {
  if (deg == null) return 'N';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round((deg % 360) / 22.5) % 16];
}

/** Parse "10 mph" or "10 to 20 mph" → average integer */
function parseWindSpeed(str: string): number {
  const nums = (str.match(/\d+/g) ?? ['0']).map(Number);
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

/** Estimate cloud cover % from short forecast text */
function estimateCloudCover(text: string): number {
  const t = text.toLowerCase();
  if (t.includes('overcast') || t.includes('cloudy') && t.includes('mostly')) return 85;
  if (t.includes('cloudy')) return 70;
  if (t.includes('partly')) return 40;
  if (t.includes('mostly sunny') || t.includes('mostly clear')) return 20;
  if (t.includes('sunny') || t.includes('clear')) return 5;
  if (t.includes('rain') || t.includes('storm') || t.includes('snow')) return 90;
  return 50;
}

/** Rough daytime UV estimate from forecast text (NWS doesn't expose UV in public forecast) */
function estimateUV(text: string, isDaytime: boolean): number {
  if (!isDaytime) return 0;
  const t = text.toLowerCase();
  if (t.includes('sunny') && !t.includes('mostly') && !t.includes('partly')) return 7;
  if (t.includes('mostly sunny') || t.includes('mostly clear')) return 5;
  if (t.includes('partly') || t.includes('mix')) return 4;
  if (t.includes('mostly cloudy')) return 2;
  if (t.includes('cloudy') || t.includes('overcast')) return 1;
  if (t.includes('rain') || t.includes('thunder') || t.includes('snow')) return 1;
  return 3;
}

function buildRiskFlags(
  current: CurrentWeather,
  forecast: ForecastDay[]
): ConstructionRiskFlags {
  const next2 = forecast.slice(0, 2);
  const highWind = current.windMph > 25 || next2.some(d => d.windMph > 25);
  const rain = current.precipMm > 5 || next2.some(d => d.precipMm > 5);
  const coldSnap = current.tempF < 40 || next2.some(d => d.minTempF < 40);
  const extreme_heat = current.tempF > 95 || next2.some(d => d.maxTempF > 95);
  const highUv = current.uvIndex > 8;

  const flagCount = [highWind, rain, coldSnap, extreme_heat, highUv].filter(Boolean).length;
  const level: ConstructionRiskFlags['level'] =
    flagCount >= 2 ? 'high' : flagCount === 1 ? 'moderate' : 'low';

  const parts: string[] = [];
  if (highWind) parts.push(`Wind ${current.windMph} mph — secure scaffolding`);
  if (rain) parts.push('Rain expected — protect concrete/drywall');
  if (coldSnap) parts.push(`${current.tempF}°F — concrete cure risk below 40°F`);
  if (extreme_heat) parts.push(`${current.tempF}°F — heat stress protocol required`);
  if (highUv) parts.push(`UV ${current.uvIndex} — enforce sun protection`);

  const summary = parts.length > 0
    ? parts.join(' · ')
    : 'Conditions are suitable for all exterior work.';

  return { highWind, rain, coldSnap, extreme_heat, highUv, level, summary };
}

// ─── Core fetch chain ─────────────────────────────────────────────────────────

const NWS_HEADERS = {
  'Accept': 'application/geo+json',
};

async function fetchWeatherGov(zip: string, signal: AbortSignal): Promise<WeatherData> {
  // 1. ZIP → lat/lon via zippopotam.us (free, no key, CORS-enabled)
  const zipRes = await fetch(`https://api.zippopotam.us/us/${zip}`, { signal });
  if (!zipRes.ok) throw new Error(`ZIP lookup failed (${zipRes.status})`);
  const zipJson = await zipRes.json();
  const place = zipJson.places?.[0];
  if (!place) throw new Error('ZIP code not found');
  const lat = parseFloat(place.latitude).toFixed(4);
  const lon = parseFloat(place.longitude).toFixed(4);
  const city: string = place['place name'] ?? '';
  const state: string = place['state abbreviation'] ?? '';

  // 2. lat/lon → NWS grid metadata
  const ptRes = await fetch(
    `https://api.weather.gov/points/${lat},${lon}`,
    { signal, headers: NWS_HEADERS }
  );
  if (!ptRes.ok) {
    const body = await ptRes.json().catch(() => ({}));
    throw new Error(body?.detail ?? `NWS grid lookup failed (${ptRes.status})`);
  }
  const ptJson = await ptRes.json();
  const forecastUrl: string = ptJson.properties?.forecast;
  const stationsUrl: string = ptJson.properties?.observationStations;
  if (!forecastUrl || !stationsUrl) throw new Error('NWS: missing forecast or stations URL');

  // 3. Parallel — forecast + station list
  const [fcRes, stRes] = await Promise.all([
    fetch(forecastUrl, { signal, headers: NWS_HEADERS }),
    fetch(stationsUrl, { signal, headers: NWS_HEADERS }),
  ]);
  if (!fcRes.ok) throw new Error(`Forecast fetch failed (${fcRes.status})`);
  if (!stRes.ok) throw new Error(`Stations fetch failed (${stRes.status})`);
  const [fcJson, stJson] = await Promise.all([fcRes.json(), stRes.json()]);

  // 4. Latest observation from nearest station (best-effort — may return null values)
  let obsProps: Record<string, any> = {};
  const stationId: string | undefined = stJson.features?.[0]?.properties?.stationIdentifier;
  if (stationId) {
    try {
      const obsRes = await fetch(
        `https://api.weather.gov/stations/${stationId}/observations/latest`,
        { signal, headers: NWS_HEADERS }
      );
      if (obsRes.ok) {
        const obsJson = await obsRes.json();
        obsProps = obsJson.properties ?? {};
      }
    } catch {
      // Non-fatal — fall back to first forecast period
    }
  }

  // ── Parse current conditions ─────────────────────────────────────────────
  const periods: any[] = fcJson.properties?.periods ?? [];
  const firstPeriod = periods[0];

  const obsTemp = obsProps.temperature?.value;      // Celsius or null
  const obsWindMs = obsProps.windSpeed?.value;      // m/s or null
  const obsWindDeg = obsProps.windDirection?.value; // degrees or null
  const obsHumidity = obsProps.relativeHumidity?.value; // % or null
  const obsHeatIdx = obsProps.heatIndex?.value;     // Celsius or null
  const obsWindChill = obsProps.windChill?.value;   // Celsius or null
  const obsPrecip = obsProps.precipitationLastHour?.value; // mm or null
  const obsVis = obsProps.visibility?.value;        // meters or null
  const obsDesc: string = obsProps.textDescription ?? '';

  const hasObsTemp = obsTemp != null;

  const tempF = hasObsTemp
    ? cToF(obsTemp)
    : (firstPeriod?.temperature ?? 70); // forecast temps are already in °F

  const feelsLikeF = hasObsTemp
    ? cToF(obsHeatIdx ?? obsWindChill ?? obsTemp)
    : tempF;

  const condition = obsDesc || firstPeriod?.shortForecast || 'Unknown';

  const current: CurrentWeather = {
    tempF,
    feelsLikeF,
    condition,
    conditionCode: 0,
    windMph: obsWindMs != null
      ? msToMph(obsWindMs)
      : parseWindSpeed(firstPeriod?.windSpeed ?? '0 mph'),
    windDir: obsWindDeg != null
      ? degreesToDir(obsWindDeg)
      : (firstPeriod?.windDirection ?? 'N'),
    humidity: obsHumidity != null ? Math.round(obsHumidity) : 50,
    uvIndex: estimateUV(condition, firstPeriod?.isDaytime ?? true),
    precipMm: obsPrecip ?? (firstPeriod?.probabilityOfPrecipitation?.value ?? 0) / 10,
    visibility: obsVis != null ? Math.round(obsVis / 1609.34) : 10,
    cloudCover: estimateCloudCover(condition),
  };

  // ── Parse forecast into daily buckets ────────────────────────────────────
  const dayMap: Record<string, { day?: any; night?: any }> = {};
  for (const p of periods) {
    const dateKey: string = p.startTime?.slice(0, 10);
    if (!dateKey) continue;
    if (!dayMap[dateKey]) dayMap[dateKey] = {};
    if (p.isDaytime) dayMap[dateKey].day = p;
    else dayMap[dateKey].night = p;
  }

  const forecast: ForecastDay[] = Object.entries(dayMap)
    .slice(0, 3)
    .map(([date, { day, night }]) => {
      const rep = day ?? night;
      const pop = rep?.probabilityOfPrecipitation?.value ?? 0;
      // NWS day periods hold high temp, night periods hold low temp
      const maxTempF = day?.temperature ?? (night ? night.temperature + 15 : 75);
      const minTempF = night?.temperature ?? (day ? day.temperature - 15 : 55);
      return {
        date,
        maxTempF,
        minTempF,
        precipMm: Math.round(pop) / 10,  // 100% PoP ≈ 10mm rough proxy
        condition: day?.shortForecast ?? night?.shortForecast ?? 'Unknown',
        windMph: parseWindSpeed(rep?.windSpeed ?? '0 mph'),
        uvIndex: estimateUV(day?.shortForecast ?? '', true),
        sunrise: '—',
        sunset: '—',
      };
    });

  const riskFlags = buildRiskFlags(current, forecast);

  return { zip, city, state, current, forecast, riskFlags, fetchedAt: Date.now() };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWeather(zip: string | undefined | null): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!zip || !/^\d{5}$/.test(zip)) {
      setWeather(null);
      setError(null);
      return;
    }

    const cached = CACHE[zip];
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setWeather(cached);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchWeatherGov(zip, controller.signal)
      .then(data => {
        CACHE[zip] = data;
        setWeather(data);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('[useWeather]', err);
          setError('Could not load weather data. Check your connection or ZIP code.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [zip, tick]);

  return {
    weather,
    loading,
    error,
    refetch: () => {
      if (zip) delete CACHE[zip];
      setTick(t => t + 1);
    },
  };
}
