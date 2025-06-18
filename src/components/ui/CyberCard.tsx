import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PADDING_SCALE } from '@/constants/layout';
import { cn } from '@/utils/ui/cn';

/**
 * Cyberpunk-themed Card component based on shadcn/ui Card
 *
 * Uses semantic color tokens for dynamic theming across all themes.
 * Automatically adapts to current theme without hardcoded colors.
 *
 * Theme Usage Guidelines:
 * - primary: Main game information (Score, Level, Next Piece)
 * - default: Secondary information (Settings, Statistics, Options)
 * - muted: Background or less important content (Help, About)
 *
 * Size Guidelines:
 * - xs: Compact mobile displays
 * - sm: Mobile/tablet secondary content
 * - md: Standard desktop content
 * - lg: Hero sections or important panels
 */

export type CyberTheme =
  | 'primary' // Main information (score, game stats)
  | 'default' // Secondary information (settings, options)
  | 'muted'; // Background or less important content

interface CyberCardProps {
  title: string;
  children: ReactNode;
  theme?: CyberTheme;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

// Simplified theme configurations for clear visual hierarchy
const CYBER_THEMES: Record<
  CyberTheme,
  {
    cardClass: string;
    titleClass: string;
    backgroundClass: string;
    borderGlow: string;
  }
> = {
  primary: {
    cardClass: 'bg-theme-foreground/15 border-theme-foreground/40',
    titleClass: 'text-theme-foreground',
    backgroundClass: 'bg-theme-foreground-20',
    borderGlow: 'border border-theme-foreground-40',
  },
  default: {
    cardClass: 'bg-theme-surface/50 border-theme-border/40',
    titleClass: 'text-theme-foreground',
    backgroundClass: 'bg-theme-surface/60',
    borderGlow: 'border border-theme-border/50',
  },
  muted: {
    cardClass: 'bg-theme-foreground/10 border-theme-foreground/30',
    titleClass: 'text-theme-foreground opacity-70',
    backgroundClass: 'bg-theme-surface/30',
    borderGlow: 'border border-theme-border/30',
  },
};

// Responsive size configurations using 8-point grid
const CYBER_SIZES: Record<
  'xs' | 'sm' | 'md' | 'lg',
  {
    cardPadding: string;
    titleSize: string;
    titleSpacing: string;
    contentSpacing: string;
  }
> = {
  xs: {
    cardPadding: PADDING_SCALE.xs, // 8px
    titleSize: 'text-xs',
    titleSpacing: 'mb-2', // 8px (8-point grid)
    contentSpacing: 'space-y-2', // 8px (8-point grid)
  },
  sm: {
    cardPadding: PADDING_SCALE.sm, // 16px
    titleSize: 'text-sm',
    titleSpacing: 'mb-2 md:mb-2', // 8px consistent (8-point grid)
    contentSpacing: 'space-y-2', // 8px (8-point grid)
  },
  md: {
    cardPadding: PADDING_SCALE.md, // 24px
    titleSize: 'text-base',
    titleSpacing: 'mb-2 md:mb-4', // 8px -> 16px (8-point grid)
    contentSpacing: 'space-y-4', // 16px (8-point grid)
  },
  lg: {
    cardPadding: PADDING_SCALE.lg, // 32px
    titleSize: 'text-lg',
    titleSpacing: 'mb-4 md:mb-4', // 16px consistent (8-point grid)
    contentSpacing: 'space-y-4', // 16px (8-point grid)
  },
};

/**
 * CyberCard component that maintains PanelBase API while using shadcn/ui Card
 */
export function CyberCard({
  title,
  children,
  theme = 'default',
  className = '',
  titleClassName = '',
  contentClassName = '',
  size = 'md',
}: CyberCardProps) {
  const themeConfig = CYBER_THEMES[theme];
  const sizeConfig = CYBER_SIZES[size];

  return (
    <Card
      className={cn(
        // Base shadcn/ui Card styling
        'relative overflow-hidden',
        // Cyberpunk theme styling
        themeConfig.cardClass,
        themeConfig.backgroundClass,
        themeConfig.borderGlow,
        // Size-based padding override
        sizeConfig.cardPadding,
        // Custom overrides
        className
      )}
    >
      <CardHeader className={cn('pb-0', sizeConfig.titleSpacing)}>
        <CardTitle
          className={cn('font-bold', sizeConfig.titleSize, themeConfig.titleClass, titleClassName)}
        >
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className={cn('relative', sizeConfig.contentSpacing, contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

export default CyberCard;
