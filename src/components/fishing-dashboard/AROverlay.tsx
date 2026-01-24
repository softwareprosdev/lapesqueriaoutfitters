'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
import { Text, Billboard } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Waves, Wind, Anchor, AlertTriangle } from 'lucide-react';
import type { CombinedMarineData } from '@/types/marine';

// Create XR store for session management
const xrStore = createXRStore({
  depthSensing: true,
  optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'hit-test'],
});

interface AROverlayProps {
  isActive: boolean;
  onClose: () => void;
  data: CombinedMarineData | null;
}

// AR Data Display Component
function ARMarineDataDisplay({ data }: { data: CombinedMarineData | null }) {
  const currentTide = data?.tides?.current || 0;
  const waveHeight = data?.marine?.waveHeight?.[0] || 0;
  const windSpeed = data?.openMeteoWeather?.currentWeather?.windSpeed || 0;
  const alerts = data?.collisionAlerts || [];

  return (
    <group position={[0, 0, -2]}>
      {/* Tide Level Display */}
      <Billboard position={[-1.5, 0.5, 0]} follow lockX={false} lockY={false} lockZ={false}>
        <group>
          <mesh>
            <planeGeometry args={[1.2, 0.8]} />
            <meshBasicMaterial color="#001233" transparent opacity={0.85} />
          </mesh>
          <Text
            position={[0, 0.2, 0.01]}
            fontSize={0.12}
            color="#00D4FF"
            anchorX="center"
            anchorY="middle"
          >
            TIDE LEVEL
          </Text>
          <Text
            position={[0, -0.1, 0.01]}
            fontSize={0.25}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {currentTide.toFixed(1)} ft
          </Text>
        </group>
      </Billboard>

      {/* Wave Height Display */}
      <Billboard position={[0, 0.5, 0]} follow lockX={false} lockY={false} lockZ={false}>
        <group>
          <mesh>
            <planeGeometry args={[1.2, 0.8]} />
            <meshBasicMaterial color="#001233" transparent opacity={0.85} />
          </mesh>
          <Text
            position={[0, 0.2, 0.01]}
            fontSize={0.12}
            color="#20B2AA"
            anchorX="center"
            anchorY="middle"
          >
            WAVE HEIGHT
          </Text>
          <Text
            position={[0, -0.1, 0.01]}
            fontSize={0.25}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {waveHeight.toFixed(1)} m
          </Text>
        </group>
      </Billboard>

      {/* Wind Speed Display */}
      <Billboard position={[1.5, 0.5, 0]} follow lockX={false} lockY={false} lockZ={false}>
        <group>
          <mesh>
            <planeGeometry args={[1.2, 0.8]} />
            <meshBasicMaterial color="#001233" transparent opacity={0.85} />
          </mesh>
          <Text
            position={[0, 0.2, 0.01]}
            fontSize={0.12}
            color="#D4AF37"
            anchorX="center"
            anchorY="middle"
          >
            WIND SPEED
          </Text>
          <Text
            position={[0, -0.1, 0.01]}
            fontSize={0.25}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {windSpeed.toFixed(0)} mph
          </Text>
        </group>
      </Billboard>

      {/* Collision Alert (if any) */}
      {alerts.length > 0 && (
        <Billboard position={[0, -0.8, 0]} follow lockX={false} lockY={false} lockZ={false}>
          <group>
            <mesh>
              <planeGeometry args={[2, 0.6]} />
              <meshBasicMaterial color="#DC2626" transparent opacity={0.9} />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.15}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {`VESSEL ALERT: ${alerts.length} in range`}
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
}

export function AROverlay({ isActive, onClose, data }: AROverlayProps) {
  const [isXRSupported, setIsXRSupported] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check XR support
  useEffect(() => {
    async function checkSupport() {
      if ('xr' in navigator) {
        try {
          const isSupported = await (navigator as Navigator & { xr: XRSystem }).xr.isSessionSupported('immersive-ar');
          setIsXRSupported(isSupported);
        } catch {
          setIsXRSupported(false);
        }
      }
    }
    checkSupport();
  }, []);

  // Start AR session
  const startARSession = useCallback(async () => {
    try {
      await xrStore.enterAR();
      setIsSessionActive(true);
      setError(null);
    } catch (err) {
      console.error('Failed to start AR session:', err);
      setError('Failed to start AR session. Please ensure you\'re using a compatible device and browser.');
    }
  }, []);

  // End AR session
  const endARSession = useCallback(() => {
    xrStore.getState().session?.end();
    setIsSessionActive(false);
    onClose();
  }, [onClose]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* AR Canvas */}
        {isSessionActive && (
          <Canvas>
            <XR store={xrStore}>
              <XROrigin />
              <ambientLight intensity={0.5} />
              <directionalLight position={[0, 5, 5]} intensity={1} />
              <ARMarineDataDisplay data={data} />
            </XR>
          </Canvas>
        )}

        {/* Pre-AR UI */}
        {!isSessionActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#001233] to-slate-900">
            <div className="max-w-md w-full p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-4xl">AR</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">Augmented Reality Mode</h2>
              <p className="text-slate-300 mb-6">
                View marine data overlaid on your real-world view. Point your device at the water to see tide levels, wave conditions, and vessel alerts.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {!isXRSupported ? (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-400 text-sm">
                    WebXR AR is not supported on this device/browser. Try using Chrome on Android or Safari on iOS 15+.
                  </p>
                </div>
              ) : (
                <button
                  onClick={startARSession}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
                >
                  Enter AR Experience
                </button>
              )}

              <button
                onClick={onClose}
                className="mt-4 w-full py-3 bg-slate-700/50 text-white rounded-xl hover:bg-slate-600/50 transition-colors"
              >
                Cancel
              </button>

              {/* Feature List */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <Waves className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
                  <span className="text-xs text-slate-400">Tide Levels</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <Wind className="w-6 h-6 mx-auto text-gold mb-2" />
                  <span className="text-xs text-slate-400">Wind Data</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <Anchor className="w-6 h-6 mx-auto text-purple-400 mb-2" />
                  <span className="text-xs text-slate-400">Vessel Alerts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Close Button (visible during AR session) */}
        {isSessionActive && (
          <button
            onClick={endARSession}
            className="absolute top-6 right-6 p-3 bg-red-500/80 text-white rounded-full shadow-lg z-10"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* AR HUD (visible during AR session) */}
        {isSessionActive && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
            <div className="px-4 py-2 bg-slate-900/80 text-white rounded-full text-sm backdrop-blur-sm border border-gold/30">
              <span className="text-gold">AR Active</span> • Point at water
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
