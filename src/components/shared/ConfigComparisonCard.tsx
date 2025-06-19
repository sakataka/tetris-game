/**
 * Reusable Configuration Comparison Card Component
 *
 * A flexible component for displaying object comparisons in a cyberpunk-themed card.
 * Can be used for configuration comparison, settings diff, or any object comparison.
 */

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import CyberCard, { type CyberTheme } from '@/components/ui/CyberCard';
import { type ObjectComparisonResult, useObjectComparison } from '@/hooks/useObjectComparison';
import { cn } from '@/utils/ui/cn';

export interface ConfigComparisonCardProps<T extends Record<string, unknown>> {
  /**
   * Title displayed in the card header
   */
  title: string;

  /**
   * First object to compare (typically current/modified config)
   */
  object1: T | null;

  /**
   * Second object to compare (typically default/original config)
   */
  object2: T | null;

  /**
   * Labels for the objects being compared
   */
  labels?: {
    object1?: string;
    object2?: string;
  };

  /**
   * Theme for the CyberCard
   */
  theme?: CyberTheme;

  /**
   * Size for the CyberCard
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';

  /**
   * Custom render function for difference items
   */
  renderDifference?: (difference: string, index: number) => ReactNode;

  /**
   * Custom render function for the comparison summary
   */
  renderSummary?: (comparison: ObjectComparisonResult<T>) => ReactNode;

  /**
   * Maximum number of differences to display (defaults to 10)
   */
  maxDifferences?: number;

  /**
   * Whether to show categorized differences (groups by object property path)
   */
  showCategories?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to show the comparison when objects are identical
   */
  showWhenIdentical?: boolean;
}

function DefaultDifferenceRenderer({ difference, index }: { difference: string; index: number }) {
  const [path, change] = difference.split(': ');
  const [from, to] = change?.split(' → ') || [change, ''];

  return (
    <div
      key={index}
      className='text-sm text-theme-foreground/80 p-2 bg-theme-surface/30 rounded border-l-2 border-theme-foreground/40'
    >
      <div className='font-mono text-xs text-theme-foreground/60 mb-1'>{path}</div>
      <div className='flex items-center gap-2'>
        <Badge variant='outline' className='text-xs bg-red-500/20 border-red-500/40 text-red-300'>
          {from}
        </Badge>
        <span className='text-theme-foreground/40'>→</span>
        <Badge
          variant='outline'
          className='text-xs bg-green-500/20 border-green-500/40 text-green-300'
        >
          {to}
        </Badge>
      </div>
    </div>
  );
}

function DefaultSummaryRenderer<T extends Record<string, unknown>>({
  comparison,
  labels,
}: {
  comparison: ObjectComparisonResult<T>;
  labels?: { object1?: string; object2?: string } | undefined;
}) {
  const { t } = useTranslation();

  if (!comparison.isReady) {
    return (
      <div className='text-center text-theme-foreground/60 py-4'>
        <div className='text-sm'>{t('comparison.notReady')}</div>
      </div>
    );
  }

  if (comparison.identical) {
    return (
      <div className='text-center text-theme-foreground/60 py-4'>
        <Badge variant='outline' className='bg-green-500/20 border-green-500/40 text-green-300'>
          {t('comparison.identical')}
        </Badge>
        <div className='text-xs mt-2'>
          {labels?.object1 || 'Object 1'} and {labels?.object2 || 'Object 2'} are identical
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='text-sm text-theme-foreground/80'>
          {t('comparison.differencesFound', { count: comparison.differenceCount })}
        </div>
        <Badge variant='outline' className='bg-orange-500/20 border-orange-500/40 text-orange-300'>
          {comparison.differenceCount}{' '}
          {comparison.differenceCount === 1 ? 'difference' : 'differences'}
        </Badge>
      </div>
    </div>
  );
}

export function ConfigComparisonCard<T extends Record<string, unknown>>({
  title,
  object1,
  object2,
  labels,
  theme = 'default',
  size = 'md',
  renderDifference,
  renderSummary,
  maxDifferences = 10,
  showCategories = false,
  className,
  showWhenIdentical = true,
}: ConfigComparisonCardProps<T>) {
  const comparison = useObjectComparison(object1, object2);

  // Don't render if objects are identical and showWhenIdentical is false
  if (comparison.identical && !showWhenIdentical) {
    return null;
  }

  const differences = comparison.differences.slice(0, maxDifferences);
  const hasMoreDifferences = comparison.differences.length > maxDifferences;

  const categorizedDifferences = showCategories
    ? differences.reduce(
        (acc, diff) => {
          const [path] = diff.split(':');
          const category = path?.split('.')[0] || 'general';
          if (!acc[category]) acc[category] = [];
          acc[category].push(diff);
          return acc;
        },
        {} as Record<string, string[]>
      )
    : null;

  return (
    <CyberCard title={title} theme={theme} size={size} className={cn('w-full', className)}>
      <div className='space-y-4'>
        {/* Summary */}
        {renderSummary ? (
          renderSummary(comparison)
        ) : (
          <DefaultSummaryRenderer comparison={comparison} labels={labels} />
        )}

        {/* Differences */}
        {comparison.isReady && !comparison.identical && (
          <div className='space-y-3'>
            {showCategories && categorizedDifferences ? (
              // Categorized view
              Object.entries(categorizedDifferences).map(([category, categoryDiffs]) => (
                <div key={category} className='space-y-2'>
                  <div className='text-sm font-medium text-theme-foreground/70 capitalize border-b border-theme-border/30 pb-1'>
                    {category}
                  </div>
                  <div className='space-y-2 pl-2'>
                    {categoryDiffs.map((diff, index) =>
                      renderDifference ? (
                        renderDifference(diff, index)
                      ) : (
                        <DefaultDifferenceRenderer key={index} difference={diff} index={index} />
                      )
                    )}
                  </div>
                </div>
              ))
            ) : (
              // Flat view
              <div className='space-y-2'>
                {differences.map((diff, index) =>
                  renderDifference ? (
                    renderDifference(diff, index)
                  ) : (
                    <DefaultDifferenceRenderer key={index} difference={diff} index={index} />
                  )
                )}
              </div>
            )}

            {/* Show truncation notice */}
            {hasMoreDifferences && (
              <div className='text-xs text-theme-foreground/50 text-center pt-2 border-t border-theme-border/20'>
                ... and {comparison.differences.length - maxDifferences} more differences
              </div>
            )}
          </div>
        )}
      </div>
    </CyberCard>
  );
}

export default ConfigComparisonCard;
