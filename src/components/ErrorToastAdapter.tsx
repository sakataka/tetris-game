import { useEffect } from 'react';
import { toast } from 'sonner';
import type { ErrorInfo, ErrorLevel } from '@/types/errors';
import { errorHandler } from '@/utils/data';

const ErrorToastAdapter = () => {
  useEffect(() => {
    // Subscribe to error events and show them as toasts
    return errorHandler.onError((errorInfo: ErrorInfo) => {
      // Skip toast notification for suppressed audio errors
      if (shouldSuppressToast(errorInfo)) {
        return;
      }

      const message = errorInfo.userMessage || errorInfo.message;
      const duration = getDefaultDuration(errorInfo.level);

      // Map error levels to toast types
      switch (errorInfo.level) {
        case 'low':
          toast.info(message, {
            duration,
            id: errorInfo.id,
          });
          break;
        case 'medium':
          toast.warning(message, {
            duration,
            id: errorInfo.id,
          });
          break;
        case 'high':
          toast.error(message, {
            duration,
            id: errorInfo.id,
            description: 'High Priority Error',
          });
          break;
        default:
          toast(message, {
            duration,
            id: errorInfo.id,
          });
      }

      // Auto-dismiss toast (no auto-resolve needed in simplified system)
    });
  }, []);

  return null;
};

function shouldSuppressToast(errorInfo: ErrorInfo): boolean {
  // Suppress toast notifications for audio loading/initialization errors
  if (errorInfo.category === 'audio') {
    // Check metadata for audio action types
    const metadata = errorInfo.context.metadata as Record<string, unknown> | undefined;
    if (metadata) {
      const action = metadata['action'] as string | undefined;
      const isLoadingError = action === 'audio_load';
      const isInitializationError = action === 'audio_context_init';
      const isPreloadError = action === 'audio_preload';
      const isCreateError = action === 'html_audio_create';
      const isUnlockError = action === 'audio_unlock';
      const isHTMLInit = action === 'html_audio_init';

      // Suppress toasts for loading/initialization errors, only show userMessage if explicitly set
      return (
        isLoadingError ||
        isInitializationError ||
        isPreloadError ||
        isCreateError ||
        isUnlockError ||
        isHTMLInit ||
        !errorInfo.userMessage // Also suppress if no explicit userMessage is set
      );
    }

    // Fallback: suppress if no userMessage for audio errors
    return !errorInfo.userMessage;
  }

  return false; // Don't suppress non-audio errors
}

function getDefaultDuration(level: ErrorLevel): number {
  switch (level) {
    case 'low':
      return 3000;
    case 'medium':
      return 5000;
    case 'high':
      return 8000;
    default:
      return 5000;
  }
}

export default ErrorToastAdapter;
