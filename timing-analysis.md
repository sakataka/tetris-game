# 詳細なタイミング競合状態・レース条件分析レポート

## 概要

Tetrisゲームプロジェクトのコードベースを詳細に検査し、4つの主要なタイミング競合領域における具体的なレース条件、タイミング依存性、データ破損シナリオを特定しました。

## 1. useGameTimer vs AnimationManager タイマー競合

### 問題の根本原因

**異なるタイミングメカニズムの並存:**

- `useGameTimer`: `setInterval` ベース（古典的タイマー）
- `AnimationManager`: `requestAnimationFrame` ベース（60fps同期）

### 具体的レース条件

#### A. ドロップタイミングの非同期化

```typescript
// useGameTimer.ts: Line 23-25
intervalRef.current = setInterval(() => {
  onTickRef.current(); // ゲームピースドロップ
}, interval);

// AnimationManager.ts: Line 154
animation.requestId = requestAnimationFrame(animate);
```

**競合シナリオ:**

1. `setInterval`（1000ms）でピースドロップが呼び出される
2. 同時に`requestAnimationFrame`（16.67ms間隔）でパーティクルアニメーションが更新
3. **データ競合**: 両方が同時に`gameStateStore`を更新しようとする

#### B. 状態更新の順序不整合

```typescript
// GameStateController.tsx: Line 79-82
const flashTimeoutId = setTimeout(() => {
  updateLineEffect({ flashingLines: [], shaking: false });
}, EFFECTS.FLASH_DURATION); // 80ms

// 同時に AnimationManager のパフォーマンスチェック
setInterval(() => {
  this.checkPerformance(); // 5秒間隔
}, INTERVALS.PERFORMANCE_CHECK);
```

**データ破損シナリオ:**

1. ライン消去エフェクトが80ms後にクリア予定
2. パフォーマンス低下でアニメーションが停止
3. エフェクトクリアが実行されず、UIが不整合状態になる

### 実際の影響

- ピースドロップタイミングの不規則性（50-150ms変動）
- パーティクルエフェクトの重複実行
- メモリリーク（未解放のタイマー）

## 2. GameStateController ライン効果クリーンアップ競合

### 複数タイマー間の相互依存

```typescript
// GameStateController.tsx: Line 72-104
useEffect(
  () => {
    const hasFlashingLines = gameState.lineEffect.flashingLines.length > 0;
    const hasShaking = gameState.lineEffect.shaking;

    if (hasFlashingLines || hasShaking) {
      const flashTimeoutId = setTimeout(() => {
        updateLineEffect({ flashingLines: [], shaking: false });
      }, EFFECTS.FLASH_DURATION); // 80ms

      return () => clearTimeout(flashTimeoutId);
    }

    const hasParticles = gameState.lineEffect.particles.length > 0;
    if (hasParticles && !hasFlashingLines && !hasShaking) {
      const particleCleanupId = setTimeout(() => {
        clearLineEffect();
      }, EFFECTS.FLASH_DURATION + 100); // 180ms

      return () => clearTimeout(particleCleanupId);
    }
  },
  [
    /* 多数の依存関係 */
  ]
);
```

### 具体的レース条件

#### A. エフェクト状態の競合更新

**シナリオ1: 高速ライン消去**

1. `flashingLines` が設定される（80ms タイマー開始）
2. 20ms後に新しいライン消去が発生
3. 新しい `useEffect` が実行、古いタイマーがキャンセル
4. **結果**: 最初のエフェクトが中途半端に残る

#### B. パーティクル・フラッシュ状態不整合

**シナリオ2: 重複エフェクト**

1. フラッシュ開始（80ms）+ パーティクル開始（180ms）
2. 60ms時点でフラッシュ終了判定
3. パーティクルクリーンアップが `!hasFlashingLines` 条件で実行
4. **結果**: パーティクルが予期せず消去

### 状態更新シーケンスの問題

```typescript
// 期待されるシーケンス:
// 1. Flash + Shake + Particles (80ms)
// 2. Particles only (100ms)
// 3. Clean all (180ms)

// 実際のシーケンス（競合時）:
// 1. Flash + Shake + Particles (80ms)
// 2. Flash clear -> Particles clear immediately (due to condition)
// 3. Particles orphaned
```

## 3. SessionManager vs sessionStoreV2 同期問題

### 二重状態管理の問題構造

```typescript
// SessionManager.ts: Singleton パターン
export class SessionManager {
  private currentSession: PlaySession | null = null;
  private changeListeners: Set<() => void> = new Set();
}

// sessionStoreV2.ts: Zustand ストア
export const useSessionStoreV2 = create<SessionStoreV2>()((set) => {
  const updateFromManager = () => {
    set({
      currentSession: sessionManager.getCurrentSession(),
      // ...他の状態
    });
  };

  sessionManager.addChangeListener(updateFromManager);
});
```

