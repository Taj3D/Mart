'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DividerVerticalProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number
}

function DividerVertical({
  height = 50,
  className,
  ...props
}: DividerVerticalProps) {
  return (
    <div
      data-slot="divider-vertical"
      className={cn(
        'inline-flex flex-col justify-center',
        'mx-[9px]',
        className
      )}
      style={{ height: `${height}px` }}
      role="separator"
      aria-orientation="vertical"
      {...props}
    >
      {/* Double border effect: light left line + white right line */}
      <div className="relative w-0 h-full">
        <span
          className={cn(
            'absolute inset-y-0 left-0 w-px',
            'bg-[#F2F2F2] dark:bg-navy-700'
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            'absolute inset-y-0 left-px w-px',
            'bg-white dark:bg-navy-800'
          )}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

export { DividerVertical, type DividerVerticalProps }
