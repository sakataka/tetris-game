import { type VariantProps, cva } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/utils/ui/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
        cyberpunk:
          'bg-gray-900/90 border-cyan-500/30 text-cyan-100 shadow-[0_0_15px_rgba(0,255,255,0.3)] backdrop-blur-sm',
        'cyberpunk-warning':
          'bg-yellow-500/10 border-yellow-400/50 text-yellow-100 shadow-[0_0_15px_rgba(255,255,0,0.3)] backdrop-blur-sm',
        'cyberpunk-error':
          'bg-red-500/10 border-red-400/50 text-red-100 shadow-[0_0_15px_rgba(255,0,0,0.3)] backdrop-blur-sm',
        'cyberpunk-success':
          'bg-green-500/10 border-green-400/50 text-green-100 shadow-[0_0_15px_rgba(0,255,0,0.3)] backdrop-blur-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot='alert'
      role='alert'
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-title'
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-description'
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
