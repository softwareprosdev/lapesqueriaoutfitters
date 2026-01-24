import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'La Pesqueria Elite Marine Dashboard',
    short_name: 'LP Marine',
    description:
      'Premium 3D fishing chart and marine conditions dashboard for superyacht owners and luxury anglers',
    start_url: '/?source=pwa',
    display: 'standalone',
    orientation: 'any',
    background_color: '#001F3F',
    theme_color: '#D4AF37',
    categories: ['weather', 'sports', 'navigation', 'lifestyle'],
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/dashboard-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        // @ts-expect-error - form_factor is valid but not in types yet
        form_factor: 'wide',
      },
      {
        src: '/screenshots/dashboard-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        // @ts-expect-error - form_factor is valid but not in types yet
        form_factor: 'narrow',
      },
    ],
    shortcuts: [
      {
        name: 'Tide Chart',
        short_name: 'Tides',
        description: 'View current tide conditions',
        url: '/?tab=tides&source=pwa',
        icons: [{ src: '/icons/tides-shortcut.png', sizes: '96x96' }],
      },
      {
        name: 'Weather Forecast',
        short_name: 'Weather',
        description: 'Check marine weather',
        url: '/?tab=weather&source=pwa',
        icons: [{ src: '/icons/weather-shortcut.png', sizes: '96x96' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
