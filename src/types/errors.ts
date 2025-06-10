/**
 * アプリケーション内のエラー処理用型定義とカスタムエラークラス
 */

// エラーレベルの定義
export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';

// エラーカテゴリの定義
export type ErrorCategory =
  | 'game'
  | 'audio'
  | 'storage'
  | 'network'
  | 'ui'
  | 'validation'
  | 'system'
  | 'unknown';

// エラーコンテキスト情報
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, unknown>;
}

// エラー情報の基本構造
export interface ErrorInfo {
  id: string;
  level: ErrorLevel;
  category: ErrorCategory;
  message: string;
  context: ErrorContext;
  stack?: string;
  recoverable: boolean;
  retryable: boolean;
  userMessage?: string; // ユーザー向け表示メッセージ
}

// 基底カスタムエラークラス
export abstract class BaseAppError extends Error {
  public readonly id: string;
  public readonly level: ErrorLevel;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;
  public readonly retryable: boolean;
  public readonly userMessage?: string;

  constructor(
    message: string,
    level: ErrorLevel = 'error',
    category: ErrorCategory = 'unknown',
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, { cause: options.cause });

    this.name = this.constructor.name;
    this.id = this.generateErrorId();
    this.level = level;
    this.category = category;
    this.context = {
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...context,
    };
    this.recoverable = options.recoverable ?? true;
    this.retryable = options.retryable ?? false;
    this.userMessage = options.userMessage;

    // スタックトレースの設定
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  private generateErrorId(): string {
    return `${this.constructor.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public toErrorInfo(): ErrorInfo {
    return {
      id: this.id,
      level: this.level,
      category: this.category,
      message: this.message,
      context: this.context,
      stack: this.stack,
      recoverable: this.recoverable,
      retryable: this.retryable,
      userMessage: this.userMessage,
    };
  }

  public toString(): string {
    return `[${this.level.toUpperCase()}] ${this.category}/${this.name}: ${this.message}`;
  }
}

// ゲーム関連エラー
export class GameError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'error', 'game', context, {
      recoverable: true,
      userMessage: 'ゲーム処理でエラーが発生しました',
      ...options,
    });
  }
}

// 音声関連エラー
export class AudioError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'warning', 'audio', context, {
      recoverable: true,
      retryable: true,
      userMessage: '音声の再生に失敗しました',
      ...options,
    });
  }
}

// ストレージ関連エラー
export class StorageError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'warning', 'storage', context, {
      recoverable: true,
      retryable: false,
      userMessage: 'データの保存に失敗しました',
      ...options,
    });
  }
}

// ネットワーク関連エラー
export class NetworkError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'error', 'network', context, {
      recoverable: true,
      retryable: true,
      userMessage: 'ネットワークエラーが発生しました',
      ...options,
    });
  }
}

// UI関連エラー
export class UIError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'warning', 'ui', context, {
      recoverable: true,
      retryable: false,
      userMessage: '画面表示でエラーが発生しました',
      ...options,
    });
  }
}

// バリデーション関連エラー
export class ValidationError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'warning', 'validation', context, {
      recoverable: true,
      retryable: false,
      userMessage: '入力データが正しくありません',
      ...options,
    });
  }
}

// システム関連エラー（クリティカル）
export class SystemError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'critical', 'system', context, {
      recoverable: false,
      retryable: false,
      userMessage: 'システムエラーが発生しました。ページを再読み込みしてください',
      ...options,
    });
  }
}

// エラー処理結果の型
export interface ErrorHandlingResult {
  handled: boolean;
  retry?: boolean;
  fallback?: () => void;
  userNotification?: {
    message: string;
    level: ErrorLevel;
    duration?: number;
  };
}

// エラーハンドラーの型
export type ErrorHandler = (error: BaseAppError) => ErrorHandlingResult;

// エラー発生時のアクション型
export interface ErrorAction {
  type: 'ERROR_OCCURRED' | 'ERROR_RESOLVED' | 'ERROR_DISMISSED' | 'ERRORS_CLEARED';
  payload?: {
    error?: ErrorInfo;
    errorId?: string;
  };
}

// エラー統計情報
export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByLevel: Record<ErrorLevel, number>;
  recentErrors: ErrorInfo[];
  lastErrorTime?: number;
}

// エラーレポート設定
export interface ErrorReportConfig {
  enableConsoleLogging: boolean;
  enableUserNotifications: boolean;
  enableErrorStats: boolean;
  enableStackTrace: boolean;
  maxStoredErrors: number;
  autoReportCritical: boolean;
}

// デフォルトエラーレポート設定
export const DEFAULT_ERROR_CONFIG: ErrorReportConfig = {
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableUserNotifications: true,
  enableErrorStats: true,
  enableStackTrace: process.env.NODE_ENV === 'development',
  maxStoredErrors: 50,
  autoReportCritical: true,
} as const;

// エラーレベルの重要度（数値が大きいほど重要）
export const ERROR_LEVEL_PRIORITY: Record<ErrorLevel, number> = {
  info: 1,
  warning: 2,
  error: 3,
  critical: 4,
} as const;

// エラーメッセージのローカライゼーション対応
export interface LocalizedErrorMessages {
  [key: string]: {
    ja: string;
    en: string;
    zh: string;
    ko: string;
  };
}

// よく使用されるエラーメッセージ
export const COMMON_ERROR_MESSAGES: LocalizedErrorMessages = {
  NETWORK_TIMEOUT: {
    ja: 'ネットワークがタイムアウトしました',
    en: 'Network timeout occurred',
    zh: '网络超时',
    ko: '네트워크 타임아웃이 발생했습니다',
  },
  INVALID_INPUT: {
    ja: '入力が正しくありません',
    en: 'Invalid input provided',
    zh: '输入无效',
    ko: '잘못된 입력입니다',
  },
  PERMISSION_DENIED: {
    ja: '権限がありません',
    en: 'Permission denied',
    zh: '权限被拒绝',
    ko: '권한이 거부되었습니다',
  },
  RESOURCE_NOT_FOUND: {
    ja: 'リソースが見つかりません',
    en: 'Resource not found',
    zh: '资源未找到',
    ko: '리소스를 찾을 수 없습니다',
  },
  UNEXPECTED_ERROR: {
    ja: '予期しないエラーが発生しました',
    en: 'An unexpected error occurred',
    zh: '发生了意外错误',
    ko: '예상치 못한 오류가 발생했습니다',
  },
} as const;
