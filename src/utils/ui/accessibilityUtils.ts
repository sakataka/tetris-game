/**
 * アクセシビリティ統合ユーティリティ
 *
 * CSS変数適用、システム設定検出、WCAG準拠チェック
 */

import {
  AccessibilityState,
  AnimationIntensity,
  FontSizeLevel,
  VisualAssistance,
} from '../../types/accessibility';

/**
 * アクセシビリティ設定をCSS変数に適用
 */
export function applyAccessibilityToCSS(accessibility: AccessibilityState): void {
  const root = document.documentElement;

  // フォントサイズ設定
  const fontSizeMap: Record<FontSizeLevel, string> = {
    small: '0.875rem',
    normal: '1rem',
    large: '1.25rem',
    'extra-large': '1.5rem',
  };
  root.style.setProperty('--base-font-size', fontSizeMap[accessibility.fontSize]);

  // コントラスト設定
  const contrastMultiplier =
    accessibility.contrast === 'high' ? 1.5 : accessibility.contrast === 'low' ? 0.7 : 1.0;
  root.style.setProperty('--contrast-multiplier', contrastMultiplier.toString());

  // アニメーション設定
  const animationSettings = getAnimationSettings(accessibility.animationIntensity);
  root.style.setProperty('--animation-duration', `${animationSettings.duration}s`);
  root.style.setProperty('--particle-enabled', animationSettings.particles ? '1' : '0');
  root.style.setProperty('--effects-enabled', animationSettings.effects ? '1' : '0');

  // 視覚的支援設定
  if (accessibility.visual.highContrast) {
    root.style.setProperty('--high-contrast-mode', '1');
    root.style.setProperty('--border-width', '2px');
  } else {
    root.style.setProperty('--high-contrast-mode', '0');
    root.style.setProperty('--border-width', '1px');
  }

  // フォント重量設定
  root.style.setProperty('--font-weight', accessibility.visual.boldText ? '700' : '400');

  // カーソルサイズ
  const cursorSizeMap = {
    normal: '1rem',
    large: '1.5rem',
    'extra-large': '2rem',
  };
  root.style.setProperty('--cursor-size', cursorSizeMap[accessibility.visual.cursorSize]);

  // フォーカスアウトライン
  if (accessibility.keyboard.focusOutline) {
    root.style.setProperty('--focus-outline', '2px solid var(--cyber-cyan)');
    root.style.setProperty('--focus-outline-offset', '2px');
  } else {
    root.style.setProperty('--focus-outline', 'none');
    root.style.setProperty('--focus-outline-offset', '0');
  }

  // ゲーム固有設定
  root.style.setProperty(
    '--grid-lines-opacity',
    accessibility.gameSpecific.gridLines ? '0.3' : '0'
  );
  root.style.setProperty(
    '--drop-preview-opacity',
    accessibility.gameSpecific.dropPreview ? '0.5' : '0'
  );
}

/**
 * アニメーション設定を取得
 */
function getAnimationSettings(intensity: AnimationIntensity) {
  const settings = {
    none: { duration: 0, enabled: false, particles: false, effects: false },
    reduced: { duration: 0.2, enabled: true, particles: false, effects: false },
    normal: { duration: 0.6, enabled: true, particles: true, effects: true },
    enhanced: { duration: 1.0, enabled: true, particles: true, effects: true },
  };

  return settings[intensity];
}

/**
 * 色覚異常対応色を取得
 */
export function getColorBlindnessSafeColor(
  originalColor: string,
  type: AccessibilityState['colorBlindnessType']
): string {
  if (type === 'none') return originalColor;

  const colorMappings = {
    protanopia: {
      '#00ffff': '#0080ff', // cyan -> blue
      '#ff00ff': '#ffaa00', // magenta -> orange
      '#ffff00': '#8000ff', // yellow -> purple
    },
    deuteranopia: {
      '#00ffff': '#0066cc', // cyan -> blue
      '#ff00ff': '#ff6600', // magenta -> orange
      '#ffff00': '#cc00cc', // yellow -> purple
    },
    tritanopia: {
      '#00ffff': '#ff0066', // cyan -> pink
      '#ff00ff': '#66ff00', // magenta -> green
      '#ffff00': '#6600ff', // yellow -> purple
    },
  };

  return (
    colorMappings[type][originalColor as keyof (typeof colorMappings)[typeof type]] || originalColor
  );
}

