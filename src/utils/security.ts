/**
 * セキュリティ強化設定
 * CSP、セキュリティヘッダー、HTTPS強制などの設定
 */

/**
 * Content Security Policy (CSP) 設定
 */
export const CSP_POLICY = {
  // 開発環境用（より緩い設定）
  development: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Vite HMRのため
      "'unsafe-eval'", // React開発モードのため
      'https://vercel.live',
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'media-src': ["'self'", 'data:', 'blob:'],
    'connect-src': [
      "'self'",
      'https://vercel.live',
      'wss://vercel.live',
      'https://*.sentry.io', // Sentry監視
      'ws://localhost:*', // HMR
      'http://localhost:*', // 開発サーバー
    ],
    'worker-src': ["'self'", 'blob:'],
    'frame-ancestors': ["'none'"], // X-Frame-Options: DENY相当
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [], // HTTPS強制
  },

  // プロダクション環境用（厳格な設定）
  production: {
    'default-src': ["'self'"],
    'script-src': ["'self'", 'https://*.vercel.app'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], // Tailwind inline styles
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'https:'],
    'media-src': ["'self'", 'data:', 'blob:'],
    'connect-src': [
      "'self'",
      'https://*.vercel.app',
      'https://*.sentry.io', // Sentry監視
    ],
    'worker-src': ["'self'", 'blob:'],
    'frame-ancestors': ["'none'"], // Clickjacking防止
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [], // HTTPS強制
    'block-all-mixed-content': [], // Mixed Content防止
  },
};

/**
 * CSPポリシーを文字列に変換
 */
export function buildCSPString(environment: 'development' | 'production'): string {
  const policy = CSP_POLICY[environment];

  return Object.entries(policy)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive; // upgrade-insecure-requests など
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * セキュリティヘッダー設定
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': (environment: 'development' | 'production') =>
    buildCSPString(environment),

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // Content Type Sniffing防止
  'X-Content-Type-Options': 'nosniff',

  // Clickjacking防止
  'X-Frame-Options': 'DENY',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // HSTS (HTTPS強制) - プロダクションのみ
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Feature Policy / Permissions Policy
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'encrypted-media=()',
    'picture-in-picture=()',
  ].join(', '),

  // Cache Control (セキュリティ関連)
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

/**
 * セキュリティヘッダーをResponseに適用
 */
export function applySecurityHeaders(
  headers: Headers,
  environment: 'development' | 'production' = 'production'
): void {
  // 基本セキュリティヘッダー
  headers.set('X-XSS-Protection', SECURITY_HEADERS['X-XSS-Protection']);
  headers.set('X-Content-Type-Options', SECURITY_HEADERS['X-Content-Type-Options']);
  headers.set('X-Frame-Options', SECURITY_HEADERS['X-Frame-Options']);
  headers.set('Referrer-Policy', SECURITY_HEADERS['Referrer-Policy']);
  headers.set('Permissions-Policy', SECURITY_HEADERS['Permissions-Policy']);

  // CSP設定
  headers.set('Content-Security-Policy', SECURITY_HEADERS['Content-Security-Policy'](environment));

  // プロダクション環境でのみHSTS
  if (environment === 'production') {
    headers.set('Strict-Transport-Security', SECURITY_HEADERS['Strict-Transport-Security']);
  }
}

/**
 * HTTPS強制チェック
 */
export function enforceHTTPS(request: Request): Response | null {
  const url = new URL(request.url);

  // 開発環境ではスキップ
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return null;
  }

  // HTTPSでない場合はリダイレクト
  if (url.protocol !== 'https:') {
    const httpsUrl = url.toString().replace('http://', 'https://');
    return new Response(null, {
      status: 301,
      headers: {
        Location: httpsUrl,
        'Strict-Transport-Security': SECURITY_HEADERS['Strict-Transport-Security'],
      },
    });
  }

  return null;
}

/**
 * 疑わしいリクエストの検出
 */
export function detectSuspiciousRequest(request: Request): boolean {
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';

  // 基本的な攻撃パターンの検出
  const suspiciousPatterns = [
    // SQL Injection
    /\b(union|select|insert|update|delete|drop|exec|script)\b/i,
    // XSS
    /<script|javascript:|vbscript:|onload=|onerror=/i,
    // Path Traversal
    /\.\.\//,
    // Command Injection
    /[;&|`$()]/,
  ];

  // URLパラメータとパスをチェック
  const checkString = url.pathname + url.search;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      return true;
    }
  }

  // 疑わしいUser-Agent
  const suspiciousUAs = [/sqlmap/i, /nikto/i, /nmap/i, /burp/i, /curl.*bot/i];

  for (const pattern of suspiciousUAs) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }

  return false;
}

/**
 * レート制限チェック（簡易版）
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  clientIP: string,
  maxRequests = 100,
  windowMs = 60000 // 1分
): boolean {
  const now = Date.now();
  const clientData = requestCounts.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // 新しいウィンドウ
    requestCounts.set(clientIP, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (clientData.count >= maxRequests) {
    return false; // レート制限超過
  }

  clientData.count++;
  return true;
}

/**
 * セキュリティ監査ログ
 */
export function logSecurityEvent(
  event: 'suspicious_request' | 'rate_limit_exceeded' | 'https_redirect' | 'csp_violation',
  details: {
    ip?: string;
    userAgent?: string;
    url?: string;
    timestamp?: number;
    [key: string]: unknown;
  }
): void {
  const logData = {
    event,
    timestamp: Date.now(),
    ...details,
  };

  // プロダクション環境ではSentryに送信
  if (import.meta.env.PROD) {
    try {
      // Sentryがロードされている場合のみ
      const { GameSentry } = require('./sentry');
      GameSentry.captureMessage(`Security Event: ${event}`, 'warning');
    } catch {
      // Sentryが利用できない場合はコンソールログ
      console.warn('Security Event:', logData);
    }
  } else {
    console.warn('Security Event:', logData);
  }
}

/**
 * セキュリティミドルウェア（統合）
 */
export function securityMiddleware(request: Request): Response | null {
  const clientIP =
    request.headers.get('X-Forwarded-For') || request.headers.get('X-Real-IP') || 'unknown';

  // HTTPS強制
  const httpsRedirect = enforceHTTPS(request);
  if (httpsRedirect) {
    logSecurityEvent('https_redirect', {
      ip: clientIP,
      url: request.url,
    });
    return httpsRedirect;
  }

  // 疑わしいリクエストの検出
  if (detectSuspiciousRequest(request)) {
    logSecurityEvent('suspicious_request', {
      ip: clientIP,
      userAgent: request.headers.get('User-Agent') || 'unknown',
      url: request.url,
    });

    return new Response('Forbidden', { status: 403 });
  }

  // レート制限
  if (!checkRateLimit(clientIP)) {
    logSecurityEvent('rate_limit_exceeded', {
      ip: clientIP,
      userAgent: request.headers.get('User-Agent') || 'unknown',
    });

    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
      },
    });
  }

  return null; // 続行
}
