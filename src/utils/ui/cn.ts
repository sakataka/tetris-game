/**
 * Utility function for combining CSS class names
 * Provides Tailwind CSS class merging capabilities
 */

/**
 * Combines and filters CSS class names
 * @param classes - Array of class names or conditional class names
 * @returns Combined class string
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ').trim();
}
