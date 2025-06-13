import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env['ANALYZE'] === 'true',
});

const nextConfig: NextConfig = {
  // Production environment optimization
  poweredByHeader: false, // Disable X-Powered-By header
  compress: true, // Enable gzip compression

  // Compiler optimization
  compiler: {
    // Remove console.log in production (keep console.warn/error)
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Optimization with experimental features
  experimental: {
    // Package import optimization
    optimizePackageImports: ['zustand', 'immer', 'react', 'react-dom'],
    // React Compiler (React 19 feature for automatic optimization)
    reactCompiler: true,
  },

  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96],
  },

  // TypeScript settings
  typescript: {
    // Efficient type checking for production builds
    tsconfigPath: './tsconfig.json',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
