// Marine Dashboard Type Definitions

// ============== TIDE DATA ==============
export interface TideExtreme {
  time: string;
  height: number;
  type: 'high' | 'low';
}

export interface TidePrediction {
  t: string;
  v: string;
  type?: 'H' | 'L';
}

export interface DailyTide {
  date: string;
  high: { time: string; height: number } | null;
  low: { time: string; height: number } | null;
  extremes: TideExtreme[];
}

// ============== NOAA NWS WEATHER ==============
export interface NOAAWeatherPeriod {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: 'F' | 'C';
  temperatureTrend: string | null;
  probabilityOfPrecipitation: { unitCode: string; value: number | null } | null;
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
}

export interface NOAAPointsResponse {
  properties: {
    gridId: string;
    gridX: number;
    gridY: number;
    forecast: string;
    forecastHourly: string;
    forecastGridData: string;
    observationStations: string;
    relativeLocation: {
      properties: {
        city: string;
        state: string;
      };
    };
  };
}

export interface NOAAForecastResponse {
  properties: {
    updated: string;
    periods: NOAAWeatherPeriod[];
  };
}

export interface NOAAAlert {
  id: string;
  areaDesc: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';
  event: string;
  headline: string;
  description: string;
  instruction: string | null;
  onset: string;
  expires: string;
}

export interface MarineWeatherData {
  forecast: NOAAWeatherPeriod[];
  hourly: NOAAWeatherPeriod[];
  gridId: string;
  gridX: number;
  gridY: number;
  city: string;
  state: string;
  alerts: NOAAAlert[];
}

// ============== OPEN-METEO MARINE ==============
export interface OpenMeteoMarineData {
  waveHeight: number[];
  waveDirection: number[];
  wavePeriod: number[];
  swellWaveHeight: number[];
  swellWaveDirection: number[];
  swellWavePeriod: number[];
  time: string[];
}

export interface OpenMeteoWeatherData {
  windSpeed: number[];
  windDirection: number[];
  windGusts: number[];
  temperature: number[];
  precipitation: number[];
  humidity: number[];
  uvIndex: number[];
  time: string[];
  currentWeather: {
    temperature: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
  };
}

// ============== AIS VESSEL DATA ==============
export interface VesselData {
  mmsi: string;
  name?: string;
  lat: number;
  lng: number;
  speed: number; // knots
  course: number; // degrees
  heading: number; // degrees
  vesselType: number;
  timestamp: string;
  risk: 'none' | 'caution' | 'danger';
  cpa?: number; // Closest Point of Approach (nm)
  tcpa?: number; // Time to CPA (minutes)
}

export interface AISPositionReport {
  MessageType: string;
  MetaData: {
    MMSI: number;
    ShipType: number;
    ShipName?: string;
  };
  Message: {
    PositionReport: {
      Latitude: number;
      Longitude: number;
      SpeedOverGround: number;
      CourseOverGround: number;
      TrueHeading: number;
    };
  };
}

// ============== SOLUNAR DATA ==============
export interface SolunarPeriod {
  type: 'Major' | 'Minor';
  start: string;
  end: string;
  activity: number; // 0-100
  description?: string;
}

export interface SolunarData {
  periods: SolunarPeriod[];
  moonPhase: string;
  moonIllumination: number;
  sunrise: string;
  sunset: string;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

// ============== YACHT / MARINA DATA ==============
export interface Marina {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceNm: number;
  etaHours: number;
  hasHelipad: boolean;
  hasFuel: boolean;
  slipsAvailable: number;
  vhfChannel: number;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name: string;
  eta?: string;
  fuelEstimate?: number;
}

export interface YachtProfile {
  id: string;
  name: string;
  imo?: string;
  mmsi?: string;
  length: number;
  flag: string;
  fuelCapacity: number;
  cruisingSpeed: number;
  savedRoutes: RouteWaypoint[][];
}

// ============== COMBINED DASHBOARD DATA ==============
export interface CombinedMarineData {
  tides: {
    current: number;
    today: TideExtreme[];
    forecast: DailyTide[];
    station: string;
  };
  weather: MarineWeatherData | null;
  marine: OpenMeteoMarineData | null;
  openMeteoWeather: OpenMeteoWeatherData | null;
  solunar: SolunarData;
  vessels: VesselData[];
  collisionAlerts: VesselData[];
  lastUpdated: string;
  isOffline: boolean;
}

// ============== DASHBOARD STATE ==============
export type DashboardTab =
  | 'yacht-navigation'
  | 'forecast'
  | 'tides'
  | 'weather'
  | 'marina'
  | 'solunar';

export interface DashboardState {
  activeTab: DashboardTab;
  isARMode: boolean;
  isLoading: boolean;
  error: string | null;
  location: { lat: number; lng: number } | null;
  yachtProfile: YachtProfile | null;
}

// ============== API RESPONSE TYPES ==============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp?: string;
}

// ============== DEVICE CAPABILITIES ==============
export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  hasWebGL2: boolean;
  hasWebXR: boolean;
  pixelRatio: number;
  maxTextureSize: number;
  isOnline: boolean;
}

export type QualityPreset = 'high' | 'medium' | 'low';

export interface QualitySettings {
  shadows: boolean;
  antialias: boolean;
  pixelRatio: number;
  geometryDetail: number;
  postProcessing: boolean;
}

export const QUALITY_PRESETS: Record<QualityPreset, QualitySettings> = {
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

// ============== CONSTANTS ==============
export const NOAA_STATIONS = {
  SOUTH_PADRE_ISLAND: '8779748',
  BROWNSVILLE: '8770570',
  PORT_ISABEL: '8779280',
} as const;

export const DEFAULT_LOCATION = {
  lat: 25.9017,
  lng: -97.4975,
  name: 'South Padre Island, TX',
} as const;

export const CACHE_KEYS = {
  TIDE_DATA: 'lp-tide-data',
  WEATHER_DATA: 'lp-weather-data',
  MARINE_DATA: 'lp-marine-data',
  YACHT_PROFILE: 'lp-yacht-profile',
} as const;

export const CACHE_TTL = {
  TIDES: 5 * 60 * 1000, // 5 minutes
  WEATHER: 30 * 60 * 1000, // 30 minutes
  MARINE: 10 * 60 * 1000, // 10 minutes
} as const;

// ============== LUXURY THEME COLORS ==============
export const LUXURY_COLORS = {
  navy: '#001F3F',
  orange: '#FF4500',
  cyan: '#00D4FF',
  teal: '#20B2AA',
  gold: '#D4AF37',
  goldLight: '#F5E6CC',
  goldDark: '#8B7355',
  platinum: '#E5E4E2',
  deepSea: '#000814',
  oceanBlue: '#001233',
} as const;
