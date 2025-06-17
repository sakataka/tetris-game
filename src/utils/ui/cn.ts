/**
 * Enhanced utility function for combining CSS class names
 * Provides Tailwind CSS v4.1 class merging capabilities with advanced type safety
 * Supports conditional classes, responsive utilities, and modern CSS features
 * Compatible with shadcn/ui components
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Enhanced type definitions for better type safety
export type ClassName = string | number | undefined | null | false | 0;
export type ConditionalClassName = ClassName | Record<string, boolean | undefined | null>;
export type ResponsiveClasses = {
  base?: ClassName;
  xs?: ClassName;
  sm?: ClassName;
  md?: ClassName;
  lg?: ClassName;
  xl?: ClassName;
  '2xl'?: ClassName;
  container?: ClassName; // For container queries
  print?: ClassName; // For print styles
};

export type AccessibilityClasses = {
  'motion-safe'?: ClassName;
  'motion-reduce'?: ClassName;
  'high-contrast'?: ClassName;
  'low-contrast'?: ClassName;
  'focus-visible'?: ClassName;
  'focus-within'?: ClassName;
};

export type StateClasses = {
  hover?: ClassName;
  focus?: ClassName;
  active?: ClassName;
  disabled?: ClassName;
  visited?: ClassName;
  'group-hover'?: ClassName;
  'peer-focus'?: ClassName;
};

/**
 * Helper function to add classes to Set
 */
function addClassesToSet(classString: string, classSet: Set<string>): void {
  const trimmed = classString.trim();
  if (trimmed) {
    trimmed.split(/\s+/).forEach((c) => classSet.add(c));
  }
}

/**
 * Helper function to process conditional classes
 */
function processConditionalClasses(obj: Record<string, unknown>, classSet: Set<string>): void {
  for (const [className, condition] of Object.entries(obj)) {
    if (condition) {
      addClassesToSet(className, classSet);
    }
  }
}

/**
 * Combines and filters CSS class names with enhanced type safety
 * Compatible with shadcn/ui and supports both legacy and modern approaches
 * @param inputs - Array of class names, conditional class names, or objects
 * @returns Combined class string with duplicates removed and Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Legacy cn function for backward compatibility with existing cyberpunk theme utilities
 * @param classes - Array of class names, conditional class names, or objects
 * @returns Combined class string with duplicates removed
 */
export function cnLegacy(...classes: (ClassName | ConditionalClassName)[]): string {
  const resolvedClasses = new Set<string>();

  for (const cls of classes) {
    if (!cls && cls !== 0) continue;

    if (typeof cls === 'string' || typeof cls === 'number') {
      addClassesToSet(String(cls), resolvedClasses);
    } else if (typeof cls === 'object' && cls !== null) {
      processConditionalClasses(cls, resolvedClasses);
    }
  }

  return Array.from(resolvedClasses).join(' ');
}

/**
 * Create a theme-aware class name builder with cyberpunk theme support
 * @param baseClasses - Base classes to always apply
 * @returns Function that accepts additional classes and returns combined string
 */
export function createThemeClassBuilder(baseClasses: ClassName) {
  return (...additionalClasses: (ClassName | ConditionalClassName)[]): string => {
    return cn(baseClasses, ...additionalClasses);
  };
}

/**
 * Enhanced responsive class name builder using modern CSS features
 * @param classes - Object with responsive modifiers including container queries
 * @returns Combined responsive class string
 */
export function responsive(classes: ResponsiveClasses): string {
  const classNames: string[] = [];

  // Base classes (no prefix)
  if (classes.base) classNames.push(String(classes.base));

  // Standard responsive breakpoints
  if (classes.xs) classNames.push(`xs:${classes.xs}`);
  if (classes.sm) classNames.push(`sm:${classes.sm}`);
  if (classes.md) classNames.push(`md:${classes.md}`);
  if (classes.lg) classNames.push(`lg:${classes.lg}`);
  if (classes.xl) classNames.push(`xl:${classes.xl}`);
  if (classes['2xl']) classNames.push(`2xl:${classes['2xl']}`);

  // Container queries (Tailwind v4 feature)
  if (classes.container) classNames.push(`@container:${classes.container}`);

  // Print styles
  if (classes.print) classNames.push(`print:${classes.print}`);

  return cn(...classNames);
}

/**
 * Accessibility-aware class name builder
 * @param classes - Object with accessibility modifiers
 * @returns Combined accessibility class string
 */
export function accessible(classes: AccessibilityClasses): string {
  const classNames: string[] = [];

  if (classes['motion-safe']) classNames.push(`motion-safe:${classes['motion-safe']}`);
  if (classes['motion-reduce']) classNames.push(`motion-reduce:${classes['motion-reduce']}`);
  if (classes['high-contrast']) classNames.push(`contrast-more:${classes['high-contrast']}`);
  if (classes['low-contrast']) classNames.push(`contrast-less:${classes['low-contrast']}`);
  if (classes['focus-visible']) classNames.push(`focus-visible:${classes['focus-visible']}`);
  if (classes['focus-within']) classNames.push(`focus-within:${classes['focus-within']}`);

  return cn(...classNames);
}

/**
 * Interactive state class name builder
 * @param classes - Object with state modifiers
 * @returns Combined state class string
 */
export function interactive(classes: StateClasses): string {
  const classNames: string[] = [];

  if (classes.hover) classNames.push(`hover:${classes.hover}`);
  if (classes.focus) classNames.push(`focus:${classes.focus}`);
  if (classes.active) classNames.push(`active:${classes.active}`);
  if (classes.disabled) classNames.push(`disabled:${classes.disabled}`);
  if (classes.visited) classNames.push(`visited:${classes.visited}`);
  if (classes['group-hover']) classNames.push(`group-hover:${classes['group-hover']}`);
  if (classes['peer-focus']) classNames.push(`peer-focus:${classes['peer-focus']}`);

  return cn(...classNames);
}

