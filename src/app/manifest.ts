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
        src: '/favicon.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/lapescerialogo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
