/**
 * SSR対応のZustandストア初期化ユーティリティ
 * React Router 7環境でのサーバーサイドレンダリング対応
 */

import { useEffect, useState } from 'react';

/**
 * SSR環境での安全なストア使用のためのフック
 * クライアントサイドハイドレーション完了後にストアを使用可能にする
 */
export function useIsomorphicStore() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみハイドレーション状態を true に設定
    setIsHydrated(true);
  }, []);

  return { isHydrated };
}

/**
 * SSR対応のストア値取得フック
 * サーバーサイドではfallback値を返し、クライアントサイドでは実際のストア値を返す
 */
export function useSSRSafeStore<T>(storeHook: () => T, fallback: T): T {
  const { isHydrated } = useIsomorphicStore();

  // サーバーサイドまたはハイドレーション前はfallback値を使用
  if (!isHydrated) {
    return fallback;
  }

  // クライアントサイドでハイドレーション完了後は実際のストア値を使用
  return storeHook();
}

/**
 * ストアの初期化状態を管理するプロバイダー用フック
 */
export function useStoreInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isHydrated } = useIsomorphicStore();

  useEffect(() => {
    if (isHydrated && !isInitialized) {
      // ハイドレーション完了後にストアを初期化
      setIsInitialized(true);
    }
  }, [isHydrated, isInitialized]);

  return { isInitialized, isHydrated };
}

/**
 * 環境判定ユーティリティ
 */
export const isClient = typeof window !== 'undefined';
export const isServer = !isClient;

/**
 * SSR安全なlocalStorage操作
 */
export const ssrSafeLocalStorage = {
  getItem: (key: string): string | null => {
    if (isServer) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (isServer) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage が利用できない場合は無視
    }
  },

  removeItem: (key: string): void => {
    if (isServer) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage が利用できない場合は無視
    }
  },
};

/**
 * SSR対応のZustandストア作成ヘルパー
 */
export function createSSRSafeStore<T>(createStore: () => T, fallbackState: Partial<T>): () => T {
  let store: T | null = null;

  return () => {
    if (isServer) {
      // サーバーサイドでは毎回新しいインスタンスを作成
      return { ...createStore(), ...fallbackState } as T;
    }

    if (!store) {
      // クライアントサイドでは単一インスタンスを維持
      store = createStore();
    }

    return store;
  };
}
