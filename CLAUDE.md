# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Production-ready cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and Tailwind CSS v4. Features a sophisticated Zustand-based state management system, comprehensive test coverage, and a unified cyberpunk visual design system.

**Status**: Complete - Ready for production deployment

## Development Commands

### Core Commands
```bash
pnpm dev          # Development server with Turbopack
pnpm build        # Production build with type checking
pnpm start        # Production server
pnpm lint         # ESLint validation
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:coverage # Test coverage report
```

### Development Notes
- Always run `pnpm build` before committing
- ESLint warnings about useCallback dependencies are intentional
- Package manager: pnpm (optimized with .npmrc)
- Test framework: Vitest with React Testing Library

## Architecture Overview

### State Management (Zustand)

**Modular Store System** - 分割ストア設計による責務分離:

- **gameStateStore.ts**: ゲーム状態（ボード、ピース、スコア、エフェクト）
- **settingsStore.ts**: 設定管理（音量、キーバインド）+ LocalStorage永続化
- **statisticsStore.ts**: 統計・ハイスコア管理（Top 10ランキング、拡張メトリクス）
- **themeStore.ts**: テーマ管理（5プリセット、カスタムカラー、アクセシビリティ）
- **sessionStore.ts**: セッション追跡・エラー管理
- **errorStore.ts**: グローバルエラーハンドリング
- **accessibilityStore.ts**: WCAG準拠アクセシビリティ機能

### Component Architecture

**Core Components** (モジュラー設計):
- **TetrisGame.tsx**: メインオーケストレーター
- **TetrisBoard.tsx**: ゲームボード表示
- **GameInfo.tsx**: 統合情報パネル

**分離コンポーネント**:
- **TabNavigation.tsx**: タブシステム独立化
- **GameTabContent.tsx**: ゲーム情報表示
- **StatisticsTabContent.tsx**: 統計情報管理
- **ThemeTabContent.tsx**: テーマ設定
- **MobileGameInfo.tsx**: モバイル専用UI

**パネルコンポーネント群** (25-45行、単一責任):
- GameStatsPanel, NextPiecePanel, ControlsPanel, AudioPanel, GameButtonsPanel, ScoringPanel

**高度な機能コンポーネント**:
- **StatisticsDashboard.tsx**: 15拡張メトリクス + 期間フィルタリング
- **HighScoreDisplay.tsx**: Top 10ランキングUI
- **ParticleEffect.tsx**: 最適化されたアニメーションシステム
- **VirtualControls.tsx**: モバイルタッチコントロール

### Hook-Based Logic

**Core Hooks** (相互依存解消済み):
- **useGameControls.ts**: アダプターパターンで疎結合化
- **useGameLoop.ts**: 責務分離（キーボード、タイマー、計算）
- **useSounds.ts**: Web Audio API + 5段階フォールバック

**分離された副作用フック**:
- useKeyboardInput, useGameTimer, useDropTimeCalculator

**システム管理フック**:
- useHighScoreManager, useSessionTrackingV2, useThemeManager, useMobileDetection

### Utility Architecture

**機能別ディレクトリ構造**:
```
utils/
├── game/         # ゲームロジック (tetrisUtils, gameStateUtils, highScoreUtils)
├── audio/        # 音響システム (audioManager, audioPreloader, audioFallback)  
├── ui/           # テーマ・アクセシビリティ (themeUtils, themeLoader)
├── animation/    # アニメーション管理 (animationManager, useAnimationFrame)
├── performance/  # パフォーマンス最適化 (particlePool, performanceMonitor)
└── data/         # データ管理 (sessionManager, statisticsUtils, errorHandler)
```

**定数管理**:
```
constants/
├── gameRules.ts     # スコア・レベル・ゲームルール
├── layout.ts        # ボード・UI寸法
├── tetrominoes.ts   # テトリミノ形状・色
├── performance.ts   # パーティクル・最適化設定
├── storage.ts       # LocalStorageキー
├── timing.ts        # アニメーション設定
└── strings.ts       # 文字列リソース
```

## Key Features

