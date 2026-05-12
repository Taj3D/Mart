'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ShutterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shutterColor?: string
}

function ShutterButton({
  children,
  className,
  shutterColor,
  ...props
}: ShutterButtonProps) {
  // Build the CSS custom property for shutter color
  const shutterStyle = shutterColor
    ? { '--shutter-bg': shutterColor } as React.CSSProperties
    : undefined

  return (
    <button
      data-slot="shutter-button"
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden',
        'rounded-md px-4 py-2 text-sm font-medium',
        'bg-white dark:bg-navy-900',
        'text-navy-600 dark:text-navy-300',
        'border border-navy-600 dark:border-navy-500',
        'transition-colors duration-300 ease-out',
        'hover:text-white dark:hover:text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/50 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'cursor-pointer',
        className
      )}
      style={shutterStyle}
      {...props}
    >
      {/* Shutter wipe pseudo-element replacement */}
      <span
        className={cn(
          'absolute inset-0 -z-10 origin-center',
          'scale-x-0 group-hover:scale-x-100',
          'transition-transform duration-300 ease-out',
          'bg-navy-600 dark:bg-navy-500'
        )}
        style={shutterColor ? { backgroundColor: shutterColor } : undefined}
        aria-hidden="true"
      />
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export { ShutterButton, type ShutterButtonProps }
