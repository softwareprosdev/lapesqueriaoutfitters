'use client';

import { useState, useEffect } from 'react';
import type { DeviceCapabilities, QualityPreset, QualitySettings, QUALITY_PRESETS } from '@/types/marine';

const qualityPresets: Record<QualityPreset, QualitySettings> = {
  high: {
    shadows: true,
    antialias: true,
    pixelRatio: 2,
    geometryDetail: 64,
    postProcessing: true,
  },
  medium: {
    shadows: true,
    antialias: true,
    pixelRatio: 1.5,
    geometryDetail: 32,
    postProcessing: false,
  },
  low: {
    shadows: false,
    antialias: false,
    pixelRatio: 1,
    geometryDetail: 16,
    postProcessing: false,
  },
};

export function useDeviceCapabilities(): DeviceCapabilities & {
  qualityPreset: QualityPreset;
  qualitySettings: QualitySettings;
} {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isMobile: false,
    isTablet: false,
    hasWebGL2: false,
    hasWebXR: false,
    pixelRatio: 1,
    maxTextureSize: 2048,
    isOnline: true,
  });

  const [qualityPreset, setQualityPreset] = useState<QualityPreset>('high');

  useEffect(() => {
    // Check for WebGL2 support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    const hasWebGL2 = !!gl;
    const maxTextureSize = gl?.getParameter(gl.MAX_TEXTURE_SIZE) || 2048;

    // Check for WebXR support
    const hasWebXR = 'xr' in navigator;

    // Device detection
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua) && !/iPad/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua) ||
      (window.innerWidth >= 768 && window.innerWidth <= 1024 && 'ontouchstart' in window);

    // Limit pixel ratio for performance
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    // Determine quality preset based on device
    let preset: QualityPreset = 'high';
    if (isMobile) {
      preset = 'low';
    } else if (isTablet) {
      preset = 'medium';
    } else if (pixelRatio < 1.5) {
      preset = 'medium';
    }

    setCapabilities({
      isMobile,
      isTablet,
      hasWebGL2,
      hasWebXR,
      pixelRatio,
      maxTextureSize,
      isOnline: navigator.onLine,
    });

    setQualityPreset(preset);

    // Listen for online/offline events
    const handleOnline = () => setCapabilities((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCapabilities((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    ...capabilities,
    qualityPreset,
    qualitySettings: qualityPresets[qualityPreset],
  };
}

export function useGeolocation(defaultLat = 25.9017, defaultLng = -97.4975) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ lat: defaultLat, lng: defaultLng });
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError(err.message);
        setLocation({ lat: defaultLat, lng: defaultLng });
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // 5 minutes
      }
    );
  }, [defaultLat, defaultLng]);

  return { location, error, isLoading };
}
