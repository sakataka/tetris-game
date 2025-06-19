/**
 * Generic Object Comparison Hook
 *
 * Provides a reusable hook for comparing any two objects and tracking differences.
 * Built on top of the generic comparison utilities.
 */

import { useMemo } from 'react';
import { type ComparisonResult, compareObjects } from '@/config/utils';

export interface UseObjectComparisonOptions {
  /**
   * If true, returns comparison immediately even if objects are null/undefined
   * If false, returns null when either object is null/undefined
   */
  allowNullComparison?: boolean;
}

export interface ObjectComparisonResult<T> extends ComparisonResult {
  /**
   * First object being compared
   */
  object1: T | null;
  /**
   * Second object being compared
   */
  object2: T | null;
  /**
   * Number of differences found
   */
  differenceCount: number;
  /**
   * Whether comparison was performed (both objects are available)
   */
  isReady: boolean;
}

/**
 * Hook for comparing two objects and getting detailed difference information
 *
 * @example
 * ```typescript
 * const config1 = { theme: 'dark', volume: 0.5 };
 * const config2 = { theme: 'light', volume: 0.5 };
 *
 * const comparison = useObjectComparison(config1, config2);
 * // comparison.identical: false
 * // comparison.differences: ['theme: dark → light']
 * // comparison.differenceCount: 1
 * ```
 */
export function useObjectComparison<T extends Record<string, unknown>>(
  object1: T | null,
  object2: T | null,
  options: UseObjectComparisonOptions = {}
): ObjectComparisonResult<T> {
  const { allowNullComparison = false } = options;

  return useMemo((): ObjectComparisonResult<T> => {
    // Handle null/undefined cases
    if (!object1 || !object2) {
      if (allowNullComparison) {
        return {
          object1,
          object2,
          identical: object1 === object2,
          differences: object1 !== object2 ? ['Object availability mismatch'] : [],
          differenceCount: object1 !== object2 ? 1 : 0,
          isReady: true,
        };
      }

      return {
        object1,
        object2,
        identical: true,
        differences: [],
        differenceCount: 0,
        isReady: false,
      };
    }

    // Perform comparison using generic utility
    const comparison = compareObjects(object1, object2);

    return {
      object1,
      object2,
      identical: comparison.identical,
      differences: comparison.differences,
      differenceCount: comparison.differences.length,
      isReady: true,
    };
  }, [object1, object2, allowNullComparison]);
}

/**
 * Specialized hook for configuration comparison
 * Provides configuration-specific formatting and helpers
 */
export function useConfigurationComparison<T extends Record<string, unknown>>(
  currentConfig: T | null,
  defaultConfig: T | null
) {
  const comparison = useObjectComparison(currentConfig, defaultConfig);

  const categorizedDifferences = useMemo(() => {
    const categories: Record<string, string[]> = {};

    comparison.differences.forEach((diff) => {
      const [path] = diff.split(':');
      const category = path?.split('.')[0] || 'general';

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(diff);
    });

    return categories;
  }, [comparison.differences]);

  return {
    ...comparison,
    categorizedDifferences,
    hasChanges: !comparison.identical && comparison.isReady,
    isModified: comparison.isReady && !comparison.identical,
  };
}
