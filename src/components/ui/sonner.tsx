"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--cyber-cyan-30)",
        } as React.CSSProperties
      }
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'group-[.toaster]:bg-background/90 group-[.toaster]:text-foreground group-[.toaster]:border-cyber-cyan-30 group-[.toaster]:backdrop-blur-sm group-[.toaster]:shadow-lg',
          description: 'group-[.toaster]:text-cyber-purple',
          actionButton: 'group-[.toaster]:bg-cyber-cyan group-[.toaster]:text-background',
          cancelButton: 'group-[.toaster]:bg-cyber-red-20 group-[.toaster]:text-cyber-red',
          error: 'group-[.toaster]:bg-red-500/10 group-[.toaster]:border-red-400/30 group-[.toaster]:text-red-100',
          success: 'group-[.toaster]:bg-green-500/10 group-[.toaster]:border-green-400/30 group-[.toaster]:text-green-100',
          warning: 'group-[.toaster]:bg-yellow-500/10 group-[.toaster]:border-yellow-400/30 group-[.toaster]:text-yellow-100',
          info: 'group-[.toaster]:bg-blue-500/10 group-[.toaster]:border-blue-400/30 group-[.toaster]:text-blue-100',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