/**
 * Combined responsive and interactive class builder
 * @param options - Combined responsive, accessibility, and interactive classes
 * @returns Comprehensive class string
 */
export function comprehensive(options: {
  responsive?: ResponsiveClasses;
  accessibility?: AccessibilityClasses;
  interactive?: StateClasses;
  base?: ClassName;
}): string {
  const classes: ClassName[] = [];

  if (options.base) classes.push(options.base);
  if (options.responsive) classes.push(responsive(options.responsive));
  if (options.accessibility) classes.push(accessible(options.accessibility));
  if (options.interactive) classes.push(interactive(options.interactive));

  return cn(...classes);
}

/**
 * Cyberpunk-themed utility builders
 */
export const cyberTheme = {
  /**
   * Neon glow effect builder
   * @param color - Cyber color variant (cyan, purple, yellow, etc.)
   * @param intensity - Glow intensity (sm, md, lg, xl)
   */
  neonGlow: (
    color: 'cyan' | 'purple' | 'yellow' | 'green' | 'red' | 'blue' = 'cyan',
    intensity: 'sm' | 'md' | 'lg' | 'xl' = 'md'
  ) => {
    return `neon-border-${color} shadow-neon-${intensity}`;
  },

  /**
   * Hologram panel builder
   * @param variant - Hologram color variant
   * @param size - Panel size
   */
  hologram: (
    variant: 'cyan' | 'purple' | 'yellow' | 'default' = 'default',
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const baseClasses = variant === 'default' ? 'hologram' : `hologram-${variant}`;
    const sizeClasses = {
      sm: 'p-fluid-xs rounded-sm',
      md: 'p-fluid-sm rounded-md',
      lg: 'p-fluid-md rounded-lg',
    };
    return cn(baseClasses, sizeClasses[size]);
  },

  /**
   * Glass morphism panel builder
   * @param opacity - Background opacity level
   */
  glass: (opacity: 'light' | 'medium' | 'heavy' = 'medium') => {
    const opacityMap = {
      light: 'glass-panel bg-opacity-10',
      medium: 'glass-panel bg-opacity-20',
      heavy: 'glass-panel bg-opacity-30',
    };
    return opacityMap[opacity];
  },

  /**
   * Modern cyber button builder
   * @param variant - Button style variant
   * @param size - Button size
   */
  button: (
    variant: 'primary' | 'secondary' | 'ghost' = 'primary',
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const baseClasses = 'cyber-button transition-all duration-fast';

    const variantClasses = {
      primary: 'neon-border-cyan hover:shadow-neon-md',
      secondary: 'neon-border-purple hover:shadow-neon-md',
      ghost: 'border-transparent hover:neon-border-cyan',
    };

    const sizeClasses = {
      sm: 'text-fluid-sm p-fluid-xs',
      md: 'text-fluid-base p-fluid-sm',
      lg: 'text-fluid-lg p-fluid-md',
    };

    return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
  },
};

/**
 * Performance-optimized class builders
 */
export const performance = {
  /**
   * GPU acceleration utilities
   */
  accelerated: (transform = true, opacity = false) => {
    return cn(
      'gpu-accelerated',
      transform && 'will-change-transform',
      opacity && 'will-change-opacity'
    );
  },

  /**
   * Containment utilities for performance
   */
  contained: (type: 'strict' | 'content' | 'layout' | 'style' | 'paint' = 'layout') => {
    return `contain-${type}`;
  },

  /**
   * Optimized particle effects
   */
  particle: (modern = true) => {
    return modern ? 'particle-modern' : 'particle-optimized';
  },
};

/**
 * Utility for debugging class names in development
 * @param classes - Classes to debug
 * @param label - Optional label for console output
 */
export function debugClasses(classes: string, label?: string): string {
  if (import.meta.env.DEV) {
    const classArray = classes.split(' ').filter(Boolean);
    console.log(`🎨 ${label || 'Classes'}:`, classArray);
  }
  return classes;
}

/**
 * Type-safe variant builder for component APIs
 */
export function createVariants<T extends Record<string, Record<string, string>>>(variants: T) {
  return <K extends keyof T>(
    variant: K,
    value: keyof T[K],
    ...additionalClasses: ClassName[]
  ): string => {
    const variantClasses = (variants[variant]?.[value as string] as string) || '';
    return cn(variantClasses, ...additionalClasses);
  };
}

// Example variant configuration for Tetris components
export const tetrisVariants = createVariants({
  piece: {
    I: 'bg-theme-primary shadow-neon-sm',
    O: 'bg-cyber-yellow shadow-neon-sm',
    T: 'bg-cyber-purple shadow-neon-sm',
    L: 'bg-cyber-orange shadow-neon-sm',
    J: 'bg-cyber-blue shadow-neon-sm',
    S: 'bg-cyber-green shadow-neon-sm',
    Z: 'bg-cyber-red shadow-neon-sm',
  },
  panel: {
    game: 'glass-panel neon-border-cyan',
    info: 'hologram-purple p-fluid-md',
    stats: 'hologram-yellow p-fluid-sm',
    controls: 'glass-panel neon-border-purple',
  },
  button: {
    start: 'cyber-button neon-border-green text-cyber-green',
    pause: 'cyber-button neon-border-yellow text-cyber-yellow',
    reset: 'cyber-button neon-border-red text-cyber-red',
    settings: 'cyber-button neon-border-purple text-cyber-purple',
  },
});

// Default export for convenience
export default cn;
