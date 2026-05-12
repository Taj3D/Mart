'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const colorMap = {
  navy: {
    text: 'text-navy-600 dark:text-navy-300',
    border: 'border-navy-600 dark:border-navy-400',
  },
  emerald: {
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-600 dark:border-emerald-400',
  },
  amber: {
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-600 dark:border-amber-400',
  },
  rose: {
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-600 dark:border-rose-400',
  },
} as const

type InlineHeaderColor = keyof typeof colorMap

interface InlineHeaderProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: InlineHeaderColor
}

function InlineHeader({
  children,
  className,
  color = 'navy',
  ...props
}: InlineHeaderProps) {
  const colors = colorMap[color]

  return (
    <span
      data-slot="inline-header"
      className={cn(
        'mt-[5px] inline-block border-l-3 pl-[2px] italic font-bold font-[Geist_Sans,sans-serif]',
        colors.text,
        colors.border,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { InlineHeader, type InlineHeaderColor, type InlineHeaderProps }
