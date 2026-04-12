/**
 * WeatherWidget — compact weather display for the GC Command Dashboard.
 *
 * Shows: current temp, condition, wind, humidity, UV index,
 * 3-day forecast strip, and a construction risk flag banner.
 *
 * Uses the free wttr.in API via useWeather hook.
 */

import { Cloud, Wind, Droplets, Sun, RefreshCw, AlertTriangle, Thermometer } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  zip: string | undefined | null;
  className?: string;
  compact?: boolean;
}

const CONDITION_EMOJI: Record<string, string> = {
  'Sunny': '☀️', 'Clear': '🌙', 'Partly cloudy': '⛅', 'Cloudy': '☁️',
  'Overcast': '☁️', 'Mist': '🌫️', 'Fog': '🌫️', 'Freezing fog': '🌫️',
  'Patchy rain possible': '🌦️', 'Light rain': '🌧️', 'Moderate rain': '🌧️',
  'Heavy rain': '🌧️', 'Torrential rain shower': '⛈️', 'Light snow': '🌨️',
  'Moderate snow': '🌨️', 'Heavy snow': '❄️', 'Blizzard': '🌨️',
  'Thundery outbreaks possible': '⛈️', 'Patchy light rain with thunder': '⛈️',
  'Moderate or heavy rain with thunder': '⛈️',
};

function getEmoji(condition: string): string {
  return CONDITION_EMOJI[condition] ?? '🌡️';
}

const RISK_COLOR = {
  low: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  moderate: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  high: 'bg-red-500/15 border-red-500/30 text-red-300',
};

export function WeatherWidget({ zip, className, compact = false }: WeatherWidgetProps) {
  const { weather, loading, error, refetch } = useWeather(zip);

  if (!zip || !/^\d{5}$/.test(zip)) {
    return (
      <div className={cn('rounded-lg border border-amber-300/20 bg-[#0a2344] p-3', className)}>
        <div className="flex items-center gap-2 text-xs text-slate-300/60">
          <Cloud className="h-4 w-4" />
          <span>Enter a ZIP code to load weather & construction risk data</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('rounded-lg border border-amber-300/20 bg-[#0a2344] p-3 animate-pulse', className)}>
        <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-700/40 rounded w-1/2" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={cn('rounded-lg border border-amber-300/20 bg-[#0a2344] p-3', className)}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300/60">{error ?? 'Weather unavailable'}</span>
          <button onClick={refetch} className="text-amber-300/60 hover:text-amber-300">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const { current, forecast, riskFlags, city, state } = weather;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 text-xs', className)}>
        <span className="text-2xl">{getEmoji(current.condition)}</span>
        <div>
          <span className="font-semibold text-amber-100">{current.tempF}°F</span>
          <span className="text-slate-300/70 ml-1">{current.condition}</span>
        </div>
        {riskFlags.level !== 'low' && (
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', RISK_COLOR[riskFlags.level])}>
            {riskFlags.level.toUpperCase()} RISK
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-amber-300/20 bg-[#0a2344] overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-300/15">
        <div className="flex items-center gap-1.5">
          <Cloud className="h-3.5 w-3.5 text-amber-300/70" />
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Weather · {city}{state ? `, ${state}` : ''} ({zip})
          </span>
        </div>
        <button
          onClick={refetch}
          className="text-slate-300/40 hover:text-amber-300 transition-colors"
          title="Refresh weather"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      {/* Current conditions */}
      <div className="px-4 py-3 flex items-start gap-4">
        <div className="text-4xl leading-none">{getEmoji(current.condition)}</div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-100">{current.tempF}°F</span>
            <span className="text-xs text-slate-300/70">feels {current.feelsLikeF}°F</span>
          </div>
          <div className="text-xs text-slate-200 mt-0.5">{current.condition}</div>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="flex items-center gap-1 text-[11px] text-slate-300/80">
              <Wind className="h-3 w-3" /> {current.windMph} mph {current.windDir}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-300/80">
              <Droplets className="h-3 w-3" /> {current.humidity}% humidity
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-300/80">
              <Sun className="h-3 w-3" /> UV {current.uvIndex}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-300/80">
              <Thermometer className="h-3 w-3" /> {current.cloudCover}% cloud
            </span>
          </div>
        </div>
      </div>

      {/* 3-day forecast strip */}
      {forecast.length > 0 && (
        <div className="grid grid-cols-3 border-t border-amber-300/15 divide-x divide-amber-300/15">
          {forecast.slice(0, 3).map((day) => {
            const d = new Date(day.date + 'T12:00:00');
            const label = d.toLocaleDateString('en-US', { weekday: 'short' });
            return (
              <div key={day.date} className="px-3 py-2 text-center">
                <div className="text-[10px] text-slate-300/60 uppercase">{label}</div>
                <div className="text-base mt-0.5">{getEmoji(day.condition)}</div>
                <div className="text-[11px] text-amber-100 font-semibold mt-0.5">
                  {day.maxTempF}° / {day.minTempF}°
                </div>
                {day.precipMm > 0.5 && (
                  <div className="text-[10px] text-sky-400 mt-0.5">
                    <Droplets className="h-2.5 w-2.5 inline mr-0.5" />
                    {day.precipMm.toFixed(1)}mm
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Construction risk banner */}
      <div className={cn(
        'mx-3 mb-3 mt-2 rounded-md border px-3 py-2 flex items-start gap-2',
        RISK_COLOR[riskFlags.level]
      )}>
        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5">
            Construction Risk — {riskFlags.level.toUpperCase()}
          </div>
          <div className="text-[11px] leading-relaxed">{riskFlags.summary}</div>
        </div>
      </div>
    </div>
  );
}