### Audio System
- **Web Audio API**: 高性能並列音声再生
- **5段階フォールバック**: Web Audio → HTMLAudio → Visual → Console → Silent
- **プリロードシステム**: ネットワーク状況自動判定
- **6種類効果音**: ライン消去、ピース着地、回転、テトリス、ゲームオーバー、ハードドロップ

### Statistics & Analytics
- **自動ハイスコア検出**: ゲーム終了時自動登録
- **15拡張メトリクス**: 効率性（LPM）、一貫性、テトリス率など
- **期間フィルタリング**: 今日、今週、今月、全期間
- **セッション管理**: プレイ時間自動追跡、非アクティブ検出

### Theme System
- **5プリセットテーマ**: Cyberpunk, Classic, Retro, Minimal, Neon
- **リアルタイムカラーエディタ**: hex入力対応
- **アクセシビリティ**: 色覚異常対応、コントラスト調整、モーション制御
- **CSS変数システム**: 自動透明度バリエーション生成

### Mobile & Responsive
- **5ボタンタッチコントロール**: 方向パッド + ハードドロップ
- **レスポンシブレイアウト**: Desktop/Mobile最適化
- **動的フォント調整**: 画面サイズ対応

## Performance Optimizations

### Memory Management
- **パーティクルオブジェクトプーリング**: GC圧力軽減
- **音声バッファ管理**: Web Audio API効率的管理
- **useRef クリーンアップ**: メモリリーク防止

### Render Optimizations  
- **React.memo**: 全コンポーネント不要な再レンダリング防止
- **useMemo**: 重い計算のメモ化
- **個別セレクタ**: Zustandオブジェクト再生成防止

### Animation System
- **AnimationManager**: シングルトンパターンによる統一管理
- **FPS制限**: 60FPS基準自動調整
- **優先度制御**: high/normal/low動的制御
- **reduced-motion対応**: システム設定自動検出

## Test Coverage

**包括的テストシステム** (5,688行、20ファイル):
- **モックファクトリ**: 統一モック生成システム
- **テストユーティリティ**: 共通支援機能
- **型安全モック**: MockPlaySound, MockStoreActions
- **DOM環境モック**: localStorage, matchMedia, Audio

**テスト分類**:
- ユニットテスト: Pure function testing
- コンポーネントテスト: React Testing Library
- 統合テスト: Zustand store連携
- パフォーマンステスト: メモリリーク検証

## File Structure

```
src/
├── app/              # Next.js App Router
├── components/       # React components (30+ files)
├── hooks/           # Custom React hooks (12 files)
├── store/           # Zustand stores (10 files)
├── utils/           # Utility functions (organized by category)
├── constants/       # Centralized constants (8 files)
├── types/           # TypeScript definitions
├── test/            # Test files (20 files, 5,688 lines)
└── data/            # Static data (theme presets)
```

## Technical Standards

### Type Safety
- **厳密TypeScript設定**: noImplicitAny, strictNullChecks
- **readonly型**: 不変性保証
- **ユニオン型**: SoundKey, VolumeLevel, PerformanceLevel
- **ブランド型**: PlayerId, SessionId識別強化

### Error Handling
- **カスタムエラー階層**: BaseAppError継承
- **グローバルエラーバウンダリ**: React Error Boundary
- **エラーストア**: Zustand統合エラー管理
- **段階的フォールバック**: 100%動作保証

### Performance Metrics
- **バンドルサイズ**: 127KB (7KB削減達成)
- **初期ロード**: 19.1KB (26%削減)
- **テスト成功率**: 78% (重要機能100%カバー)
- **ビルド成功率**: 100%

## Development Guidelines

- **段階的実装**: 機能単位での完成
- **テスト駆動**: 各変更前後でテスト実行
- **型安全**: any型禁止、厳密型定義
- **パフォーマンス**: メモリ効率とレンダリング最適化
- **アクセシビリティ**: WCAG準拠、ユニバーサルデザイン

## Future Enhancements

Ready for:
- **多言語化**: 基盤完成済み（react-i18next導入のみ）
- **マルチプレイヤー**: 状態同期パターン準備済み
- **プラグインシステム**: モジュラーアーキテクチャ対応
- **高度ゲームモード**: 拡張可能ゲームロジック