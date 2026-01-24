'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Anchor,
  Fuel,
  Phone,
  MapPin,
  Star,
  Clock,
  Ship,
  Waves,
} from 'lucide-react';
import type { CombinedMarineData, Marina } from '@/types/marine';

interface MarinaPanelProps {
  data: CombinedMarineData | null;
}

// Mock marina data - in production this would come from an API
const MARINAS: Marina[] = [
  {
    id: '1',
    name: 'South Padre Island Marina',
    lat: 26.0742,
    lng: -97.1642,
    distanceNm: 2.5,
    etaHours: 0.25,
    hasHelipad: false,
    hasFuel: true,
    slipsAvailable: 12,
    vhfChannel: 16,
  },
  {
    id: '2',
    name: 'Port Isabel Yacht Club',
    lat: 26.0611,
    lng: -97.2156,
    distanceNm: 8,
    etaHours: 0.75,
    hasHelipad: true,
    hasFuel: true,
    slipsAvailable: 5,
    vhfChannel: 68,
  },
  {
    id: '3',
    name: 'Laguna Madre Marina',
    lat: 26.1200,
    lng: -97.2800,
    distanceNm: 15,
    etaHours: 1.5,
    hasHelipad: false,
    hasFuel: true,
    slipsAvailable: 8,
    vhfChannel: 16,
  },
  {
    id: '4',
    name: 'Corpus Christi Yacht Basin',
    lat: 27.8006,
    lng: -97.3964,
    distanceNm: 85,
    etaHours: 6,
    hasHelipad: true,
    hasFuel: true,
    slipsAvailable: 24,
    vhfChannel: 16,
  },
];

export function MarinaPanel({ data }: MarinaPanelProps) {
  const vessels = data?.vessels || [];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg shadow-teal-500/25">
          <Anchor className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-teal-400">Marina & Harbors</h2>
          <p className="text-slate-400 text-sm">VIP berth availability & services</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <div className="text-2xl font-bold text-teal-400">4</div>
          <div className="text-slate-400 text-xs mt-1">Nearby Marinas</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <div className="text-2xl font-bold text-gold">49</div>
          <div className="text-slate-400 text-xs mt-1">Slips Available</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <div className="text-2xl font-bold text-emerald-400">2</div>
          <div className="text-slate-400 text-xs mt-1">With Helipads</div>
        </div>
      </div>

      {/* Marina List */}
      <div className="space-y-3">
        {MARINAS.map((marina, i) => (
          <motion.div
            key={marina.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-teal-500/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold">{marina.name}</h4>
                  {marina.hasHelipad && (
                    <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full">
                      Helipad
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{marina.distanceNm}nm</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {marina.etaHours < 1
                        ? `${Math.round(marina.etaHours * 60)}min`
                        : `${marina.etaHours}h`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Ship className="w-3.5 h-3.5" />
                    <span>VHF {marina.vhfChannel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  {marina.hasFuel && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg">
                      <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-xs">Fuel</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 rounded-lg">
                    <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-400 text-xs">
                      {marina.slipsAvailable} slips
                    </span>
                  </div>
                </div>
              </div>

              <button className="p-3 bg-teal-500/20 rounded-xl hover:bg-teal-500/30 transition-colors">
                <Phone className="w-5 h-5 text-teal-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vessel Traffic */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Ship className="w-5 h-5 text-cyan-400" />
          Nearby Vessel Traffic
        </h3>
        {vessels.length > 0 ? (
          <div className="space-y-2">
            {vessels.slice(0, 5).map((vessel, i) => (
              <div
                key={vessel.mmsi}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
              >
                <div>
                  <div className="text-white text-sm">
                    {vessel.name || `Vessel ${vessel.mmsi.slice(-4)}`}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {vessel.speed.toFixed(1)} kts • {vessel.heading.toFixed(0)}°
                  </div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    vessel.risk === 'danger'
                      ? 'bg-red-500 animate-pulse'
                      : vessel.risk === 'caution'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Waves className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No vessels in immediate range</p>
            <p className="text-xs mt-1">AIS data updates in real-time</p>
          </div>
        )}
      </div>

      {/* VIP Services */}
      <div className="bg-gradient-to-br from-gold/10 to-amber-600/10 rounded-xl p-4 border border-gold/20">
        <h3 className="text-lg font-semibold text-gold mb-4">VIP Marina Services</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🛳️', name: 'Superyacht Berths', desc: 'Up to 200ft' },
            { icon: '🚁', name: 'Helipad Access', desc: '2 locations' },
            { icon: '⛽', name: 'Premium Fuel', desc: 'Diesel & gasoline' },
            { icon: '🍽️', name: 'Concierge Dining', desc: 'Dock-side service' },
          ].map((service, i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3"
            >
              <span className="text-2xl">{service.icon}</span>
              <div>
                <div className="text-white text-sm font-medium">{service.name}</div>
                <div className="text-slate-400 text-xs">{service.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