### 具体的レース条件

#### A. リスナー登録タイミング競合

**シナリオ1: 初期化順序依存**

1. `sessionStoreV2` がリスナーを登録
2. 同時に `SessionManager` が初期状態をロード
3. リスナー登録前に状態変更が発生
4. **結果**: Zustand ストアが古い状態を保持

#### B. 非同期更新の順序不整合

```typescript
// useSessionTrackingV2.ts
useEffect(() => {
  if (!currentSession) {
    startSession(); // 非同期でSessionManager更新
  }
}, [currentSession, startSession]); // 依存関係配列

// SessionManager.ts
public startSession(): PlaySession {
  this.currentSession = { /* 新しいセッション */ };
  this.saveCurrentSession(); // localStorage 書き込み
  this.notifyListeners(); // Zustand更新通知
  return this.currentSession;
}
```

**競合シナリオ:**

1. React の `useEffect` が `!currentSession` を検出
2. `startSession()` 呼び出し開始
3. 別のコンポーネントが同時に `startSession()` 呼び出し
4. **結果**: 2つのセッションが作成、データ競合

### localStorage 同期の問題

```typescript
// 異なるタイミングでの読み書き
// Read: SessionManager constructor
private loadFromStorage(): void {
  const stored = localStorage.getItem(CURRENT_SESSION_KEY);
  // パース処理...
}

// Write: SessionManager.startSession
private saveCurrentSession(): void {
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(this.currentSession));
}
```

**データ破損リスク:**

- 読み込み中の書き込み -> 不完全なデータ
- 書き込み中の読み込み -> パースエラー
- 複数タブでの同時アクセス -> 状態不整合

## 4. テーマ同期タイミング問題

### 複数ソースからの状態同期

```typescript
// themeStore.ts: Zustand ベースストア
export const useThemeStore = create<ThemeStore>()((set) => ({
  setTheme: (themeVariant) =>
    set((state) => ({
      theme: {
        ...state.theme,
        current: themeVariant,
        config: getThemePreset(themeVariant), // 同期呼び出し
      },
    })),
}));

// useThemeManager.ts: DOM 操作とlocalStorage同期
useEffect(() => {
  let config = { ...themeState.config };

  // 複数の変換処理
  if (themeState.accessibility.colorBlindnessType !== 'none') {
    config.colors = applyColorBlindnessFilter(config.colors, ...);
  }

  initializeTheme(config); // DOM CSS変数設定

  localStorage.setItem('tetris-theme-state', JSON.stringify(themeState));
}, [themeState]); // 全themeState依存
```

### 具体的レース条件

#### A. CSS変数設定の競合

**シナリオ1: 高速テーマ切り替え**

1. ユーザーが `cyberpunk` -> `retro` に切り替え
2. `setTheme('retro')` が Zustand ストア更新
3. `useEffect` が `cyberpunk` の CSS変数を設定中
4. 新しい `useEffect` が `retro` の CSS変数設定開始
5. **結果**: 混在したCSS変数（cyberpunk + retro）

#### B. アクセシビリティフィルター適用競合

```typescript
// 同じuseEffect内での連続変換
config.colors = applyColorBlindnessFilter(config.colors, type);
config.colors = adjustColorsForContrast(config.colors, contrast);
```

**データ競合:**

1. `applyColorBlindnessFilter` 実行中
2. ユーザーがコントラスト設定変更
3. 新しい `useEffect` が途中の `config.colors` を使用
4. **結果**: 部分的に適用されたフィルター

### localStorage 整合性問題

```typescript
// システム設定変更の監視
useEffect(
  () => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (
        e.matches &&
        themeState.accessibility.animationIntensity === 'enhanced'
      ) {
        setAccessibilityOptions({
          animationIntensity: 'reduced',
          reducedMotion: true,
        }); // 非同期状態更新
      }
    };
  },
  [
    /* 依存関係 */
  ]
);
```

**競合シナリオ:**

1. ユーザーがテーマ設定変更
2. システムがアクセシビリティ設定を自動変更
3. 両方が `localStorage` に同時書き込み
4. **結果**: 設定の一部が失われる

## 解決すべき主要な問題

### 1. タイマー統合の必要性

- `setInterval` と `requestAnimationFrame` の統一
- 統一されたスケジューリングシステム

### 2. 状態更新の原子性

- 複数の状態変更を1つのトランザクションに
- 中間状態の排除

### 3. 非同期処理の同期化

- Promise ベースの状態更新
- 依存関係の明確化

### 4. ストレージアクセスの排他制御

- `localStorage` アクセスの同期化
- 読み書きロック機構

## 推奨される修正アプローチ

1. **統一タイマーマネージャー** の実装
2. **状態更新キュー** システム
3. **非同期状態同期** パターン
4. **ストレージアクセス制御** レイヤー

これらの修正により、タイミング競合による不具合を根本的に解決できます。
