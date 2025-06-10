'use client';

import { useEffect } from 'react';
import { initializeErrorStoreIntegration } from '../store/errorStore';

export default function ErrorStoreInitializer() {
  useEffect(() => {
    // エラーストアとエラーハンドラーの連携を初期化
    initializeErrorStoreIntegration();
  }, []);

  return null; // UIをレンダリングしない
}
