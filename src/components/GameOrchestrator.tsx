'use client';

import { useEffect, useState } from 'react';
import { useInitializeLanguage } from '../store/languageStore';
import { useMobileDetection } from '../hooks/useMobileDetection';
import LoadingMessage from './LoadingMessage';
import '../i18n'; // Initialize i18n

interface GameOrchestratorProps {
  children: React.ReactNode;
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

  // SSR hydration handling
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Simple hydration check
    setIsHydrated(true);
    // Initialize language once on mount
    initializeLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run only once on mount

  // Show loading until hydration is complete
  if (!isHydrated) {
    return <LoadingMessage />;
  }

  return <>{children}</>;
}

// Export mobile detection for use by child components
export { useMobileDetection };
