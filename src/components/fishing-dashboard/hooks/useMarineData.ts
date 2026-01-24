'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  CombinedMarineData,
  VesselData,
  MarineWeatherData,
  AISPositionReport,
  CACHE_TTL,
  CACHE_KEYS,
} from '@/types/marine';
import {
  fetchTideData,
  fetchOpenMeteoMarine,
  fetchOpenMeteoWeather,
  calculateSolunarPeriods,
  calculateCollisionRisk,
  getCachedData,
  setCachedData,
  getMockMarineData,
} from '@/lib/marine/noaa-nws';

const AIS_WEBSOCKET_URL = 'wss://stream.aisstream.io/v0/stream';
const CACHE_KEY = 'lp-combined-marine-data';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface UseMarineDataOptions {
  lat?: number;
  lng?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableAIS?: boolean;
}

interface UseMarineDataReturn {
  data: CombinedMarineData | null;
  isLoading: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
  isOffline: boolean;
}

export function useMarineData(options: UseMarineDataOptions = {}): UseMarineDataReturn {
  const {
    lat = 25.9017,
    lng = -97.4975,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableAIS = true,
  } = options;

  const [data, setData] = useState<CombinedMarineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const vesselsRef = useRef<Map<string, VesselData>>(new Map());
  const collisionAlertsRef = useRef<VesselData[]>([]);

  // AIS WebSocket connection
  const connectAIS = useCallback(() => {
    if (!enableAIS || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      wsRef.current = new WebSocket(AIS_WEBSOCKET_URL);

      wsRef.current.onopen = () => {
        console.log('AIS WebSocket connected');
        const subscription = {
          APIKey: '', // Public demo access
          BoundingBoxes: [[[24.5, -98.5], [27.5, -96.5]]], // South Texas coast
        };
        wsRef.current?.send(JSON.stringify(subscription));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: AISPositionReport = JSON.parse(event.data);
          if (message.MessageType === 'PositionReport') {
            const vessel: Omit<VesselData, 'risk'> = {
              mmsi: message.MetaData.MMSI.toString(),
              name: message.MetaData.ShipName,
              lat: message.Message.PositionReport.Latitude,
              lng: message.Message.PositionReport.Longitude,
              speed: message.Message.PositionReport.SpeedOverGround || 0,
              course: message.Message.PositionReport.CourseOverGround || 0,
              heading:
                message.Message.PositionReport.TrueHeading ||
                message.Message.PositionReport.CourseOverGround ||
                0,
              vesselType: message.MetaData.ShipType || 0,
              timestamp: new Date().toISOString(),
            };

            const vesselWithRisk = calculateCollisionRisk(vessel, lat, lng);
            vesselsRef.current.set(vessel.mmsi, vesselWithRisk);

            // Clean up old vessels (older than 5 minutes)
            const now = Date.now();
            vesselsRef.current.forEach((v, mmsi) => {
              if (now - new Date(v.timestamp).getTime() > 5 * 60 * 1000) {
                vesselsRef.current.delete(mmsi);
              }
            });

            // Update collision alerts
            collisionAlertsRef.current = Array.from(vesselsRef.current.values()).filter(
              (v) => v.risk === 'danger' || v.risk === 'caution'
            );

            // Update state periodically (not on every message)
            setData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                vessels: Array.from(vesselsRef.current.values()),
                collisionAlerts: collisionAlertsRef.current,
              };
            });
          }
        } catch (err) {
          console.error('Error parsing AIS message:', err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('AIS WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('AIS WebSocket closed');
        // Reconnect after 5 seconds
        setTimeout(connectAIS, 5000);
      };
    } catch (err) {
      console.error('Failed to connect AIS WebSocket:', err);
    }
  }, [enableAIS, lat, lng]);

  // Fetch all marine data
  const fetchAllData = useCallback(
    async (force = false) => {
      // Check cache first
      if (!force) {
        const cached = getCachedData<CombinedMarineData>(CACHE_KEY, CACHE_EXPIRY);
        if (cached) {
          setData({
            ...cached,
            vessels: Array.from(vesselsRef.current.values()),
            collisionAlerts: collisionAlertsRef.current,
          });
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [tidesResult, marineResult, weatherResult, nwsResult] = await Promise.allSettled([
          fetchTideData('8779748', 10),
          fetchOpenMeteoMarine(lat, lng),
          fetchOpenMeteoWeather(lat, lng),
          fetch(`/api/marine/weather?lat=${lat}&lon=${lng}`).then((r) => r.json()),
        ]);

        const tides =
          tidesResult.status === 'fulfilled'
            ? tidesResult.value
            : { current: 0, today: [], forecast: [] };

        const marine =
          marineResult.status === 'fulfilled' ? marineResult.value : null;

        const weather =
          weatherResult.status === 'fulfilled' ? weatherResult.value : null;

        const nws: MarineWeatherData | null =
          nwsResult.status === 'fulfilled' && nwsResult.value.success
            ? nwsResult.value.data
            : null;

        const combinedData: CombinedMarineData = {
          tides: {
            current: tides.current,
            today: tides.today,
            forecast: tides.forecast,
            station: 'South Padre Island',
          },
          weather: nws,
          marine,
          openMeteoWeather: weather,
          solunar: calculateSolunarPeriods(),
          vessels: Array.from(vesselsRef.current.values()),
          collisionAlerts: collisionAlertsRef.current,
          lastUpdated: new Date().toISOString(),
          isOffline: false,
        };

        setData(combinedData);
        setCachedData(CACHE_KEY, combinedData);
        setIsOffline(false);
      } catch (err) {
        console.error('Error fetching marine data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch marine data');

        // Try to use cached data or mock data
        const cached = getCachedData<CombinedMarineData>(CACHE_KEY, Infinity);
        if (cached) {
          setData({ ...cached, isOffline: true });
          setIsOffline(true);
        } else {
          setData(getMockMarineData());
          setIsOffline(true);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [lat, lng]
  );

  // Initial fetch
  useEffect(() => {
    fetchAllData();
    connectAIS();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchAllData, connectAIS]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAllData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAllData]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchAllData(true);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchAllData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchAllData,
    isOffline,
  };
}
