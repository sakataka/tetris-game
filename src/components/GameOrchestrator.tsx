'use client';

import { useEffect, use } from 'react';
import { useInitializeLanguage } from '../store/languageStore';
import { useMobileDetection } from '../hooks/useMobileDetection';
import LoadingMessage from './LoadingMessage';
import '../i18n'; // Initialize i18n

interface GameOrchestratorProps {
  children: React.ReactNode;
}

// Create a promise for hydration status
let hydrationPromise: Promise<boolean> | null = null;

function getHydrationPromise() {
  if (typeof window === 'undefined') {
    // SSR: immediately resolved
    return Promise.resolve(false);
  }

  if (!hydrationPromise) {
    // Client: create promise that resolves after hydration
    hydrationPromise = new Promise<boolean>((resolve) => {
      // Use queueMicrotask for immediate resolution after current execution
      queueMicrotask(() => resolve(true));
    });
  }

  return hydrationPromise;
}

/**
 * GameOrchestrator handles application-wide initialization and lifecycle management.
 * Responsibilities:
 * - SSR hydration handling
 * - Language system initialization
 * - Loading state management
 */
export default function GameOrchestrator({ children }: GameOrchestratorProps) {
  // Language initialization
  const initializeLanguage = useInitializeLanguage();

  // Using React 19's use() hook for hydration status
  const isHydrated = use(getHydrationPromise());

  useEffect(() => {
    // Initialize language once on mount
    initializeLanguage();
  }, [initializeLanguage]); // Include initializeLanguage dependency

  // Show loading until hydration is complete
  if (!isHydrated) {
    return <LoadingMessage />;
  }

  return <>{children}</>;
}

// Export mobile detection for use by child components
export { useMobileDetection };
