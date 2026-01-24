'use client';

import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Maximize2, Wifi, WifiOff, Anchor } from 'lucide-react';

import { TabletModel } from './TabletModel';
import { DashboardScreen } from './DashboardScreen';
import { useMarineData } from './hooks/useMarineData';
import { useDeviceCapabilities, useGeolocation } from './hooks/useDeviceCapabilities';
import type { DashboardTab } from '@/types/marine';

// Loading skeleton for 3D canvas
function DashboardSkeleton() {
  return (
    <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden flex items-center justify-center">
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

// Main 3D Dashboard Component
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

  const { isMobile, isTablet, hasWebXR, qualitySettings } = useDeviceCapabilities();

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
      {/* Main Dashboard Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
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
        {/* Luxury Glow Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
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

        {/* 3D Canvas + Dashboard Content */}
        <div className="relative h-[550px] md:h-[650px] lg:h-[700px]">
          {/* 3D Background Scene */}
          <div className="absolute inset-0">
            <Canvas
              shadows={qualitySettings.shadows}
              dpr={[1, qualitySettings.pixelRatio]}
              gl={{
                antialias: qualitySettings.antialias,
                alpha: true,
                powerPreference: 'high-performance',
              }}
            >
              <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                <ambientLight intensity={0.4} />
                <directionalLight
                  position={[10, 10, 5]}
                  intensity={1}
                  castShadow={qualitySettings.shadows}
                  shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-10, -10, -5]} intensity={0.3} color="#D4AF37" />
                <pointLight position={[10, -10, 5]} intensity={0.2} color="#00D4FF" />

                <TabletModel
                  position={[0, 0, 0]}
                  rotation={[0.1, 0, 0]}
                  scale={isMobile ? 0.85 : isTablet ? 0.95 : 1}
                  geometryDetail={qualitySettings.geometryDetail}
                />

                <OrbitControls
                  enableZoom={true}
                  enablePan={false}
                  enableRotate={true}
                  minDistance={5}
                  maxDistance={15}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 1.5}
                  minAzimuthAngle={-Math.PI / 4}
                  maxAzimuthAngle={Math.PI / 4}
                  rotateSpeed={0.5}
                  zoomSpeed={0.5}
                />

                <Environment preset="night" />
              </Suspense>
            </Canvas>
          </div>

          {/* Dashboard Screen Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="pointer-events-auto w-[90%] max-w-[900px] h-[85%] bg-slate-900/95 backdrop-blur-md rounded-2xl border border-gold/20 overflow-hidden shadow-2xl"
              style={{
                transform: `perspective(1200px) rotateX(5deg)`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.1)',
              }}
            >
              <DashboardScreen activeTab={activeTab} data={data} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Error/Warning Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 z-20 bg-amber-500/90 text-white px-4 py-3 rounded-xl flex items-center justify-between"
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
                    // AR implementation would go here
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
