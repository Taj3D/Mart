'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ImsTagDotColor = 'red' | 'navy' | 'amber' | 'emerald'

interface ImsTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void
  dotColor?: ImsTagDotColor
}

const dotColorMap: Record<ImsTagDotColor, string> = {
  red: 'bg-red-500',
  navy: 'bg-navy-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
}

function ImsTag({
  children,
  onRemove,
  dotColor = 'red',
  className,
  ...props
}: ImsTagProps) {
  return (
    <span
      data-slot="ims-tag"
      className={cn(
        'group relative inline-flex items-center',
        'h-[32px] leading-[30px]',
        'pl-[23px] pr-[20px]',
        'bg-navy-600 dark:bg-navy-700',
        'text-[#fff2e1] dark:text-navy-100',
        'rounded-l-[3px]',
        'transition-colors duration-150',
        'hover:bg-rose-400 dark:hover:bg-rose-500',
        'cursor-default',
        className
      )}
      {...props}
    >
      {/* Dot indicator (replaces ::before) */}
      <span
        className={cn(
          'absolute left-[10px] top-1/2 -translate-y-1/2',
          'rounded-full w-[8px] h-[8px]',
          dotColorMap[dotColor]
        )}
        aria-hidden="true"
      />

      {/* Tag content */}
      <span className="relative z-10 text-sm">{children}</span>

      {/* Arrow notch on right (replaces ::after) */}
      <span
        className={cn(
          'absolute -right-[18px] top-0',
          'w-0 h-0',
          'border-l-[18px] border-l-navy-600 dark:border-l-navy-700',
          'border-t-[16px] border-t-transparent',
          'border-b-[16px] border-b-transparent',
          'transition-colors duration-150',
          'group-hover:border-l-rose-400 dark:group-hover:border-l-rose-500'
        )}
        aria-hidden="true"
      />

      {/* Remove button */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className={cn(
            'ml-1 -mr-1 inline-flex items-center justify-center',
            'rounded-full w-4 h-4',
            'text-[#fff2e1]/70 hover:text-white hover:bg-black/20',
            'dark:text-navy-100/70 dark:hover:text-white dark:hover:bg-white/20',
            'transition-colors duration-150',
            'cursor-pointer'
          )}
          aria-label="Remove tag"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  )
}

export { ImsTag, type ImsTagDotColor, type ImsTagProps }
