import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme='dark'
      className='toaster group'
      style={
        {
          '--normal-bg': 'var(--background)',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'var(--theme-primary-30)',
        } as React.CSSProperties
      }
      position='top-right'
      toastOptions={{
        classNames: {
          toast:
            'group-[.toaster]:bg-background/90 group-[.toaster]:text-foreground group-[.toaster]:border-theme-primary/30 group-[.toaster]:backdrop-blur-sm group-[.toaster]:shadow-lg',
          description: 'group-[.toaster]:text-cyber-purple',
          actionButton: 'group-[.toaster]:bg-theme-primary group-[.toaster]:text-background',
          cancelButton: 'group-[.toaster]:bg-theme-error/20 group-[.toaster]:text-theme-error',
          error:
            'group-[.toaster]:bg-theme-error/10 group-[.toaster]:border-theme-error/30 group-[.toaster]:text-theme-error',
          success:
            'group-[.toaster]:bg-theme-success/10 group-[.toaster]:border-theme-success/30 group-[.toaster]:text-theme-success',
          warning:
            'group-[.toaster]:bg-theme-warning/10 group-[.toaster]:border-theme-warning/30 group-[.toaster]:text-theme-warning',
          info: 'group-[.toaster]:bg-theme-secondary/10 group-[.toaster]:border-theme-secondary/30 group-[.toaster]:text-theme-secondary',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
