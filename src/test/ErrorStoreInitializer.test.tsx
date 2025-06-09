/**
 * ErrorStoreInitializer コンポーネントテスト
 * 
 * エラーストア初期化コンポーネントの機能を検証
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';

// モックを先に定義
vi.mock('../store/errorStore', () => ({
  initializeErrorStoreIntegration: vi.fn()
}));

// モックと実際のコンポーネントをインポート
import ErrorStoreInitializer from '../components/ErrorStoreInitializer';
import { initializeErrorStoreIntegration } from '../store/errorStore';

const mockInitializeErrorStoreIntegration = initializeErrorStoreIntegration as ReturnType<typeof vi.fn>;

describe('ErrorStoreInitializer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('マウント時にinitializeErrorStoreIntegrationを呼び出す', () => {
    render(<ErrorStoreInitializer />);
    
    expect(mockInitializeErrorStoreIntegration).toHaveBeenCalledTimes(1);
  });

  it('何もレンダリングしない', () => {
    const { container } = render(<ErrorStoreInitializer />);
    
    expect(container.firstChild).toBeNull();
  });

  it('アンマウント時に再度初期化されない', () => {
    const { unmount } = render(<ErrorStoreInitializer />);
    
    expect(mockInitializeErrorStoreIntegration).toHaveBeenCalledTimes(1);
    
    unmount();
    
    // アンマウント時に追加の呼び出しがないことを確認
    expect(mockInitializeErrorStoreIntegration).toHaveBeenCalledTimes(1);
  });

  it('複数回レンダリングしても初期化は一度だけ', () => {
    const { rerender } = render(<ErrorStoreInitializer />);
    
    expect(mockInitializeErrorStoreIntegration).toHaveBeenCalledTimes(1);
    
    // 再レンダリング
    rerender(<ErrorStoreInitializer />);
    
    // 初期化は一度だけ
    expect(mockInitializeErrorStoreIntegration).toHaveBeenCalledTimes(1);
  });
});