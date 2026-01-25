import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'serwist';

// Serwist global configuration
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: any;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // NOAA Tides & Currents API
    {
      matcher: /^https:\/\/api\.tidesandcurrents\.noaa\.gov/,
      handler: new StaleWhileRevalidate({
        cacheName: 'noaa-tides-cache',
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              if (response && response.status === 200) {
                return response;
              }
              return null;
            },
          },
        ],
      }),
    },
    // NOAA Weather API
    {
      matcher: /^https:\/\/api\.weather\.gov/,
      handler: new StaleWhileRevalidate({
        cacheName: 'noaa-weather-cache',
      }),
    },
    // Open-Meteo Marine API
    {
      matcher: /^https:\/\/marine-api\.open-meteo\.com/,
      handler: new StaleWhileRevalidate({
        cacheName: 'open-meteo-marine-cache',
      }),
    },
    // Open-Meteo Weather API
    {
      matcher: /^https:\/\/api\.open-meteo\.com/,
      handler: new StaleWhileRevalidate({
        cacheName: 'open-meteo-weather-cache',
      }),
    },
    // Internal Marine API routes
    {
      matcher: /\/api\/marine\//,
      handler: new NetworkFirst({
        cacheName: 'internal-marine-api-cache',
      }),
    },
    // Static images
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
      handler: new CacheFirst({
        cacheName: 'static-images-cache',
      }),
    },
    // Google Fonts stylesheets
    {
      matcher: /^https:\/\/fonts\.googleapis\.com/,
      handler: new StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
      }),
    },
    // Google Fonts webfont files
    {
      matcher: /^https:\/\/fonts\.gstatic\.com/,
      handler: new CacheFirst({
        cacheName: 'google-fonts-webfonts',
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Handle push notifications for marine alerts
self.addEventListener('push', (event: any) => {
  if (!event.data) return;

  const data = event.data.json();

  const options: any = {
    body: data.body || 'New marine alert available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      {
        action: 'open',
        title: 'View Details',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'La Pesqueria Marine Alert',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList: any[]) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
