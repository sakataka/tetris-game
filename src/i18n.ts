import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Language types and constants
export type SupportedLanguage = 'en' | 'ja';

export const supportedLanguages: SupportedLanguage[] = ['en', 'ja'];

export const defaultLanguage: SupportedLanguage = 'en';

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ja: '日本語',
};

// Import translation resources
const resources = {
  en: {
    translation: {
      // Common UI
      common: {
        loading: 'Loading...',
        error: 'Error',
        retry: 'Retry',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        close: 'Close',
      },
      // Game UI
      game: {
        title: 'Cyberpunk Tetris',
        score: 'Score',
        level: 'Level',
        lines: 'Lines',
        next: 'Next',
        hold: 'Hold',
        time: 'Time',
        gameOver: 'Game Over',
        paused: 'Paused',
        newGame: 'New Game',
        pause: 'Pause',
        resume: 'Resume',
        restart: 'Restart',
        highScore: 'High Score',
        statistics: 'Statistics',
        settings: 'Settings',
        themes: 'Themes',
        about: 'About',
      },
      // Controls
      controls: {
        moveLeft: 'Move Left',
        moveRight: 'Move Right',
        softDrop: 'Soft Drop',
        hardDrop: 'Hard Drop',
        rotateLeft: 'Rotate Left',
        rotateRight: 'Rotate Right',
        hold: 'Hold Piece',
        pause: 'Pause Game',
      },
      // Settings
      settings: {
        audio: 'Audio',
        volume: 'Volume',
        effects: 'Sound Effects',
        music: 'Music',
        controls: 'Controls',
        graphics: 'Graphics',
        accessibility: 'Accessibility',
        language: 'Language',
        theme: 'Theme',
        resetSettings: 'Reset Settings',
        saveSettings: 'Save Settings',
      },
      // Themes
      themes: {
        cyberpunk: 'Cyberpunk',
        classic: 'Classic',
        retro: 'Retro',
        minimal: 'Minimal',
        neon: 'Neon',
        custom: 'Custom',
        preview: 'Preview',
        apply: 'Apply Theme',
        reset: 'Reset Theme',
      },
      // Errors
      errors: {
        systemError: 'System Error',
        unexpectedError: 'An unexpected error occurred',
        componentError: 'Component Error',
        sectionError: 'Section Error',
        componentRenderError: 'Component rendering failed',
        sectionDisplayError: 'This section cannot be displayed',
        errorId: 'Error ID',
        retry: 'Retry',
        retryUpToTimes: 'Retry ({{count}} attempts left)',
        reloadPage: 'Reload Page',
        returnToHome: 'Return to Home',
      },
      // Statistics
      statistics: {
        totalScore: 'Total Score',
        highestScore: 'Highest Score',
        totalLines: 'Total Lines',
        totalGames: 'Total Games',
        averageScore: 'Average Score',
        playTime: 'Play Time',
        efficiency: 'Efficiency',
        reset: 'Reset Statistics',
      },
      // Accessibility
      accessibility: {
        reducedMotion: 'Reduced Motion',
        highContrast: 'High Contrast',
        colorBlind: 'Color Blind Support',
        screenReader: 'Screen Reader Support',
        keyboardOnly: 'Keyboard Only',
        fontSize: 'Font Size',
        focusIndicator: 'Focus Indicator',
      },
      // Accessibility
      aria: {
        changeLanguage: 'Change language',
        closeDialog: 'Close dialog',
        openMenu: 'Open menu',
      },
    },
  },
  ja: {
    translation: {
      // 共通UI
      common: {
        loading: '読み込み中...',
        error: 'エラー',
        retry: '再試行',
        cancel: 'キャンセル',
        confirm: '確認',
        save: '保存',
        close: '閉じる',
      },
      // ゲームUI
      game: {
        title: 'サイバーパンクテトリス',
        score: 'スコア',
        level: 'レベル',
        lines: 'ライン',
        next: 'ネクスト',
        hold: 'ホールド',
        time: '時間',
        gameOver: 'ゲームオーバー',
        paused: '一時停止',
        newGame: '新しいゲーム',
        pause: '一時停止',
        resume: '再開',
        restart: '再スタート',
        highScore: 'ハイスコア',
        statistics: '統計',
        settings: '設定',
        themes: 'テーマ',
        about: 'について',
      },
      // コントロール
      controls: {
        moveLeft: '左に移動',
        moveRight: '右に移動',
        softDrop: 'ソフトドロップ',
        hardDrop: 'ハードドロップ',
        rotateLeft: '左回転',
        rotateRight: '右回転',
        hold: 'ホールド',
        pause: '一時停止',
      },
      // 設定
      settings: {
        audio: 'オーディオ',
        volume: '音量',
        effects: '効果音',
        music: '音楽',
        controls: 'コントロール',
        graphics: 'グラフィック',
        accessibility: 'アクセシビリティ',
        language: '言語',
        theme: 'テーマ',
        resetSettings: '設定をリセット',
        saveSettings: '設定を保存',
      },
      // テーマ
      themes: {
        cyberpunk: 'サイバーパンク',
        classic: 'クラシック',
        retro: 'レトロ',
        minimal: 'ミニマル',
        neon: 'ネオン',
        custom: 'カスタム',
        preview: 'プレビュー',
        apply: 'テーマを適用',
        reset: 'テーマをリセット',
      },
      // エラー
      errors: {
        systemError: 'システムエラー',
        unexpectedError: '予期しないエラーが発生しました',
        componentError: 'コンポーネントエラー',
        sectionError: 'セクションエラー',
        componentRenderError: 'コンポーネントの描画に失敗しました',
        sectionDisplayError: 'このセクションを表示できません',
        errorId: 'エラーID',
        retry: '再試行',
        retryUpToTimes: '再試行 (残り{{count}}回)',
        reloadPage: 'ページを再読み込み',
        returnToHome: 'ホームに戻る',
      },
      // 統計
      statistics: {
        totalScore: '総スコア',
        highestScore: '最高スコア',
        totalLines: '総ライン数',
        totalGames: '総ゲーム数',
        averageScore: '平均スコア',
        playTime: 'プレイ時間',
        efficiency: '効率',
        reset: '統計をリセット',
      },
      // アクセシビリティ
      accessibility: {
        reducedMotion: 'モーション軽減',
        highContrast: 'ハイコントラスト',
        colorBlind: '色覚サポート',
        screenReader: 'スクリーンリーダーサポート',
        keyboardOnly: 'キーボードのみ',
        fontSize: 'フォントサイズ',
        focusIndicator: 'フォーカスインジケーター',
      },
      // アクセシビリティ
      aria: {
        changeLanguage: '言語を変更',
        closeDialog: 'ダイアログを閉じる',
        openMenu: 'メニューを開く',
      },
    },
  },
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env['NODE_ENV'] === 'development',

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
