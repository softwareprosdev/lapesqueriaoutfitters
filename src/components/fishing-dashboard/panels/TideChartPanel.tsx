'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Waves, ArrowUp, ArrowDown, Clock, Calendar } from 'lucide-react';
import type { CombinedMarineData, TideExtreme } from '@/types/marine';

interface TideChartPanelProps {
  data: CombinedMarineData | null;
}

export function TideChartPanel({ data }: TideChartPanelProps) {
  const tides = data?.tides;
  const currentTide = tides?.current || 0;
  const todayTides = tides?.today || [];
  const forecast = tides?.forecast || [];

  // Determine tide direction (rising or falling)
  const getTideDirection = (): 'rising' | 'falling' | 'slack' => {
    if (todayTides.length < 2) return 'slack';

    const now = new Date();
    const nextHigh = todayTides.find(
      (t) => t.type === 'high' && new Date(t.time) > now
    );
    const nextLow = todayTides.find(
      (t) => t.type === 'low' && new Date(t.time) > now
    );

    if (!nextHigh && !nextLow) return 'slack';
    if (!nextHigh) return 'falling';
    if (!nextLow) return 'rising';

    return new Date(nextHigh.time) < new Date(nextLow.time) ? 'rising' : 'falling';
  };

  const tideDirection = getTideDirection();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/25">
          <Waves className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-cyan-400">Tide Chart</h2>
          <p className="text-slate-400 text-sm">
            {tides?.station || 'South Padre Island'} Station
          </p>
        </div>
      </div>

      {/* Current Tide Level */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-cyan-400/20"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Current Level</h3>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              tideDirection === 'rising'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                : tideDirection === 'falling'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-400/30'
                : 'bg-slate-500/20 text-slate-400 border border-slate-400/30'
            }`}
          >
            {tideDirection === 'rising' ? (
              <ArrowUp className="w-3 h-3" />
            ) : tideDirection === 'falling' ? (
              <ArrowDown className="w-3 h-3" />
            ) : null}
            {tideDirection.charAt(0).toUpperCase() + tideDirection.slice(1)}
          </div>
        </div>

        <div className="flex items-end gap-6">
          {/* Large Tide Display */}
          <div className="flex-shrink-0">
            <div className="text-5xl md:text-6xl font-black text-white">
              {currentTide.toFixed(1)}
              <span className="text-2xl text-cyan-400 ml-2">ft</span>
            </div>
            <div className="text-slate-400 text-sm mt-2">
              Above Mean Lower Low Water
            </div>
          </div>

          {/* Tide Visualization */}
          <div className="flex-1 h-24 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/30 to-transparent rounded-lg overflow-hidden">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(100, (currentTide / 3) * 100)}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-400/50"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Tides */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Today's Tides
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {todayTides.slice(0, 4).map((tide, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl ${
                tide.type === 'high'
                  ? 'bg-emerald-500/10 border border-emerald-400/20'
                  : 'bg-orange-500/10 border border-orange-400/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {tide.type === 'high' ? (
                  <ArrowUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-orange-400" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    tide.type === 'high' ? 'text-emerald-400' : 'text-orange-400'
                  }`}
                >
                  {tide.type.toUpperCase()}
                </span>
              </div>
              <div className="text-white text-xl font-bold">
                {tide.height.toFixed(1)}ft
              </div>
              <div className="text-slate-400 text-sm mt-1">
                {new Date(tide.time).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold" />
          7-Day Tide Forecast
        </h3>
        <div className="space-y-3">
          {forecast.slice(0, 7).map((day, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              {/* Date */}
              <div className="w-24 flex-shrink-0">
                <div className="text-white font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                  })}
                </div>
                <div className="text-slate-400 text-xs">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>

              {/* Tide Bar */}
              <div className="flex-1 h-8 flex items-center gap-2">
                {day.extremes?.slice(0, 4).map((extreme, j) => (
                  <motion.div
                    key={j}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05 + j * 0.02 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className={`w-full rounded-sm ${
                        extreme.type === 'high' ? 'bg-cyan-400' : 'bg-cyan-600'
                      }`}
                      style={{
                        height: `${Math.max(8, (extreme.height / 3) * 30)}px`,
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* High/Low Values */}
              <div className="flex gap-4 text-sm">
                {day.high && (
                  <div className="text-emerald-400">
                    <span className="text-slate-400 mr-1">H:</span>
                    {day.high.height.toFixed(1)}ft
                  </div>
                )}
                {day.low && (
                  <div className="text-orange-400">
                    <span className="text-slate-400 mr-1">L:</span>
                    {day.low.height.toFixed(1)}ft
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tide Tips */}
      <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-4 border border-cyan-500/20">
        <h4 className="text-cyan-400 font-semibold mb-2">Pro Tip</h4>
        <p className="text-slate-300 text-sm">
          {tideDirection === 'rising'
            ? 'Rising tide is perfect for working the flats. Fish will move in with the water to feed on baitfish and crustaceans.'
            : tideDirection === 'falling'
            ? 'Falling tide concentrates baitfish in channels and cuts. Focus on structure and drop-offs.'
            : 'Slack tide can be challenging. Try slower presentations and focus on deep structure.'}
        </p>
      </div>
    </div>
  );
}
