/**
 * Unified Logging System
 *
 * Environment-aware logging with proper level control and formatting
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogContext {
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.level = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  // Configuration-specific logging helper
  config(message: string, context?: LogContext): void {
    this.info(`⚙️ ${message}`, { ...context, component: 'Config' });
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const component = context?.component ? `[${context.component}]` : '';
    const action = context?.action ? `(${context.action})` : '';

    return `${timestamp} ${level} ${component}${action} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, context));
      if (context?.metadata) {
        console.error('Metadata:', context.metadata);
      }
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, context));
      if (context?.metadata) {
        console.warn('Metadata:', context.metadata);
      }
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, context));
      if (context?.metadata) {
        console.info('Metadata:', context.metadata);
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, context));
      if (context?.metadata) {
        console.log('Metadata:', context.metadata);
      }
    }
  }

  // Performance logging helper
  performance(label: string, duration: number, context?: LogContext): void {
    this.debug(`📊 ${label}: ${duration.toFixed(2)}ms`, context);
  }

  // Game-specific helpers
  audio(message: string, context?: LogContext): void {
    this.info(`♪ ${message}`, { ...context, component: 'Audio' });
  }

  animation(message: string, context?: LogContext): void {
    this.debug(`🎮 ${message}`, { ...context, component: 'Animation' });
  }

  game(message: string, context?: LogContext): void {
    this.debug(`🎯 ${message}`, { ...context, component: 'Game' });
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience exports for common use cases
export const log = {
  error: (message: string, context?: LogContext) => logger.error(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  performance: (label: string, duration: number, context?: LogContext) =>
    logger.performance(label, duration, context),
  audio: (message: string, context?: LogContext) => logger.audio(message, context),
  animation: (message: string, context?: LogContext) => logger.animation(message, context),
  game: (message: string, context?: LogContext) => logger.game(message, context),
  config: (message: string, context?: LogContext) => logger.config(message, context),
};
