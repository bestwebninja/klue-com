/**
 * useWeather — fetches real weather data for a US ZIP code.
 *
 * Uses the free wttr.in JSON API (no key required).
 * Caches results in-memory for 30 minutes to avoid hammering the API.
 *
 * Returns: current temp (°F), condition, wind, humidity, UV index,
 *          feels-like, 3-day forecast, and construction risk flags.
 */

import { useState, useEffect, useRef } from 'react';

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
  /** Precip > 5mm — concrete pour / drywall risk */
  rain: boolean;
  /** Temp < 40°F — concrete cure / paint risk */
  coldSnap: boolean;
  /** Temp > 95°F — worker heat stress / adhesive risk */
  extreme_heat: boolean;
  /** UV > 8 — worker sun exposure risk */
  highUv: boolean;
  /** Combined risk level */
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

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// In-memory cache keyed by ZIP
const CACHE: Record<string, WeatherData> = {};
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function buildRiskFlags(current: CurrentWeather, forecast: ForecastDay[]): ConstructionRiskFlags {
  const highWind = current.windMph > 25 || forecast.slice(0, 2).some(d => d.windMph > 25);
  const rain = current.precipMm > 5 || forecast.slice(0, 2).some(d => d.precipMm > 5);
  const coldSnap = current.tempF < 40 || forecast.slice(0, 2).some(d => d.minTempF < 40);
  const extreme_heat = current.tempF > 95 || forecast.slice(0, 2).some(d => d.maxTempF > 95);
  const highUv = current.uvIndex > 8;

  const riskCount = [highWind, rain, coldSnap, extreme_heat, highUv].filter(Boolean).length;
  const level: ConstructionRiskFlags['level'] =
    riskCount >= 2 ? 'high' : riskCount === 1 ? 'moderate' : 'low';

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

export function useWeather(zip: string | undefined | null): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!zip || !/^\d{5}$/.test(zip)) {
      setWeather(null);
      return;
    }

    // Check cache
    const cached = CACHE[zip];
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      setWeather(cached);
      return;
    }

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetch(`https://wttr.in/${zip}?format=j1`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
        return res.json();
      })
      .then((json: any) => {
        const current = json.current_condition?.[0];
        const nearest = json.nearest_area?.[0];
        const weather3Day = json.weather ?? [];

        if (!current) throw new Error('No weather data returned');

        const city = nearest?.areaName?.[0]?.value ?? '';
        const state = nearest?.region?.[0]?.value ?? '';

        const currentWeather: CurrentWeather = {
          tempF: parseInt(current.temp_F ?? '70'),
          feelsLikeF: parseInt(current.FeelsLikeF ?? '70'),
          condition: current.weatherDesc?.[0]?.value ?? 'Unknown',
          conditionCode: parseInt(current.weatherCode ?? '113'),
          windMph: parseInt(current.windspeedMiles ?? '0'),
          windDir: current.winddir16Point ?? 'N',
          humidity: parseInt(current.humidity ?? '50'),
          uvIndex: parseInt(current.uvIndex ?? '0'),
          precipMm: parseFloat(current.precipMM ?? '0'),
          visibility: parseInt(current.visibility ?? '10'),
          cloudCover: parseInt(current.cloudcover ?? '0'),
        };

        const forecast: ForecastDay[] = weather3Day.map((day: any) => ({
          date: day.date ?? '',
          maxTempF: parseInt(day.maxtempF ?? '75'),
          minTempF: parseInt(day.mintempF ?? '55'),
          precipMm: parseFloat(day.hourly?.reduce(
            (sum: number, h: any) => sum + parseFloat(h.precipMM ?? '0'), 0
          ).toFixed(1) ?? '0'),
          condition: day.hourly?.[4]?.weatherDesc?.[0]?.value ?? 'Unknown',
          windMph: parseInt(day.hourly?.[4]?.windspeedMiles ?? '0'),
          uvIndex: parseInt(day.uvIndex ?? '0'),
          sunrise: day.astronomy?.[0]?.sunrise ?? '6:00 AM',
          sunset: day.astronomy?.[0]?.sunset ?? '7:00 PM',
        }));

        const riskFlags = buildRiskFlags(currentWeather, forecast);

        const data: WeatherData = {
          zip,
          city,
          state,
          current: currentWeather,
          forecast,
          riskFlags,
          fetchedAt: Date.now(),
        };

        CACHE[zip] = data;
        setWeather(data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Could not load weather data. Check your internet connection.');
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [zip, tick]);

  return {
    weather,
    loading,
    error,
    refetch: () => {
      if (zip) delete CACHE[zip];
      setTick((t) => t + 1);
    },
  };
}
