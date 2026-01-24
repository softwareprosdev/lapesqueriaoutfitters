'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Star,
  Fish,
  Clock,
} from 'lucide-react';
import type { CombinedMarineData, SolunarPeriod } from '@/types/marine';

interface SolunarPanelProps {
  data: CombinedMarineData | null;
}

export function SolunarPanel({ data }: SolunarPanelProps) {
  const solunar = data?.solunar;
  const periods = solunar?.periods || [];
  const moonPhase = solunar?.moonPhase || 'Waxing Gibbous';
  const moonIllumination = solunar?.moonIllumination || 65;
  const rating = solunar?.rating || 'Good';
  const sunrise = solunar?.sunrise || '06:45';
  const sunset = solunar?.sunset || '19:15';

  // Get current period if any
  const now = new Date();
  const currentHour = now.getHours();
  const currentPeriod = periods.find((p) => {
    const startHour = parseInt(p.start.split(':')[0]);
    const endHour = parseInt(p.end.split(':')[0]);
    return currentHour >= startHour && currentHour < endHour;
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/25">
          <Moon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-purple-400">Solunar Forecast</h2>
          <p className="text-slate-400 text-sm">Peak fishing activity periods</p>
        </div>
      </div>

      {/* Today's Rating */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-purple-400/20"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Today's Fishing Rating</h3>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-bold ${
              rating === 'Excellent'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                : rating === 'Good'
                ? 'bg-gold/20 text-gold border border-gold/30'
                : rating === 'Fair'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                : 'bg-red-500/20 text-red-400 border border-red-400/30'
            }`}
          >
            {rating}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Moon Phase Visual */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-slate-700 overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: `${-100 + moonIllumination}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-100"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Moon className="w-8 h-8 text-slate-900/20" />
            </div>
          </div>

          {/* Moon Info */}
          <div className="flex-1">
            <div className="text-white text-xl font-bold">{moonPhase}</div>
            <div className="text-slate-400 text-sm mt-1">
              {moonIllumination}% illumination
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-amber-400">
                <Sunrise className="w-4 h-4" />
                <span className="text-sm">{sunrise}</span>
              </div>
              <div className="flex items-center gap-1 text-orange-400">
                <Sunset className="w-4 h-4" />
                <span className="text-sm">{sunset}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Period Alert */}
        {currentPeriod && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-400/20"
          >
            <div className="flex items-center gap-2">
              <Fish className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold">
                Active {currentPeriod.type} Period Now!
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-1">
              {currentPeriod.description || 'Fish are actively feeding. Head out now for best results.'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Solunar Periods */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Today's Feeding Periods
        </h3>
        <div className="space-y-3">
          {periods.map((period, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-xl ${
                period.type === 'Major'
                  ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20'
                  : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      period.type === 'Major'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {period.type}
                  </span>
                  <span className="text-white font-mono">
                    {period.start} - {period.end}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-3 h-3 ${
                        j < Math.ceil(period.activity / 20)
                          ? period.type === 'Major'
                            ? 'text-emerald-400 fill-emerald-400'
                            : 'text-blue-400 fill-blue-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Activity Bar */}
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${period.activity}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  className={`h-full rounded-full ${
                    period.type === 'Major'
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                      : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                  }`}
                />
              </div>

              <p className="text-slate-400 text-sm mt-2">
                {period.description ||
                  (period.type === 'Major'
                    ? 'Peak feeding activity. Best time for trophy fish.'
                    : 'Moderate activity. Good for casual fishing.')}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Moon Phase Calendar (Next 7 Days) */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">7-Day Moon Outlook</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dayIllumination = Math.round((moonIllumination + i * 5) % 100);

            return (
              <div
                key={i}
                className="flex-shrink-0 bg-slate-700/30 rounded-lg p-3 text-center min-w-[70px]"
              >
                <div className="text-slate-400 text-xs">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="my-2">
                  <div
                    className="w-8 h-8 mx-auto rounded-full bg-slate-600 overflow-hidden relative"
                    style={{
                      background: `linear-gradient(90deg, #e2e8f0 ${dayIllumination}%, #475569 ${dayIllumination}%)`,
                    }}
                  />
                </div>
                <div className="text-white text-xs font-semibold">
                  {dayIllumination}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Solunar Tips */}
      <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-500/20">
        <h4 className="text-purple-400 font-semibold mb-3">Solunar Theory</h4>
        <div className="space-y-2 text-slate-300 text-sm">
          <p>
            <strong className="text-white">Major Periods:</strong> When the moon is directly overhead or underfoot. Fish are most active - expect 2-3 hour windows of peak feeding.
          </p>
          <p>
            <strong className="text-white">Minor Periods:</strong> During moonrise and moonset. Good activity for about 1 hour. Best combined with tide changes.
          </p>
          <p>
            <strong className="text-white">New & Full Moons:</strong> Strongest gravitational pull creates best fishing conditions of the month.
          </p>
        </div>
      </div>
    </div>
  );
}
