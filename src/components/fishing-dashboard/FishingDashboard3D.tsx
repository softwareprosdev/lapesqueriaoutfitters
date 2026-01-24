'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Maximize2, Wifi, WifiOff, Anchor } from 'lucide-react';

import { DashboardScreen } from './DashboardScreen';
import { useMarineData } from './hooks/useMarineData';
import { useDeviceCapabilities, useGeolocation } from './hooks/useDeviceCapabilities';
import type { DashboardTab } from '@/types/marine';

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="relative w-full h-[600px] md:h-[700px] lg:h-[750px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 rounded-full border-4 border-gold/30 border-t-gold"
        style={{ borderTopColor: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.3)' }}
      />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="text-cyan-400 font-semibold">Loading Premium Dashboard</p>
        <p className="text-slate-400 text-sm mt-1">Fetching marine data...</p>
      </div>
    </div>
  );
}

// Main Dashboard Component - Flat tablet-style display
export default function FishingDashboard3D() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('yacht-navigation');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showARPrompt, setShowARPrompt] = useState(false);

  const { location } = useGeolocation();
  const { data, isLoading, error, refresh, isOffline } = useMarineData({
    lat: location?.lat,
    lng: location?.lng,
    autoRefresh: true,
    refreshInterval: 30000,
    enableAIS: true,
  });

  const { hasWebXR } = useDeviceCapabilities();

  // Tab navigation
  const tabs: { id: DashboardTab; label: string; icon: string }[] = [
    { id: 'yacht-navigation', label: 'Yacht Elite', icon: '🛥️' },
    { id: 'forecast', label: 'VIP Forecast', icon: '🎯' },
    { id: 'tides', label: 'Tides', icon: '🌊' },
    { id: 'weather', label: 'Weather', icon: '☀️' },
    { id: 'marina', label: 'Marina', icon: '⚓' },
    { id: 'solunar', label: 'Solunar', icon: '🌙' },
  ];

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Handle AR mode
  const handleARMode = useCallback(() => {
    if (hasWebXR) {
      setShowARPrompt(true);
    }
  }, [hasWebXR]);

  // Current time display
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="relative w-full mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 my-8">
      {/* Main Dashboard Container - Flat Tablet Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`
          relative rounded-3xl overflow-hidden
          bg-gradient-to-br from-slate-900 via-[#001233] to-slate-900
          border-4 border-gold/30 shadow-2xl
          ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}
        `}
        style={{
          boxShadow: '0 0 60px rgba(212, 175, 55, 0.15), inset 0 0 30px rgba(0, 212, 255, 0.05)',
        }}
      >
        {/* Gold corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-gold/50 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-gold/50 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-gold/50 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-gold/50 rounded-br-3xl" />

        {/* Subtle glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        {/* Header Bar */}
        <div className="relative z-10 flex items-center justify-between p-4 md:p-6 border-b border-gold/20 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shadow-lg shadow-gold/25">
              <Anchor className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                <span className="text-gold">Elite</span> Marine Dashboard
              </h1>
              <p className="text-cyan-300 text-sm">
                {location ? 'South Padre Island' : 'Locating...'} • Premium Data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Status Indicators */}
            <div className="hidden md:flex items-center gap-2">
              {isOffline ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full border border-amber-400/30">
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-xs font-medium">Offline</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-400/30">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-medium">Live</span>
                </div>
              )}
            </div>

            {/* Time Display */}
            <div className="text-right hidden sm:block">
              <div className="text-white text-sm font-mono">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </div>
              <div className="text-gold text-xs">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => refresh(true)}
              disabled={isLoading}
              className="p-2.5 md:p-3 bg-gradient-to-r from-gold to-amber-600 text-white rounded-xl hover:from-amber-500 hover:to-gold transition-all shadow-lg shadow-gold/25 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 md:p-3 bg-slate-700/50 text-white rounded-xl hover:bg-slate-600/50 transition-all border border-slate-600/50"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {hasWebXR && (
              <button
                onClick={handleARMode}
                className="p-2.5 md:p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
                title="AR Mode"
              >
                <span className="text-lg">AR</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 px-4 md:px-6 py-3 border-b border-gold/10 bg-slate-900/50 backdrop-blur-sm overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-gold/20 to-amber-500/20 border border-gold/40 text-gold shadow-lg shadow-gold/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50 border border-transparent'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Content Area - Flat Display */}
        <div className="relative h-[500px] md:h-[600px] lg:h-[650px] bg-gradient-to-b from-slate-900/50 to-slate-900/80">
          {/* Screen glow effect */}
          <div className="absolute inset-4 rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />

          {/* Dashboard Screen Content */}
          <div className="absolute inset-0 p-2 md:p-4">
            <div className="h-full w-full bg-slate-900/95 backdrop-blur-sm rounded-xl border border-gold/10 overflow-hidden">
              <DashboardScreen activeTab={activeTab} data={data} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Bottom Bezel - Like a tablet home indicator */}
        <div className="relative z-10 flex items-center justify-center py-3 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-gold/10">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent rounded-full" />
        </div>

        {/* Error/Warning Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 left-4 right-4 z-20 bg-amber-500/90 text-white px-4 py-3 rounded-xl flex items-center justify-between"
            >
              <span className="text-sm font-medium">
                {isOffline ? 'Using cached data - Network unavailable' : error}
              </span>
              <button onClick={() => refresh(true)} className="text-xs underline">
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AR Mode Prompt Modal */}
      <AnimatePresence>
        {showARPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowARPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-gold/30 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gold mb-3">AR Mode</h3>
              <p className="text-slate-300 mb-4">
                Experience marine data overlaid on your real-world view. Point your device at the water to see tide levels, vessel positions, and weather conditions.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowARPrompt(false)}
                  className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowARPrompt(false);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-colors"
                >
                  Enter AR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
