import { useEffect } from 'react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useInitializeLanguage } from '@/store/i18nStore';
import '../i18n'; // Initialize i18n

interface GameOrchestratorProps {
  children: React.ReactNode;
}

/**
 * GameOrchestrator handles application-wide initialization and lifecycle management.
 * Responsibilities:
 * - Language system initialization
 * - SPA mode initialization
 */
export default function GameOrchestrator({ children }: GameOrchestratorProps) {
  // Language initialization
  const initializeLanguage = useInitializeLanguage();

  useEffect(() => {
    // Initialize language once on mount
    initializeLanguage();
  }, [initializeLanguage]);

  // In SPA mode, directly render children without hydration checks
  return <>{children}</>;
}

// Export mobile detection for use by child components
export { useMobileDetection };
