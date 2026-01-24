import type {
  TideExtreme,
  DailyTide,
  OpenMeteoMarineData,
  OpenMeteoWeatherData,
  SolunarData,
  SolunarPeriod,
  CombinedMarineData,
  VesselData,
  CACHE_TTL,
  DEFAULT_LOCATION,
  NOAA_STATIONS,
} from '@/types/marine';

// ============== NOAA CO-OPS TIDES ==============
export async function fetchTideData(
  stationId: string = '8779748',
  days: number = 10
): Promise<{ current: number; today: TideExtreme[]; forecast: DailyTide[] }> {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days);

  const startDateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${startDateStr}&end_date=${endDateStr}&station=${stationId}&product=predictions&datum=MLLW&time_zone=lst&units=english&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tide data from NOAA');
  }

  const data = await response.json();
  const predictions = data.predictions || [];

  // Calculate tide extremes (highs and lows) from predictions
  const tideExtremes: TideExtreme[] = [];
  let lastType: 'high' | 'low' | null = null;

  for (let i = 1; i < predictions.length - 1; i++) {
    const current = predictions[i];
    const prev = predictions[i - 1];
    const next = predictions[i + 1];

    const currentHeight = parseFloat(current.v);
    const prevHeight = parseFloat(prev.v);
    const nextHeight = parseFloat(next.v);

    if (
      (currentHeight > prevHeight && currentHeight > nextHeight) ||
      (currentHeight < prevHeight && currentHeight < nextHeight)
    ) {
      const type: 'high' | 'low' = currentHeight > prevHeight ? 'high' : 'low';

      if (type !== lastType) {
        tideExtremes.push({
          time: current.t,
          height: currentHeight,
          type,
        });
        lastType = type;
      }
    }
  }

  // Group by day
  const dailyTides: Record<string, TideExtreme[]> = {};
  tideExtremes.forEach((extreme) => {
    const dateKey = new Date(extreme.time).toISOString().split('T')[0];
    if (!dailyTides[dateKey]) dailyTides[dateKey] = [];
    dailyTides[dateKey].push(extreme);
  });

  const forecast: DailyTide[] = Object.entries(dailyTides).map(([date, extremes]) => {
    const high = extremes.find((e) => e.type === 'high');
    const low = extremes.find((e) => e.type === 'low');

    return {
      date,
      high: high ? { time: high.time, height: high.height } : null,
      low: low ? { time: low.time, height: low.height } : null,
      extremes,
    };
  });

  // Get current water level (approximate from nearest prediction)
  const now = new Date();
  const currentPrediction = predictions.find((p: { t: string }) => {
    const predTime = new Date(p.t);
    return Math.abs(predTime.getTime() - now.getTime()) < 30 * 60 * 1000;
  });
  const currentTide = currentPrediction ? parseFloat(currentPrediction.v) : 0;

  // Get today's extremes
  const todayStr = today.toISOString().split('T')[0];
  const todayExtremes = dailyTides[todayStr] || [];

  return {
    current: currentTide,
    today: todayExtremes,
    forecast,
  };
}

// ============== OPEN-METEO MARINE ==============
export async function fetchOpenMeteoMarine(
  lat: number,
  lng: number
): Promise<OpenMeteoMarineData> {
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&forecast_days=2`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch marine data from Open-Meteo');
  }

  const data = await response.json();

  return {
    waveHeight: data.hourly?.wave_height || [],
    waveDirection: data.hourly?.wave_direction || [],
    wavePeriod: data.hourly?.wave_period || [],
    swellWaveHeight: data.hourly?.swell_wave_height || [],
    swellWaveDirection: data.hourly?.swell_wave_direction || [],
    swellWavePeriod: data.hourly?.swell_wave_period || [],
    time: data.hourly?.time || [],
  };
}

// ============== OPEN-METEO WEATHER ==============
export async function fetchOpenMeteoWeather(
  lat: number,
  lng: number
): Promise<OpenMeteoWeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&current_weather=true&timezone=America%2FChicago&temperature_unit=fahrenheit&wind_speed_unit=mph`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data from Open-Meteo');
  }

  const data = await response.json();

  return {
    windSpeed: data.hourly?.wind_speed_10m || [],
    windDirection: data.hourly?.wind_direction_10m || [],
    windGusts: data.hourly?.wind_gusts_10m || [],
    temperature: data.hourly?.temperature_2m || [],
    precipitation: data.hourly?.precipitation || [],
    humidity: data.hourly?.relative_humidity_2m || [],
    uvIndex: data.hourly?.uv_index || [],
    time: data.hourly?.time || [],
    currentWeather: {
      temperature: data.current_weather?.temperature || 72,
      windSpeed: data.current_weather?.windspeed || 8,
      windDirection: data.current_weather?.winddirection || 180,
      weatherCode: data.current_weather?.weathercode || 0,
    },
  };
}

