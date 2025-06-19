import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
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
        // Primary: Main actions (Start, Pause, Resume) - Uses theme's primary color palette
        primary:
          'bg-theme-foreground/15 text-theme-foreground border border-theme-foreground/50 hover:bg-theme-foreground/25 hover:border-theme-foreground/70 hover:shadow-lg hover:shadow-theme-primary/20 transition-all duration-200',

        // Secondary: Options and settings - Uses theme's secondary color palette
        secondary:
          'bg-theme-foreground/15 text-theme-foreground border border-theme-foreground/50 hover:bg-theme-foreground/25 hover:border-theme-foreground/70 hover:shadow-lg hover:shadow-theme-secondary/20 transition-all duration-200',

        // Ghost: Destructive or low-priority actions (Reset, Clear) - Uses theme's accent/warning colors
        ghost:
          'bg-transparent text-theme-foreground border border-theme-foreground/30 hover:bg-theme-foreground/15 hover:text-theme-foreground hover:border-theme-foreground/60 hover:shadow-md hover:shadow-theme-accent/15 transition-all duration-200',
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

export { Button };
