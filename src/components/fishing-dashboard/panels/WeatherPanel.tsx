'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  CloudRain,
  Wind,
  Droplets,
  ThermometerSun,
  Eye,
  AlertTriangle,
  Gauge,
} from 'lucide-react';
import type { CombinedMarineData, NOAAAlert } from '@/types/marine';

interface WeatherPanelProps {
  data: CombinedMarineData | null;
}

export function WeatherPanel({ data }: WeatherPanelProps) {
  const weather = data?.weather;
  const openMeteo = data?.openMeteoWeather;
  const marine = data?.marine;
  const alerts = weather?.alerts || [];

  const currentTemp = openMeteo?.currentWeather?.temperature || 72;
  const windSpeed = openMeteo?.currentWeather?.windSpeed || 8;
  const windDir = openMeteo?.currentWeather?.windDirection || 180;
  const humidity = openMeteo?.humidity?.[0] || 65;
  const uvIndex = openMeteo?.uvIndex?.[0] || 6;
  const waveHeight = marine?.waveHeight?.[0] || 1.2;
  const swellPeriod = marine?.swellWavePeriod?.[0] || 8;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/25">
          <Sun className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-amber-400">Marine Weather</h2>
          <p className="text-slate-400 text-sm">
            {weather?.city || 'South Padre Island'}, {weather?.state || 'TX'}
          </p>
        </div>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-xl border ${
                alert.severity === 'Extreme' || alert.severity === 'Severe'
                  ? 'bg-red-500/10 border-red-500/30'
                  : alert.severity === 'Moderate'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alert.severity === 'Extreme' || alert.severity === 'Severe'
                      ? 'text-red-400'
                      : alert.severity === 'Moderate'
                      ? 'text-amber-400'
                      : 'text-blue-400'
                  }`}
                />
                <div>
                  <div className="text-white font-semibold text-sm">{alert.event}</div>
                  <div className="text-slate-300 text-xs mt-1 line-clamp-2">
                    {alert.headline}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Current Conditions */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-amber-400/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Current Conditions</h3>
        <div className="flex items-center gap-8">
          {/* Temperature */}
          <div className="text-center">
            <div className="text-5xl font-black text-white">
              {currentTemp.toFixed(0)}°
            </div>
            <div className="text-slate-400 text-sm mt-1">Fahrenheit</div>
          </div>

          {/* Weather Icon */}
          <div className="text-6xl">
            {getWeatherEmoji(weather?.forecast?.[0]?.shortForecast)}
          </div>

          {/* Conditions */}
          <div className="flex-1">
            <div className="text-white font-medium">
              {weather?.forecast?.[0]?.shortForecast || 'Partly Cloudy'}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              Feels like {(currentTemp + (humidity > 70 ? 3 : 0)).toFixed(0)}°
            </div>
          </div>
        </div>
      </motion.div>

      {/* Conditions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ConditionCard
          icon={<Wind className="w-5 h-5" />}
          label="Wind"
          value={`${windSpeed.toFixed(0)} mph`}
          subValue={getWindDirection(windDir)}
          color="cyan"
        />
        <ConditionCard
          icon={<Droplets className="w-5 h-5" />}
          label="Humidity"
          value={`${humidity.toFixed(0)}%`}
          subValue={humidity > 80 ? 'High' : humidity > 50 ? 'Moderate' : 'Low'}
          color="blue"
        />
        <ConditionCard
          icon={<Sun className="w-5 h-5" />}
          label="UV Index"
          value={uvIndex.toFixed(0)}
          subValue={getUVLevel(uvIndex)}
          color="amber"
        />
        <ConditionCard
          icon={<Eye className="w-5 h-5" />}
          label="Visibility"
          value="10+ mi"
          subValue="Clear"
          color="emerald"
        />
      </div>

      {/* Marine Conditions */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Marine Conditions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Wave Height</div>
            <div className="text-2xl font-bold text-cyan-400">
              {waveHeight.toFixed(1)}m
            </div>
            <div className="text-slate-400 text-xs mt-1">
              {waveHeight < 0.5 ? 'Calm' : waveHeight < 1 ? 'Light' : waveHeight < 2 ? 'Moderate' : 'Rough'}
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Swell Period</div>
            <div className="text-2xl font-bold text-blue-400">
              {swellPeriod.toFixed(0)}s
            </div>
            <div className="text-slate-400 text-xs mt-1">
              {swellPeriod > 10 ? 'Long period' : 'Short period'}
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Water Temp</div>
            <div className="text-2xl font-bold text-teal-400">
              {(currentTemp - 2).toFixed(0)}°F
            </div>
            <div className="text-slate-400 text-xs mt-1">Comfortable</div>
          </div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Hourly Outlook</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {weather?.hourly?.slice(0, 12).map((hour, i) => (
            <div
              key={i}
              className="flex-shrink-0 bg-slate-700/30 rounded-lg p-3 text-center min-w-[70px]"
            >
              <div className="text-slate-400 text-xs">
                {new Date(hour.startTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  hour12: true,
                })}
              </div>
              <div className="text-xl my-2">
                {getWeatherEmoji(hour.shortForecast)}
              </div>
              <div className="text-white font-semibold">{hour.temperature}°</div>
            </div>
          ))}
        </div>
      </div>

      {/* UV Protection Reminder */}
      {uvIndex >= 6 && (
        <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-xl p-4 border border-amber-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sun className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-1">
                High UV Alert
              </div>
              <h4 className="text-white font-bold">Protect Your Skin</h4>
              <p className="text-slate-400 text-sm mt-1">
                UV index is high today. Shop our UPF 50+ sun-protective apparel for maximum protection.
              </p>
              <button className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors">
                Shop Sun Protection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConditionCard({
  icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className={`${colorClasses[color]} mb-2`}>{icon}</div>
      <div className="text-slate-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-white text-xl font-bold mt-1">{value}</div>
      <div className="text-slate-400 text-xs mt-1">{subValue}</div>
    </div>
  );
}

function getWeatherEmoji(forecast?: string): string {
  const lower = forecast?.toLowerCase() || '';
  if (lower.includes('sunny') || lower.includes('clear')) return '☀️';
  if (lower.includes('partly')) return '⛅';
  if (lower.includes('cloudy')) return '☁️';
  if (lower.includes('rain') || lower.includes('shower')) return '🌧️';
  if (lower.includes('storm') || lower.includes('thunder')) return '⛈️';
  if (lower.includes('fog')) return '🌫️';
  return '🌤️';
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
}

function getUVLevel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}