// ============== SOLUNAR CALCULATIONS ==============
export function calculateSolunarPeriods(): SolunarData {
  const now = new Date();

  // Simple moon phase calculation
  const lunarCycle = 29.53059;
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const daysSinceNewMoon =
    (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = daysSinceNewMoon % lunarCycle;
  const moonIllumination = Math.round(
    (1 - Math.cos((moonAge / lunarCycle) * 2 * Math.PI)) * 50
  );

  const phases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ];
  const phaseIndex = Math.floor((moonAge / lunarCycle) * 8) % 8;
  const moonPhase = phases[phaseIndex];

  // Calculate major/minor periods based on moon transit
  // Major periods occur when moon is overhead or underfoot
  // Minor periods occur at moonrise and moonset
  const baseHour = Math.floor((moonAge % 1) * 24);

  const periods: SolunarPeriod[] = [
    {
      type: 'Major',
      start: `${String((baseHour + 6) % 24).padStart(2, '0')}:00`,
      end: `${String((baseHour + 8) % 24).padStart(2, '0')}:00`,
      activity: 85 + Math.round(moonIllumination / 10),
      description: 'Peak feeding activity - Moon overhead',
    },
    {
      type: 'Major',
      start: `${String((baseHour + 18) % 24).padStart(2, '0')}:00`,
      end: `${String((baseHour + 20) % 24).padStart(2, '0')}:00`,
      activity: 90 + Math.round(moonIllumination / 10),
      description: 'Peak feeding activity - Moon underfoot',
    },
    {
      type: 'Minor',
      start: `${String((baseHour + 0) % 24).padStart(2, '0')}:00`,
      end: `${String((baseHour + 2) % 24).padStart(2, '0')}:00`,
      activity: 45 + Math.round(moonIllumination / 20),
      description: 'Moderate feeding activity - Moonrise',
    },
    {
      type: 'Minor',
      start: `${String((baseHour + 12) % 24).padStart(2, '0')}:00`,
      end: `${String((baseHour + 14) % 24).padStart(2, '0')}:00`,
      activity: 50 + Math.round(moonIllumination / 20),
      description: 'Moderate feeding activity - Moonset',
    },
  ];

  // Rating based on moon phase
  let rating: SolunarData['rating'] = 'Fair';
  if (moonPhase === 'New Moon' || moonPhase === 'Full Moon') {
    rating = 'Excellent';
  } else if (moonPhase === 'First Quarter' || moonPhase === 'Last Quarter') {
    rating = 'Good';
  }

  return {
    periods,
    moonPhase,
    moonIllumination,
    sunrise: '06:45', // Would be calculated properly in production
    sunset: '19:15',
    rating,
  };
}

// ============== COLLISION RISK CALCULATION ==============
export function calculateCollisionRisk(
  vessel: Omit<VesselData, 'risk'>,
  ownLat: number = 25.9017,
  ownLng: number = -97.4975,
  ownSpeed: number = 0,
  ownCourse: number = 0
): VesselData {
  // Haversine distance calculation
  const vesselLat = (vessel.lat * Math.PI) / 180;
  const vesselLng = (vessel.lng * Math.PI) / 180;
  const ownLatRad = (ownLat * Math.PI) / 180;
  const ownLngRad = (ownLng * Math.PI) / 180;

  const dLat = vesselLat - ownLatRad;
  const dLng = vesselLng - ownLngRad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(ownLatRad) *
      Math.cos(vesselLat) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = 6371 * c; // km
  const distanceNm = distance * 0.539957;

  // If vessel is far away, no risk
  if (distanceNm > 50) {
    return { ...vessel, risk: 'none' };
  }

  // Calculate relative velocity
  const vesselSpeedMs = vessel.speed * 0.514444;
  const ownSpeedMs = ownSpeed * 0.514444;

  const vesselCourseRad = (vessel.course * Math.PI) / 180;
  const ownCourseRad = (ownCourse * Math.PI) / 180;

  const relVelX =
    vesselSpeedMs * Math.sin(vesselCourseRad) -
    ownSpeedMs * Math.sin(ownCourseRad);
  const relVelY =
    vesselSpeedMs * Math.cos(vesselCourseRad) -
    ownSpeedMs * Math.cos(ownCourseRad);

  const relVelMag = Math.sqrt(relVelX * relVelX + relVelY * relVelY);

  if (relVelMag < 0.1) {
    return {
      ...vessel,
      risk: distanceNm < 3 ? 'caution' : 'none',
      cpa: distanceNm,
    };
  }

  // CPA and TCPA calculation
  const cpa = distanceNm / relVelMag * 60;
  const tcpa = distanceNm / relVelMag;

  let risk: VesselData['risk'] = 'none';
  if (cpa < 1 && tcpa < 15) {
    risk = 'danger';
  } else if (cpa < 3 && tcpa < 30) {
    risk = 'caution';
  }

  return { ...vessel, risk, cpa, tcpa };
}

// ============== LOCAL STORAGE CACHING ==============
export function getCachedData<T>(key: string, maxAge: number): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > maxAge) {
      localStorage.removeItem(key);
      return null;
    }

    return data as T;
  } catch {
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch {
    // localStorage might be full
    console.warn('Failed to cache data:', key);
  }
}

// ============== MOCK DATA FOR OFFLINE/ERROR FALLBACK ==============
export function getMockMarineData(): CombinedMarineData {
  const now = new Date();

  return {
    tides: {
      current: 0.8,
      today: [
        {
          time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          height: 1.2,
          type: 'high',
        },
        {
          time: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
          height: 0.3,
          type: 'low',
        },
      ],
      forecast: [],
      station: 'South Padre Island',
    },
    weather: null,
    marine: {
      waveHeight: [1.2, 1.3, 1.1],
      waveDirection: [180, 185, 175],
      wavePeriod: [6, 7, 6],
      swellWaveHeight: [0.8, 0.9, 0.7],
      swellWaveDirection: [200, 205, 195],
      swellWavePeriod: [12, 13, 11],
      time: [],
    },
    openMeteoWeather: {
      windSpeed: [8, 10, 12],
      windDirection: [180, 185, 175],
      windGusts: [12, 15, 18],
      temperature: [72, 74, 76],
      precipitation: [0, 0, 0],
      humidity: [65, 68, 70],
      uvIndex: [6, 7, 8],
      time: [],
      currentWeather: {
        temperature: 72,
        windSpeed: 8,
        windDirection: 180,
        weatherCode: 0,
      },
    },
    solunar: calculateSolunarPeriods(),
    vessels: [],
    collisionAlerts: [],
    lastUpdated: now.toISOString(),
    isOffline: true,
  };
}
