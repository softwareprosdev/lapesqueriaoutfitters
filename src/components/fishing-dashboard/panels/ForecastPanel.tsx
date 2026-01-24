'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Fish,
  ThermometerSun,
  Droplets,
  Sun,
  CloudRain,
} from 'lucide-react';
import type { CombinedMarineData } from '@/types/marine';

interface ForecastPanelProps {
  data: CombinedMarineData | null;
}

export function ForecastPanel({ data }: ForecastPanelProps) {
  const weather = data?.weather;
  const marine = data?.marine;
  const solunar = data?.solunar;

  // Get forecast periods
  const forecastPeriods = weather?.forecast?.slice(0, 6) || [];

  // Calculate fishing forecast score
  const getFishingScore = () => {
    const waveHeight = marine?.waveHeight?.[0] || 1;
    const windSpeed = data?.openMeteoWeather?.currentWeather?.windSpeed || 10;
    const solunarRating = solunar?.rating || 'Fair';

    let score = 70; // Base score

    // Adjust for wave height (calmer = better)
    if (waveHeight < 0.5) score += 15;
    else if (waveHeight < 1) score += 10;
    else if (waveHeight > 2) score -= 15;

    // Adjust for wind (lighter = better for most fishing)
    if (windSpeed < 10) score += 10;
    else if (windSpeed > 20) score -= 10;

    // Adjust for solunar
    if (solunarRating === 'Excellent') score += 15;
    else if (solunarRating === 'Good') score += 10;
    else if (solunarRating === 'Poor') score -= 10;

    return Math.min(100, Math.max(0, score));
  };

  const fishingScore = getFishingScore();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-gold to-amber-600 rounded-xl shadow-lg shadow-gold/25">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gold">VIP Fishing Forecast</h2>
          <p className="text-slate-400 text-sm">Billionaire-grade predictions</p>
        </div>
      </div>

      {/* Fishing Score */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-gold/20"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Fish className="w-5 h-5 text-gold" />
            Today's Fishing Score
          </h3>
          <span className="text-xs text-slate-400">Updated live</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Score Circle */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                fill="none"
                stroke="rgba(212, 175, 55, 0.1)"
                strokeWidth="8"
              />
              <motion.circle
                cx="56"
                cy="56"
                r="48"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 302' }}
                animate={{ strokeDasharray: `${(fishingScore / 100) * 302} 302` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#8B7355" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gold">{fishingScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-sm text-slate-400">Rating</div>
              <div className={`text-xl font-bold ${
                fishingScore >= 80 ? 'text-emerald-400' :
                fishingScore >= 60 ? 'text-gold' :
                fishingScore >= 40 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {fishingScore >= 80 ? 'Excellent' :
                 fishingScore >= 60 ? 'Good' :
                 fishingScore >= 40 ? 'Fair' : 'Poor'}
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              {fishingScore >= 80
                ? 'Prime conditions for trophy catches. All factors aligned.'
                : fishingScore >= 60
                ? 'Good day for fishing. Consider offshore spots.'
                : 'Moderate conditions. Inshore fishing recommended.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Forecast Grid */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Extended Forecast</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {forecastPeriods.map((period, i) => (
            <div
              key={i}
              className="bg-slate-700/30 rounded-lg p-3 text-center hover:bg-slate-700/50 transition-colors"
            >
              <div className="text-xs text-slate-400 mb-2 truncate">
                {period.name?.split(' ')[0] || `Period ${i + 1}`}
              </div>
              <div className="text-2xl mb-2">
                {getWeatherEmoji(period.shortForecast)}
              </div>
              <div className="text-lg font-bold text-white">
                {period.temperature}°
              </div>
              <div className="text-xs text-slate-400 mt-1 truncate">
                {period.windSpeed}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Species Recommendations */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gold" />
          Target Species Today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'Red Drum', probability: 85, hotspot: 'Laguna Madre Flats', time: 'Morning' },
            { name: 'Speckled Trout', probability: 78, hotspot: 'Bay Grass Beds', time: 'Evening' },
            { name: 'Snook', probability: 65, hotspot: 'Jetties & Structure', time: 'Dusk' },
            { name: 'Tarpon', probability: 55, hotspot: 'Ship Channel', time: 'Night' },
          ].map((species, i) => (
            <div
              key={i}
              className="bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{species.name}</span>
                <span className={`text-sm font-bold ${
                  species.probability >= 80 ? 'text-emerald-400' :
                  species.probability >= 60 ? 'text-gold' : 'text-amber-400'
                }`}>
                  {species.probability}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${species.probability}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full bg-gradient-to-r from-gold to-amber-500 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{species.hotspot}</span>
                <span>{species.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIP Recommendation */}
      <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-xl p-4 border border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Fish className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-1">
              VIP Charter Recommendation
            </div>
            <h4 className="text-white font-bold">Offshore Billfish Trip</h4>
            <p className="text-slate-400 text-sm mt-1">
              Based on current conditions, today is ideal for targeting marlin and sailfish 30+ miles offshore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getWeatherEmoji(forecast: string): string {
  const lower = forecast?.toLowerCase() || '';
  if (lower.includes('sunny') || lower.includes('clear')) return '☀️';
  if (lower.includes('partly')) return '⛅';
  if (lower.includes('cloudy')) return '☁️';
  if (lower.includes('rain') || lower.includes('shower')) return '🌧️';
  if (lower.includes('storm') || lower.includes('thunder')) return '⛈️';
  if (lower.includes('fog')) return '🌫️';
  if (lower.includes('wind')) return '💨';
  return '🌤️';
}
