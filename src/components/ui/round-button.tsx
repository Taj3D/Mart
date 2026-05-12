'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type RoundButtonVariant = 'solid' | 'hollow'
type RoundButtonColor = 'default' | 'navy' | 'orange' | 'green'
type RoundButtonSize = 'default' | 'lg'

interface RoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: RoundButtonVariant
  color?: RoundButtonColor
  size?: RoundButtonSize
}

const colorStyles: Record<RoundButtonColor, { solid: string; hollow: string }> = {
  default: {
    solid: 'bg-navy-700 text-white dark:bg-navy-800 dark:text-white',
    hollow:
      'bg-white text-navy-700 shadow-[0_0_0_3px_rgba(30,58,95,0.75)] dark:bg-navy-950 dark:text-navy-300 dark:shadow-[0_0_0_3px_rgba(45,90,142,0.75)]',
  },
  navy: {
    solid: 'bg-navy-600 text-white dark:bg-navy-700 dark:text-white',
    hollow:
      'bg-white text-navy-500 shadow-[0_0_0_3px_#2d5a8e] dark:bg-navy-950 dark:text-navy-400 dark:shadow-[0_0_0_3px_#2d5a8e]',
  },
  orange: {
    solid: 'bg-amber-500 text-white dark:bg-amber-600 dark:text-white',
    hollow:
      'bg-white text-amber-500 shadow-[0_0_0_3px_#f59e0b] dark:bg-navy-950 dark:text-amber-400 dark:shadow-[0_0_0_3px_#f59e0b]',
  },
  green: {
    solid: 'bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white',
    hollow:
      'bg-white text-emerald-500 shadow-[0_0_0_3px_#10b981] dark:bg-navy-950 dark:text-emerald-400 dark:shadow-[0_0_0_3px_#10b981]',
  },
}

const sizeStyles: Record<RoundButtonSize, string> = {
  default: 'h-[30px] w-[30px] text-sm',
  lg: 'h-[40px] w-[40px] text-xl',
}

function RoundButton({
  variant = 'solid',
  color = 'default',
  size = 'default',
  className,
  children,
  ...props
}: RoundButtonProps) {
  const style = colorStyles[color]
  const variantClass = variant === 'solid' ? style.solid : style.hollow

  return (
    <button
      data-slot="round-button"
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-full',
        'transition-all duration-150',
        'hover:brightness-110 active:brightness-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/50 focus-visible:ring-offset-1',
        'disabled:pointer-events-none disabled:opacity-50',
        'cursor-pointer',
        sizeStyles[size],
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { RoundButton, type RoundButtonVariant, type RoundButtonColor, type RoundButtonSize, type RoundButtonProps }
