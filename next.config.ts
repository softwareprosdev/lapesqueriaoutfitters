import type { NextConfig } from "next";
import withMDX from '@next/mdx';
import withSerwistInit from '@serwist/next';
// Temporarily disabled: import { withPayload } from "@payloadcms/next/withPayload";

// Serwist PWA configuration
const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  images: {
    // Enable modern image formats for faster loading
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcset generation
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache lifetime in seconds (1 week for better Redis caching)
    minimumCacheTTL: 604800,
    // Optimize images for mobile with lower quality but faster loading
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },
  // Enable standalone output for Docker deployment
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['sharp', 'pino', 'pino-pretty'],
  // Cache configuration for better Redis integration
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  // Fix for web3 optional dependencies that aren't available in browser
  webpack: (config, { isServer }) => {
    // Ignore optional React Native dependencies from MetaMask SDK
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Ignore optional dependencies that cause warnings
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

const withMDXConfig = withMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

// Temporarily disabled for testing shadcn/ui: export default withPayload(withMDXConfig(nextConfig));
// Chain: Serwist -> MDX -> Config
export default withSerwist(withMDXConfig(nextConfig));