/**
 * システムアクセシビリティ設定を検出
 */
export function detectSystemAccessibilitySettings(): Partial<AccessibilityState> {
  const settings: Partial<AccessibilityState> = {};

  if (typeof window === 'undefined') return settings;

  try {
    // Reduced motion の検出
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      settings.reducedMotion = true;
      settings.animationIntensity = 'reduced';
    }

    // High contrast の検出
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      settings.contrast = 'high';
      settings.visual = {
        ...(settings.visual || {}),
        highContrast: true,
      } as VisualAssistance;
    }

    // Dark mode preference (contrast adjustment)
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      settings.contrast = 'high';
    }

    // Large text preference detection (experimental)
    if (window.matchMedia('(prefers-reduced-data: reduce)').matches) {
      settings.fontSize = 'large';
    }
  } catch (error) {
    console.warn('Failed to detect system accessibility preferences:', error);
  }

  return settings;
}

/**
 * WCAG準拠チェック
 */
export interface WCAGComplianceResult {
  level: 'A' | 'AA' | 'AAA' | 'non-compliant';
  issues: string[];
  recommendations: string[];
  score: number; // 0-100
}

export function checkWCAGCompliance(accessibility: AccessibilityState): WCAGComplianceResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Contrast checking (WCAG 1.4.3 - Level AA)
  if (accessibility.contrast === 'low') {
    issues.push('Low contrast may not meet WCAG AA requirements (1.4.3)');
    recommendations.push('Set contrast to "normal" or "high" for better accessibility');
    score -= 20;
  }

  // Animation and motion (WCAG 2.3.3 - Level AAA)
  if (accessibility.animationIntensity === 'enhanced' && !accessibility.reducedMotion) {
    recommendations.push("Consider respecting user's reduced motion preferences (WCAG 2.3.3)");
    score -= 5;
  }

  // Keyboard accessibility (WCAG 2.1.1 - Level A)
  if (!accessibility.keyboard.enabled) {
    issues.push('Keyboard navigation is disabled (WCAG 2.1.1 - Level A)');
    recommendations.push('Enable keyboard navigation for full accessibility');
    score -= 30;
  }

  // Focus indicators (WCAG 2.4.7 - Level AA)
  if (!accessibility.keyboard.focusOutline) {
    issues.push('Focus outlines are disabled (WCAG 2.4.7 - Level AA)');
    recommendations.push('Enable focus outlines for keyboard users');
    score -= 15;
  }

  // Text alternatives and feedback (WCAG 1.1.1 - Level A)
  if (!accessibility.feedback.soundEffects && !accessibility.feedback.voiceAnnouncements) {
    recommendations.push('Consider providing audio feedback for game events (WCAG 1.1.1)');
    score -= 5;
  }

  // Color alone (WCAG 1.4.1 - Level A)
  if (accessibility.colorBlindnessType === 'none' && !accessibility.gameSpecific.colorCodedPieces) {
    recommendations.push('Ensure information is not conveyed by color alone (WCAG 1.4.1)');
    score -= 10;
  }

  // Determine compliance level
  let level: WCAGComplianceResult['level'] = 'AAA';
  if (score < 60) {
    level = 'non-compliant';
  } else if (score < 80) {
    level = 'A';
  } else if (score < 95) {
    level = 'AA';
  }

  return { level, issues, recommendations, score };
}

/**
 * アクセシビリティ推奨設定を生成
 */
