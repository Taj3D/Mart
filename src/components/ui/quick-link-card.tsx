'use client'

import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type QuickLinkColor = 'navy' | 'emerald' | 'amber' | 'rose'

interface QuickLinkCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  icon?: LucideIcon
  href?: string
  description?: string
  color?: QuickLinkColor
}

const colorMap: Record<
  QuickLinkColor,
  { bg: string; hoverBg: string; darkBg: string }
> = {
  navy: {
    bg: 'bg-navy-600',
    hoverBg: 'hover:brightness-110',
    darkBg: 'dark:bg-navy-700',
  },
  emerald: {
    bg: 'bg-emerald-600',
    hoverBg: 'hover:brightness-110',
    darkBg: 'dark:bg-emerald-700',
  },
  amber: {
    bg: 'bg-amber-500',
    hoverBg: 'hover:brightness-110',
    darkBg: 'dark:bg-amber-600',
  },
  rose: {
    bg: 'bg-rose-500',
    hoverBg: 'hover:brightness-110',
    darkBg: 'dark:bg-rose-600',
  },
}

function QuickLinkCard({
  title,
  icon: Icon,
  href,
  description,
  color = 'navy',
  className,
  ...props
}: QuickLinkCardProps) {
  const colors = colorMap[color]
  const Comp = href ? 'a' : 'div'

  return (
    <Comp
      data-slot="quick-link-card"
      href={href}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'w-full min-h-[115px]',
        'p-6 rounded-lg',
        'text-white',
        colors.bg,
        colors.darkBg,
        colors.hoverBg,
        'transition-all duration-200',
        'cursor-pointer',
        'shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-600',
        href && 'hover:shadow-md',
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon className="size-8 mb-2 opacity-90" aria-hidden="true" />
      )}
      <h3 className="text-base font-semibold leading-tight">{title}</h3>
      {description && (
        <p className="text-sm opacity-80 mt-1 leading-snug">{description}</p>
      )}
    </Comp>
  )
}

export { QuickLinkCard, type QuickLinkColor, type QuickLinkCardProps }
