'use client'

import * as React from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface IMSBreadcrumbProps {
  items: BreadcrumbItem[]
}

export function IMSBreadcrumb({ items }: IMSBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-navy-50/50 dark:bg-navy-800/30 px-[15px] py-2 rounded-none"
    >
      <ol className="flex items-center gap-0 text-[0.8125rem] font-semibold">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="text-navy-400 dark:text-navy-500 mx-1.5 text-[0.8125rem]">
                  →&nbsp;
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  className={
                    isLast
                      ? 'text-[#95a5a6] dark:text-muted-foreground'
                      : 'text-navy-600 dark:text-navy-300'
                  }
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="text-navy-600 dark:text-navy-300 hover:text-navy-800 dark:hover:text-navy-100 transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
