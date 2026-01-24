import { NextRequest, NextResponse } from 'next/server';
import type {
  NOAAPointsResponse,
  NOAAForecastResponse,
  NOAAAlert,
  MarineWeatherData,
  ApiResponse,
} from '@/types/marine';

const USER_AGENT = '(La Pesqueria Outfitters, contact@lapesqueria.com)';
const NOAA_API_BASE = 'https://api.weather.gov';

async function fetchWithUserAgent(url: string, revalidate: number = 1800) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/geo+json',
    },
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`NOAA API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '25.9017';
  const lon = searchParams.get('lon') || '-97.4975';

  try {
    // Step 1: Get grid point from coordinates
    const pointsData: NOAAPointsResponse = await fetchWithUserAgent(
      `${NOAA_API_BASE}/points/${lat},${lon}`,
      3600 // Cache grid point for 1 hour
    );

    const {
      gridId,
      gridX,
      gridY,
      forecast: forecastUrl,
      forecastHourly: forecastHourlyUrl,
      relativeLocation,
    } = pointsData.properties;

    // Step 2: Fetch forecast, hourly forecast, and alerts in parallel
    const [forecastRes, hourlyRes, alertsRes] = await Promise.all([
      fetchWithUserAgent(forecastUrl, 1800), // 30 min cache
      fetchWithUserAgent(forecastHourlyUrl, 1800), // 30 min cache
      fetchWithUserAgent(
        `${NOAA_API_BASE}/alerts/active?point=${lat},${lon}`,
        300 // 5 min cache for alerts
      ).catch(() => ({ features: [] })), // Graceful fallback
    ]);

    const forecast: NOAAForecastResponse = forecastRes;
    const hourly: NOAAForecastResponse = hourlyRes;

    // Extract alerts
    const alerts: NOAAAlert[] = (alertsRes.features || []).map(
      (feature: { properties: NOAAAlert }) => ({
        id: feature.properties.id || '',
        areaDesc: feature.properties.areaDesc || '',
        severity: feature.properties.severity || 'Unknown',
        urgency: feature.properties.urgency || 'Unknown',
        event: feature.properties.event || '',
        headline: feature.properties.headline || '',
        description: feature.properties.description || '',
        instruction: feature.properties.instruction,
        onset: feature.properties.onset || '',
        expires: feature.properties.expires || '',
      })
    );

    // Filter for marine-relevant alerts
    const marineAlerts = alerts.filter(
      (alert) =>
        alert.event.toLowerCase().includes('marine') ||
        alert.event.toLowerCase().includes('coastal') ||
        alert.event.toLowerCase().includes('rip current') ||
        alert.event.toLowerCase().includes('small craft') ||
        alert.event.toLowerCase().includes('gale') ||
        alert.event.toLowerCase().includes('storm') ||
        alert.event.toLowerCase().includes('hurricane') ||
        alert.event.toLowerCase().includes('tropical')
    );

    const data: MarineWeatherData = {
      forecast: forecast.properties.periods,
      hourly: hourly.properties.periods.slice(0, 48), // Next 48 hours
      gridId,
      gridX,
      gridY,
      city: relativeLocation?.properties?.city || 'Unknown',
      state: relativeLocation?.properties?.state || 'TX',
      alerts: marineAlerts,
    };

    const response: ApiResponse<MarineWeatherData> = {
      success: true,
      data,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('NOAA NWS API Error:', error);

    const response: ApiResponse<null> = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch weather data from NOAA',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 500 });
  }
}
