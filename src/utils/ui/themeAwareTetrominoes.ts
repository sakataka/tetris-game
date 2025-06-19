/**
 * Theme-aware tetromino colors
 *
 * This module provides tetromino colors that adapt to the current theme
 * while maintaining good distinguishability between pieces.
 */

import { TETROMINO_COLORS as FALLBACK_COLORS } from '@/constants/tetrominoes';
import type { ThemeVariant } from '@/types/tetris';
import { getUnifiedThemeConfig } from './unifiedThemeSystem';

/**
 * Get tetromino colors for the current theme
 * Falls back to default colors if theme colors are not available
 */
export function getTetrominoColors(themeVariant?: ThemeVariant): Record<string, string> {
  if (!themeVariant) {
    // Try to read from CSS variables if no theme variant provided
    const colors: Record<string, string> = {};
    const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;

    pieces.forEach((piece) => {
      const computedValue = getComputedStyle(document.documentElement)
        .getPropertyValue(`--tetromino-${piece.toLowerCase()}`)
        .trim();

      if (computedValue) {
        colors[piece] = computedValue;
      } else {
        // Fallback to default colors
        colors[piece] = FALLBACK_COLORS[piece];
      }
    });

    return colors;
  }

  try {
    const themeConfig = getUnifiedThemeConfig(themeVariant);
    return themeConfig.tetrominoes;
  } catch {
    // Fallback to default colors if theme colors are not available
    return FALLBACK_COLORS;
  }
}

/**
 * Get a specific tetromino color for the current theme
 */
export function getTetrominoColor(
  piece: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L',
  themeVariant?: ThemeVariant
): string {
  const colors = getTetrominoColors(themeVariant);
  return colors[piece] || FALLBACK_COLORS[piece];
}

/**
 * Theme-aware tetromino colors that can be used in place of the original constants
 * This function should be called when the theme changes to get updated colors
 */
export function createThemeAwareTetrominoColors(themeVariant: ThemeVariant) {
  return getTetrominoColors(themeVariant);
}

/**
 * CSS variable references for tetromino colors
 * Use these in CSS or styled components
 */
export const TETROMINO_CSS_VARS = {
  I: 'var(--tetromino-i)',
  O: 'var(--tetromino-o)',
  T: 'var(--tetromino-t)',
  S: 'var(--tetromino-s)',
  Z: 'var(--tetromino-z)',
  J: 'var(--tetromino-j)',
  L: 'var(--tetromino-l)',
} as const;

/**
 * Theme-aware wrapper for getRandomTetromino
 * This function can be used by stores and components that need theme-aware tetromino generation
 */
export function createThemeAwareTetromino(debugMode = false, themeVariant?: ThemeVariant) {
  const colors = getTetrominoColors(themeVariant);
  // We'll import this dynamically to avoid circular dependencies
  const { getRandomTetromino } = require('@/utils/game/tetrisUtils');
  return getRandomTetromino(debugMode, colors);
}
