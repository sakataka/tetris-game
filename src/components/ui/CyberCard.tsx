import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/ui/cn';
import type { ReactNode } from 'react';

/**
 * Cyberpunk-themed Card component based on shadcn/ui Card
 *
 * Uses semantic color tokens for dynamic theming across all themes.
 * Automatically adapts to current theme without hardcoded colors.
 */

export type CyberTheme =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'default';

interface CyberCardProps {
  title: string;
  children: ReactNode;
  theme?: CyberTheme;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

// Semantic theme configurations for dynamic theming
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
    cardClass: 'bg-theme-primary/5 border-theme-primary/30',
    titleClass: 'text-theme-primary',
    backgroundClass: 'bg-theme-primary-10',
    borderGlow: 'border border-theme-primary-30',
  },
  secondary: {
    cardClass: 'bg-theme-secondary/5 border-theme-secondary/30',
    titleClass: 'text-theme-secondary',
    backgroundClass: 'bg-theme-secondary-10',
    borderGlow: 'border border-theme-secondary-30',
  },
  accent: {
    cardClass: 'bg-theme-accent/5 border-theme-accent/30',
    titleClass: 'text-theme-accent',
    backgroundClass: 'bg-theme-accent-10',
    borderGlow: 'border border-theme-accent-30',
  },
  success: {
    cardClass: 'bg-theme-success/5 border-theme-success/30',
    titleClass: 'text-theme-success',
    backgroundClass: 'bg-theme-success-10',
    borderGlow: 'border border-theme-success-30',
  },
  warning: {
    cardClass: 'bg-theme-warning/5 border-theme-warning/30',
    titleClass: 'text-theme-warning',
    backgroundClass: 'bg-theme-warning-10',
    borderGlow: 'border border-theme-warning-30',
  },
  error: {
    cardClass: 'bg-theme-error/5 border-theme-error/30',
    titleClass: 'text-theme-error',
    backgroundClass: 'bg-theme-error-10',
    borderGlow: 'border border-theme-error-30',
  },
  default: {
    cardClass: 'bg-theme-muted/5 border-theme-muted/30',
    titleClass: 'text-theme-muted',
    backgroundClass: 'bg-theme-surface/30',
    borderGlow: 'border border-theme-border/50',
  },
};

// Responsive size configurations
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
    cardPadding: 'p-2',
    titleSize: 'text-xs',
    titleSpacing: 'mb-1',
    contentSpacing: 'space-y-1',
  },
  sm: {
    cardPadding: 'p-3',
    titleSize: 'text-sm',
    titleSpacing: 'mb-1 md:mb-2',
    contentSpacing: 'space-y-2',
  },
  md: {
    cardPadding: 'p-4',
    titleSize: 'text-base',
    titleSpacing: 'mb-2 md:mb-3',
    contentSpacing: 'space-y-3',
  },
  lg: {
    cardPadding: 'p-6',
    titleSize: 'text-lg',
    titleSpacing: 'mb-3 md:mb-4',
    contentSpacing: 'space-y-4',
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