export function generateAccessibilityRecommendations(
  currentSettings: AccessibilityState,
  userNeeds?: {
    visualImpairment?: boolean;
    motorImpairment?: boolean;
    cognitiveImpairment?: boolean;
    hearingImpairment?: boolean;
  }
): Partial<AccessibilityState> {
  const recommendations: Partial<AccessibilityState> = {};

  if (userNeeds?.visualImpairment) {
    recommendations.contrast = 'high';
    recommendations.fontSize = 'large';
    recommendations.visual = {
      ...currentSettings.visual,
      highContrast: true,
      largeText: true,
      boldText: true,
      cursorSize: 'large',
    };
    recommendations.gameSpecific = {
      ...currentSettings.gameSpecific,
      gridLines: true,
      colorCodedPieces: true,
    };
  }

  if (userNeeds?.motorImpairment) {
    recommendations.animationIntensity = 'reduced';
    recommendations.keyboard = {
      ...currentSettings.keyboard,
      enabled: true,
      focusOutline: true,
      tabOrder: 'optimized',
    };
    recommendations.cognitive = {
      ...currentSettings.cognitive,
      confirmActions: true,
      timeoutWarnings: true,
      pauseOnFocusLoss: true,
    };
  }

  if (userNeeds?.cognitiveImpairment) {
    recommendations.cognitive = {
      ...currentSettings.cognitive,
      simplifiedUI: true,
      confirmActions: true,
      timeoutWarnings: true,
      autoSave: true,
    };
    recommendations.animationIntensity = 'reduced';
  }

  if (userNeeds?.hearingImpairment) {
    recommendations.feedback = {
      ...currentSettings.feedback,
      voiceAnnouncements: false,
      hapticFeedback: true,
    };
    recommendations.visual = {
      ...currentSettings.visual,
      underlineLinks: true,
    };
    recommendations.gameSpecific = {
      ...currentSettings.gameSpecific,
      visualGameOver: true,
    };
  }

  return recommendations;
}

/**
 * アクセシビリティレポートを生成
 */
export function generateAccessibilityReport(accessibility: AccessibilityState): {
  summary: string;
  compliance: WCAGComplianceResult;
  settings: {
    category: string;
    items: {
      name: string;
      value: string;
      status: 'optimal' | 'acceptable' | 'needs-improvement';
    }[];
  }[];
} {
  const compliance = checkWCAGCompliance(accessibility);

  const settings = [
    {
      category: 'Visual Accessibility',
      items: [
        {
          name: 'Contrast Level',
          value: accessibility.contrast,
          status: (accessibility.contrast === 'high'
            ? 'optimal'
            : accessibility.contrast === 'normal'
              ? 'acceptable'
              : 'needs-improvement') as 'optimal' | 'acceptable' | 'needs-improvement',
        },
        {
          name: 'Font Size',
          value: accessibility.fontSize,
          status: (accessibility.fontSize === 'large' || accessibility.fontSize === 'extra-large'
            ? 'optimal'
            : 'acceptable') as 'optimal' | 'acceptable' | 'needs-improvement',
        },
        {
          name: 'High Contrast',
          value: accessibility.visual.highContrast ? 'Enabled' : 'Disabled',
          status: (accessibility.visual.highContrast ? 'optimal' : 'acceptable') as
            | 'optimal'
            | 'acceptable'
            | 'needs-improvement',
        },
      ],
    },
    {
      category: 'Motion & Animation',
      items: [
        {
          name: 'Animation Intensity',
          value: accessibility.animationIntensity,
          status: (accessibility.animationIntensity === 'reduced' ||
          accessibility.animationIntensity === 'none'
            ? 'optimal'
            : 'acceptable') as 'optimal' | 'acceptable' | 'needs-improvement',
        },
        {
          name: 'Reduced Motion',
          value: accessibility.reducedMotion ? 'Enabled' : 'Disabled',
          status: (accessibility.reducedMotion ? 'optimal' : 'acceptable') as
            | 'optimal'
            | 'acceptable'
            | 'needs-improvement',
        },
      ],
    },
    {
      category: 'Keyboard & Navigation',
      items: [
        {
          name: 'Keyboard Navigation',
          value: accessibility.keyboard.enabled ? 'Enabled' : 'Disabled',
          status: (accessibility.keyboard.enabled ? 'optimal' : 'needs-improvement') as
            | 'optimal'
            | 'acceptable'
            | 'needs-improvement',
        },
        {
          name: 'Focus Outlines',
          value: accessibility.keyboard.focusOutline ? 'Enabled' : 'Disabled',
          status: (accessibility.keyboard.focusOutline ? 'optimal' : 'needs-improvement') as
            | 'optimal'
            | 'acceptable'
            | 'needs-improvement',
        },
      ],
    },
  ];

  const summary =
    `WCAG ${compliance.level} compliance (${compliance.score}/100 score). ` +
    `${compliance.issues.length} critical issues, ${compliance.recommendations.length} recommendations.`;

  return { summary, compliance, settings };
}
