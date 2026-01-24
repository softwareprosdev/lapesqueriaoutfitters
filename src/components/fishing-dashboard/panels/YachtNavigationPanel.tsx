'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Anchor,
  Ship,
  Navigation,
  AlertTriangle,
  MapPin,
  Fuel,
  Wind,
  Waves,
} from 'lucide-react';
import type { CombinedMarineData, VesselData } from '@/types/marine';

interface YachtNavigationPanelProps {
  data: CombinedMarineData | null;
}

export function YachtNavigationPanel({ data }: YachtNavigationPanelProps) {
  const vessels = data?.vessels || [];
  const collisionAlerts = data?.collisionAlerts || [];
  const marine = data?.marine;
  const weather = data?.openMeteoWeather;

  // Calculate sea state based on wave height
  const waveHeight = marine?.waveHeight?.[0] || 0;
  const seaState = getSeaState(waveHeight);

  // Calculate weather window
  const windSpeed = weather?.currentWeather?.windSpeed || 0;
  const weatherWindow = getWeatherWindow(windSpeed, waveHeight);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-gold to-amber-600 rounded-xl shadow-lg shadow-gold/25">
          <Ship className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gold">Yacht Navigation Elite</h2>
          <p className="text-slate-400 text-sm">Real-time superyacht intelligence</p>
        </div>
      </div>

      {/* Collision Alerts */}
      {collisionAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-red-400 font-semibold">Collision Alerts</span>
          </div>
          <div className="space-y-2">
            {collisionAlerts.slice(0, 3).map((vessel) => (
              <div
                key={vessel.mmsi}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  vessel.risk === 'danger' ? 'bg-red-500/20' : 'bg-amber-500/20'
                }`}
              >
                <span className="text-white text-sm">
                  Vessel {vessel.mmsi.slice(-4)}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-300">
                    CPA: {vessel.cpa?.toFixed(1) || '—'}nm
                  </span>
                  <span className="text-slate-300">
                    TCPA: {vessel.tcpa?.toFixed(0) || '—'}min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          icon={<Waves className="w-5 h-5" />}
          label="Sea State"
          value={seaState.name}
          subValue={`Beaufort ${seaState.beaufort}`}
          color={seaState.color}
        />
        <MetricCard
          icon={<Wind className="w-5 h-5" />}
          label="Wind"
          value={`${windSpeed.toFixed(0)}`}
          unit="mph"
          subValue={getWindDirection(weather?.currentWeather?.windDirection || 0)}
          color="cyan"
        />
        <MetricCard
          icon={<Navigation className="w-5 h-5" />}
          label="Visibility"
          value="10+"
          unit="nm"
          subValue="Excellent"
          color="emerald"
        />
        <MetricCard
          icon={<Anchor className="w-5 h-5" />}
          label="Vessels"
          value={vessels.length.toString()}
          subValue="In range"
          color="gold"
        />
      </div>

      {/* Weather Window */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Weather Window</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              weatherWindow.status === 'go'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                : weatherWindow.status === 'caution'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                : 'bg-red-500/20 text-red-400 border border-red-400/30'
            }`}
          >
            {weatherWindow.status.toUpperCase()}
          </span>
        </div>
        <p className="text-slate-300 text-sm">{weatherWindow.description}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-gold text-lg font-bold">48h</div>
            <div className="text-slate-400 text-xs">Forecast</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-cyan-400 text-lg font-bold">
              {marine?.swellWavePeriod?.[0]?.toFixed(0) || '8'}s
            </div>
            <div className="text-slate-400 text-xs">Swell Period</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-emerald-400 text-lg font-bold">
              {weather?.currentWeather?.temperature?.toFixed(0) || '72'}°
            </div>
            <div className="text-slate-400 text-xs">Air Temp</div>
          </div>
        </div>
      </div>

      {/* Safe Harbors */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gold" />
          Safe Harbors
        </h3>
        <div className="space-y-3">
          {[
            { name: 'South Padre Island Marina', distance: 2.5, eta: '15min', fuel: true, helipad: false },
            { name: 'Port Isabel Yacht Club', distance: 8, eta: '45min', fuel: true, helipad: true },
            { name: 'Corpus Christi Bay', distance: 85, eta: '6h', fuel: true, helipad: true },
          ].map((harbor, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <div>
                <div className="text-white font-medium text-sm">{harbor.name}</div>
                <div className="text-slate-400 text-xs mt-0.5">
                  {harbor.distance}nm • ETA {harbor.eta}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {harbor.fuel && (
                  <span className="p-1.5 bg-emerald-500/20 rounded-lg" title="Fuel Available">
                    <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                )}
                {harbor.helipad && (
                  <span className="p-1.5 bg-gold/20 rounded-lg" title="Helipad Available">
                    <span className="text-gold text-xs">H</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIP Product Recommendation */}
      <div className="bg-gradient-to-br from-gold/10 to-amber-600/10 rounded-xl p-4 border border-gold/20">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">🧢</span>
          </div>
          <div className="flex-1">
            <div className="text-gold text-xs font-semibold uppercase tracking-wide mb-1">
              Recommended for Today
            </div>
            <h4 className="text-white font-bold">Monogrammed Captain's Hat</h4>
            <p className="text-slate-400 text-sm mt-1">
              UV-protective with custom embroidery. Perfect for {seaState.name.toLowerCase()} conditions.
            </p>
            <button className="mt-3 px-4 py-2 bg-gold text-slate-900 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors">
              View Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon,
  label,
  value,
  unit,
  subValue,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  subValue: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    gold: 'text-gold',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-3 md:p-4 border border-slate-700/50">
      <div className={`${colorClasses[color] || 'text-gold'} mb-2`}>{icon}</div>
      <div className="text-slate-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-white text-xl md:text-2xl font-bold mt-1">
        {value}
        {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
      </div>
      <div className="text-slate-400 text-xs mt-1">{subValue}</div>
    </div>
  );
}

// Helper functions
function getSeaState(waveHeight: number): { name: string; beaufort: number; color: string } {
  if (waveHeight < 0.3) return { name: 'Calm', beaufort: 1, color: 'emerald' };
  if (waveHeight < 0.6) return { name: 'Smooth', beaufort: 2, color: 'emerald' };
  if (waveHeight < 1.0) return { name: 'Slight', beaufort: 3, color: 'cyan' };
  if (waveHeight < 2.0) return { name: 'Moderate', beaufort: 4, color: 'amber' };
  if (waveHeight < 4.0) return { name: 'Rough', beaufort: 5, color: 'orange' };
  return { name: 'Very Rough', beaufort: 6, color: 'red' };
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function getWeatherWindow(
  windSpeed: number,
  waveHeight: number
): { status: 'go' | 'caution' | 'no-go'; description: string } {
  if (windSpeed < 15 && waveHeight < 1.5) {
    return {
      status: 'go',
      description: 'Excellent conditions for sailing. Light winds, calm seas. Ideal for extended voyages.',
    };
  }
  if (windSpeed < 25 && waveHeight < 3) {
    return {
      status: 'caution',
      description: 'Moderate conditions. Experienced crew recommended. Monitor weather updates.',
    };
  }
  return {
    status: 'no-go',
    description: 'Challenging conditions ahead. Consider delaying departure or seeking safe harbor.',
  };
}
