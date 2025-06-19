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
            'group-[.toaster]:bg-background/90 group-[.toaster]:text-foreground group-[.toaster]:border-theme-foreground/30 group-[.toaster]:backdrop-blur-sm group-[.toaster]:shadow-lg',
          description: 'group-[.toaster]:text-cyber-purple',
          actionButton: 'group-[.toaster]:bg-theme-foreground group-[.toaster]:text-background',
          cancelButton:
            'group-[.toaster]:bg-theme-foreground/20 group-[.toaster]:text-theme-foreground',
          error:
            'group-[.toaster]:bg-theme-foreground/10 group-[.toaster]:border-theme-foreground/30 group-[.toaster]:text-theme-foreground',
          success:
            'group-[.toaster]:bg-theme-foreground/10 group-[.toaster]:border-theme-foreground/30 group-[.toaster]:text-theme-foreground',
          warning:
            'group-[.toaster]:bg-theme-foreground/10 group-[.toaster]:border-theme-foreground/30 group-[.toaster]:text-theme-foreground',
          info: 'group-[.toaster]:bg-theme-foreground/10 group-[.toaster]:border-theme-foreground/30 group-[.toaster]:text-theme-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
