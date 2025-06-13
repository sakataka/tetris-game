/**
 * Enhanced utility function for combining CSS class names
 * Provides Tailwind CSS v4 class merging capabilities with type safety
 */

// Type definitions for better type safety
export type ClassName = string | undefined | null | false;
export type ConditionalClassName = ClassName | Record<string, boolean>;

/**
 * Combines and filters CSS class names with enhanced type safety
 * @param classes - Array of class names, conditional class names, or objects
 * @returns Combined class string
 */
export function cn(...classes: (ClassName | ConditionalClassName)[]): string {
  const resolvedClasses: string[] = [];

  for (const cls of classes) {
    if (!cls) continue;

    if (typeof cls === 'string') {
      resolvedClasses.push(cls);
    } else if (typeof cls === 'object' && cls !== null) {
      // Handle conditional classes object: { 'class-name': boolean }
      for (const [className, condition] of Object.entries(cls)) {
        if (condition) {
          resolvedClasses.push(className);
        }
      }
    }
  }

  return resolvedClasses.join(' ').trim();
}

/**
 * Create a theme-aware class name builder
 * @param baseClasses - Base classes to always apply
 * @returns Function that accepts additional classes and returns combined string
 */
export function createThemeClassBuilder(baseClasses: string) {
  return (...additionalClasses: ClassName[]): string => {
    return cn(baseClasses, ...additionalClasses);
  };
}

/**
 * Responsive class name builder using modern CSS features
 * @param classes - Object with responsive modifiers
 * @returns Combined responsive class string
 */
export function responsive(classes: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  container?: string; // For container queries
}): string {
  const classNames: string[] = [];

  if (classes.base) classNames.push(classes.base);
  if (classes.sm) classNames.push(`sm:${classes.sm}`);
  if (classes.md) classNames.push(`md:${classes.md}`);
  if (classes.lg) classNames.push(`lg:${classes.lg}`);
  if (classes.xl) classNames.push(`xl:${classes.xl}`);
  if (classes.container) classNames.push(`@container:${classes.container}`);

  return classNames.join(' ').trim();
}
