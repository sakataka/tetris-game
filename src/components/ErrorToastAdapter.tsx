import { useEffect } from 'react';
import { toast } from 'sonner';
import type { ErrorInfo, ErrorLevel } from '../types/errors';
import { errorHandler } from '../utils/data';

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
        case 'info':
          toast.info(message, {
            duration,
            id: errorInfo.id,
          });
          break;
        case 'warning':
          toast.warning(message, {
            duration,
            id: errorInfo.id,
          });
          break;
        case 'error':
          toast.error(message, {
            duration,
            id: errorInfo.id,
          });
          break;
        case 'critical':
          toast.error(message, {
            duration,
            id: errorInfo.id,
            description: 'Critical Error',
          });
          break;
        default:
          toast(message, {
            duration,
            id: errorInfo.id,
          });
      }

      // Auto-resolve error after duration
      if (duration && duration < Number.POSITIVE_INFINITY) {
        setTimeout(() => {
          errorHandler.resolveError(errorInfo.id);
        }, duration);
      }
    });
  }, []);

  return null;
};

function shouldSuppressToast(errorInfo: ErrorInfo): boolean {
  // Suppress toast notifications for audio loading/initialization errors
  if (errorInfo.category === 'audio') {
    const isLoadingError = errorInfo.context.action === 'audio_load';
    const isInitializationError = errorInfo.context.action === 'audio_context_init';
    const isPreloadError = errorInfo.context.action === 'audio_preload';
    const isCreateError = errorInfo.context.action === 'html_audio_create';
    const isUnlockError = errorInfo.context.action === 'audio_unlock';
    const isHTMLInit = errorInfo.context.action === 'html_audio_init';

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

  return false; // Don't suppress non-audio errors
}

function getDefaultDuration(level: ErrorLevel): number {
  switch (level) {
    case 'info':
      return 3000;
    case 'warning':
      return 5000;
    case 'error':
      return 7000;
    case 'critical':
      return 10000;
    default:
      return 5000;
  }
}

export default ErrorToastAdapter;
