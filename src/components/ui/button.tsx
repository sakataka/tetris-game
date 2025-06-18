import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/utils/ui/cn';

/**
 * Button Component Usage Guidelines
 * 
 * Variants:
 * - primary: Main actions (Start, Pause, Resume, Play)
 * - secondary: Options and settings (Settings, Cancel, Back)
 * - ghost: Destructive or low-priority actions (Reset, Clear, Delete)
 * 
 * Sizes:
 * - sm: 32px height for compact spaces
 * - default: 40px height for standard use
 * - lg: 48px height for important actions
 * - icon: 40px square for icon-only buttons
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Primary: Main actions (Start, Pause, Resume)
        primary: 'bg-theme-primary/20 text-theme-primary border border-theme-primary/40 hover:bg-theme-primary/30 transition-colors duration-150',
        
        // Secondary: Options and settings
        secondary: 'bg-theme-surface/50 text-theme-foreground border border-theme-border/40 hover:bg-theme-surface/70 transition-colors duration-150',
        
        // Ghost: Destructive or low-priority actions (Reset, Clear)
        ghost: 'bg-transparent text-theme-muted border border-transparent hover:bg-theme-error/20 hover:text-theme-error hover:border-theme-error/40 transition-colors duration-150',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3', // 40px height (8-point grid: 5 units)
        sm: 'h-8 rounded-md gap-2 px-4 has-[>svg]:px-3', // 32px height (8-point grid: 4 units), gap-2=8px
        lg: 'h-12 rounded-md px-6 has-[>svg]:px-4', // 48px height (8-point grid: 6 units)
        icon: 'size-10', // 40px square (8-point grid: 5 units)
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
