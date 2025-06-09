'use client';

import { memo, useEffect, useState } from 'react';
import { ErrorLevel, ErrorInfo } from '../types/errors';
import { errorHandler } from '../utils/data';
import { useTimerAnimation, ANIMATION_PRESETS } from '../utils/animation';

interface ErrorNotificationProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  maxNotifications?: number;
  autoClose?: boolean;
}

interface NotificationItem {
  id: string;
  message: string;
  level: ErrorLevel;
  timestamp: number;
  duration?: number;
}

const ErrorNotification = memo(function ErrorNotification({
  position = 'top-right',
  maxNotifications = 5,
  autoClose = true,
}: ErrorNotificationProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // エラーハンドラーからの通知を受信
    return errorHandler.onError((errorInfo: ErrorInfo) => {
      const notification: NotificationItem = {
        id: errorInfo.id,
        message: errorInfo.userMessage || errorInfo.message,
        level: errorInfo.level,
        timestamp: Date.now(),
        duration: getDefaultDuration(errorInfo.level),
      };

      setNotifications((prev) => {
        const newNotifications = [notification, ...prev];
        return newNotifications.slice(0, maxNotifications);
      });
    });
  }, [maxNotifications]);

  // 統一アニメーション管理システムを使用した自動削除タイマー
  const cleanupNotifications = () => {
    const now = Date.now();
    setNotifications((prev) =>
      prev.filter((notification) => {
        const age = now - notification.timestamp;
        return age < (notification.duration || 5000);
      })
    );
  };

  useTimerAnimation(
    cleanupNotifications,
    1000, // 1秒間隔
    [cleanupNotifications],
    {
      ...ANIMATION_PRESETS.UI_ANIMATION,
      enabled: autoClose && notifications.length > 0,
      priority: 'low', // 低優先度（パフォーマンス重視時は停止）
    }
  );

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    errorHandler.resolveError(id);
  };

  const getNotificationStyles = (level: ErrorLevel) => {
    const baseStyles =
      'relative p-4 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-300 transform hover:scale-105';

    switch (level) {
      case 'info':
        return `${baseStyles} bg-blue-500/10 border-blue-400/30 text-blue-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-500/10 border-yellow-400/30 text-yellow-100`;
      case 'error':
        return `${baseStyles} bg-red-500/10 border-red-400/30 text-red-100`;
      case 'critical':
        return `${baseStyles} bg-purple-500/10 border-purple-400/30 text-purple-100 ring-2 ring-purple-400/50`;
      default:
        return `${baseStyles} bg-gray-500/10 border-gray-400/30 text-gray-100`;
    }
  };

  const getIcon = (level: ErrorLevel) => {
    switch (level) {
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'critical':
        return '🚨';
      default:
        return '📝';
    }
  };

  const getPositionStyles = () => {
    const baseStyles = 'fixed z-50 max-w-sm';

    switch (position) {
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'top-center':
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={getPositionStyles()}>
      <div className='space-y-2'>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={getNotificationStyles(notification.level)}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* 進行状況バー（自動閉じる場合） */}
            {autoClose && notification.duration && (
              <div
                className='absolute bottom-0 left-0 h-1 bg-current opacity-30 animate-pulse'
                style={{
                  width: `${100 - ((Date.now() - notification.timestamp) / notification.duration) * 100}%`,
                  transition: 'width 1s linear',
                }}
              />
            )}

            <div className='flex items-start gap-3'>
              {/* アイコン */}
              <div className='text-lg flex-shrink-0 mt-0.5'>{getIcon(notification.level)}</div>

              {/* メッセージ */}
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium break-words'>{notification.message}</p>
                <p className='text-xs opacity-70 mt-1'>
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {/* 閉じるボタン */}
              <button
                onClick={() => dismissNotification(notification.id)}
                className='flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity p-1 rounded hover:bg-current/10'
                aria-label='通知を閉じる'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            {/* レベル別の装飾 */}
            {notification.level === 'critical' && (
              <div className='absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-red-600/20 rounded-lg -z-10 animate-pulse' />
            )}
          </div>
        ))}
      </div>

      {/* 全体クリアボタン（複数通知がある場合） */}
      {notifications.length > 1 && (
        <button
          onClick={() => {
            notifications.forEach((n) => errorHandler.resolveError(n.id));
            setNotifications([]);
          }}
          className='mt-2 w-full text-xs text-gray-400 hover:text-gray-200 py-1 px-2 rounded border border-gray-600/30 hover:border-gray-400/30 transition-colors'
        >
          すべてクリア ({notifications.length})
        </button>
      )}
    </div>
  );
});

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

export default ErrorNotification;
