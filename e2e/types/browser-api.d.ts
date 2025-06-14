/**
 * Browser API type definitions for E2E tests
 * Provides proper TypeScript types for browser APIs that don't have standard definitions
 */

declare global {
  // Chrome Performance Memory API
  interface PerformanceMemory {
    readonly usedJSHeapSize: number;
    readonly totalJSHeapSize: number;
    readonly jsHeapSizeLimit: number;
  }

  // Extended Performance interface with Chrome memory API
  interface Performance {
    memory?: PerformanceMemory;
  }

  // Device Memory API (Experimental Web Platform Feature)
  interface Navigator {
    deviceMemory?: number;
  }

  // WebKit AudioContext for Safari/older browsers
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    // Chrome garbage collection API (--js-flags=--expose-gc)
    gc?: () => void;
    // Playwright injected properties
    __playwright_logs?: Array<{
      type: string;
      message: string;
      timestamp: number;
    }>;
    __playwright_errors?: Array<{
      type: string;
      message: string;
      stack?: string;
      timestamp: number;
    }>;
    __performanceBaselineReport?: unknown;
  }

  // Layout Shift API - PerformanceObserver entry types
  interface LayoutShiftEntry extends PerformanceEntry {
    readonly value: number;
    readonly hadRecentInput: boolean;
    readonly lastInputTime: number;
    readonly sources: readonly LayoutShiftAttribution[];
  }

  interface LayoutShiftAttribution {
    readonly node?: Node;
    readonly previousRect: DOMRect;
    readonly currentRect: DOMRect;
  }

  // ES2023/ES2024 Array methods (for cross-browser testing)
  interface Array<T> {
    toSpliced?(start: number, deleteCount?: number, ...items: T[]): T[];
  }
}

// Test utility types
export interface LogEntry {
  type: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: number;
}

export interface MemoryMetrics {
  initialMemory: number;
  peakMemory: number;
  finalMemory: number;
  garbageCollected: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
}

export interface BrowserCapabilities {
  modernJs: boolean;
  toSpliced: boolean;
  audioContext: boolean;
  webkitAudioContext: boolean;
  performanceMemory: boolean;
  deviceMemory: boolean;
}

// Test result types for compatibility matrix
export interface TestSuite {
  title: string;
  suites?: TestSuite[];
  tests?: TestCase[];
  pass?: boolean;
  pending?: boolean;
  failures?: number;
}

export interface TestCase {
  title: string;
  pass: boolean;
  err?: {
    message: string;
    stack?: string;
  };
  duration?: number;
}

export type TestResults = Record<string, unknown>;