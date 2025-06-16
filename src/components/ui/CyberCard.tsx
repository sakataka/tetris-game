import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/ui/cn';
import type { ReactNode } from 'react';

/**
 * Cyberpunk-themed Card component based on shadcn/ui Card
 *
 * Replaces PanelBase with improved architecture while maintaining cyberpunk aesthetics.
 * Uses shadcn/ui Card as foundation for better accessibility and maintainability.
 */

export type CyberTheme = 'cyan' | 'purple' | 'green' | 'yellow' | 'red' | 'default';

interface CyberCardProps {
  title: string;
  children: ReactNode;
  theme?: CyberTheme;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

// Enhanced theme configurations with cyber aesthetics
const CYBER_THEMES: Record<
  CyberTheme,
  {
    cardClass: string;
    titleClass: string;
    backgroundClass: string;
    borderGlow: string;
  }
> = {
  cyan: {
    cardClass: 'bg-cyber-cyan/5 border-cyber-cyan/30',
    titleClass: 'text-cyber-cyan',
    backgroundClass: 'bg-cyber-cyan-10',
    borderGlow: 'border border-cyber-cyan-30',
  },
  purple: {
    cardClass: 'bg-cyber-purple/5 border-cyber-purple/30',
    titleClass: 'text-cyber-purple',
    backgroundClass: 'bg-cyber-purple-10',
    borderGlow: 'border border-cyber-purple-30',
  },
  green: {
    cardClass: 'bg-cyber-green/5 border-cyber-green/30',
    titleClass: 'text-cyber-green',
    backgroundClass: 'bg-cyber-green-10',
    borderGlow: 'border border-cyber-green-30',
  },
  yellow: {
    cardClass: 'bg-cyber-yellow/5 border-cyber-yellow/30',
    titleClass: 'text-cyber-yellow',
    backgroundClass: 'bg-cyber-yellow-10',
    borderGlow: 'border border-cyber-yellow-30',
  },
  red: {
    cardClass: 'bg-cyber-red/5 border-cyber-red/30',
    titleClass: 'text-cyber-red',
    backgroundClass: 'bg-cyber-red-10',
    borderGlow: 'border border-cyber-red-30',
  },
  default: {
    cardClass: 'bg-gray-500/5 border-gray-500/30',
    titleClass: 'text-gray-400',
    backgroundClass: 'bg-gray-800/30',
    borderGlow: 'border border-gray-700/50',
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
