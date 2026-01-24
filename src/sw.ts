import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// Serwist global configuration
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // NOAA Tides & Currents API
    {
      urlPattern: /^https:\/\/api\.tidesandcurrents\.noaa\.gov/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'noaa-tides-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 300, // 5 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // NOAA Weather API
    {
      urlPattern: /^https:\/\/api\.weather\.gov/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'noaa-weather-cache',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 1800, // 30 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Open-Meteo Marine API
    {
      urlPattern: /^https:\/\/marine-api\.open-meteo\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'open-meteo-marine-cache',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 600, // 10 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Open-Meteo Weather API
    {
      urlPattern: /^https:\/\/api\.open-meteo\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'open-meteo-weather-cache',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 600, // 10 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Internal Marine API routes
    {
      urlPattern: /^\/api\/marine\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'internal-marine-api-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 300, // 5 minutes
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Static images
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Google Fonts stylesheets
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    // Google Fonts webfont files
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
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
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options: NotificationOptions = {
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
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
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
