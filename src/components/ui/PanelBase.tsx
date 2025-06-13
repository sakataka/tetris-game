'use client';

import { type ReactNode, memo } from 'react';
import { cn } from '../../utils/ui';

/**
 * Unified Panel Base Component
 *
 * Eliminates duplicate UI patterns across all panel components.
 * Provides consistent hologram effects, neon borders, and responsive layout.
 */

export type PanelTheme = 'cyan' | 'purple' | 'green' | 'yellow' | 'red' | 'default';

interface PanelBaseProps {
  title: string;
  children: ReactNode;
  theme?: PanelTheme;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

// Theme configurations for consistent styling
const THEME_CONFIGS: Record<
  PanelTheme,
  {
    hologramClass: string;
    borderClass: string;
    titleColor: string;
  }
> = {
  cyan: {
    hologramClass: 'hologram-cyan',
    borderClass: 'neon-border',
    titleColor: 'text-cyan-400',
  },
  purple: {
    hologramClass: 'hologram-purple',
    borderClass: 'neon-border-purple',
    titleColor: 'text-purple-400',
  },
  green: {
    hologramClass: 'hologram',
    borderClass: 'neon-border',
    titleColor: 'text-green-400',
  },
  yellow: {
    hologramClass: 'hologram-yellow',
    borderClass: 'neon-border-yellow',
    titleColor: 'text-yellow-400',
  },
  red: {
    hologramClass: 'hologram-red',
    borderClass: 'neon-border-red',
    titleColor: 'text-red-400',
  },
  default: {
    hologramClass: 'hologram',
    borderClass: 'neon-border',
    titleColor: 'text-gray-400',
  },
};

// Modern size configurations using responsive utilities
const SIZE_CONFIGS: Record<
  'xs' | 'sm' | 'md' | 'lg',
  {
    padding: string;
    titleSize: string;
    titleSpacing: string;
  }
> = {
  xs: {
    padding: 'responsive-spacing-xs',
    titleSize: 'responsive-text-xs',
    titleSpacing: 'mb-1',
  },
  sm: {
    padding: 'responsive-spacing-sm',
    titleSize: 'responsive-text-sm',
    titleSpacing: 'mb-1 md:mb-2',
  },
  md: {
    padding: 'responsive-spacing-md',
    titleSize: 'responsive-text-base',
    titleSpacing: 'mb-2 md:mb-3',
  },
  lg: {
    padding: 'responsive-spacing-lg',
    titleSize: 'responsive-text-lg',
    titleSpacing: 'mb-3 md:mb-4',
  },
};

const PanelBase = memo(function PanelBase({
  title,
  children,
  theme = 'default',
  className = '',
  titleClassName = '',
  contentClassName = '',
  size = 'md',
}: PanelBaseProps) {
  const themeConfig = THEME_CONFIGS[theme];
  const sizeConfig = SIZE_CONFIGS[size];

  return (
    <div
      className={cn(
        themeConfig.hologramClass,
        themeConfig.borderClass,
        sizeConfig.padding,
        'rounded-lg relative overflow-hidden',
        className
      )}
    >
      {/* Panel Title */}
      <h3
        className={cn(
          sizeConfig.titleSize,
          sizeConfig.titleSpacing,
          'font-bold relative',
          themeConfig.titleColor,
          titleClassName
        )}
      >
        {title}
      </h3>

      {/* Panel Content */}
      <div className={cn('relative', contentClassName)}>{children}</div>
    </div>
  );
});

export default PanelBase;
