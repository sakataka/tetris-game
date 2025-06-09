import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番環境最適化
  poweredByHeader: false, // X-Powered-By ヘッダーを無効化
  compress: true, // gzip圧縮を有効化
  
  // コンパイラー最適化
  compiler: {
    // 本番環境でconsole.logを除去（console.warn/errorは保持）
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // 実験的機能による最適化
  experimental: {
    // パッケージインポートの最適化
    optimizePackageImports: [
      'zustand',
      'immer',
      'react',
      'react-dom'
    ],
    
    
  },
  
  
  // 画像最適化設定
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96],
  },
  
  // TypeScript設定
  typescript: {
    // 本番ビルド時の型チェック効率化
    tsconfigPath: './tsconfig.json',
  },
  
  // セキュリティヘッダー
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

export default nextConfig;
