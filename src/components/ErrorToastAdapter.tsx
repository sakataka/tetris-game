import { useEffect } from 'react';
import { toast } from 'sonner';
import type { ErrorInfo, ErrorLevel } from '../types/errors';
import { errorHandler } from '../utils/data';

const ErrorToastAdapter = () => {
  useEffect(() => {
    // Subscribe to error events and show them as toasts
    return errorHandler.onError((errorInfo: ErrorInfo) => {
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
