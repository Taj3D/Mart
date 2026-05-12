'use client'

import * as React from 'react'
import {
  Bell,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

interface NotificationBellProps {
  notifications?: Notification[]
  onMarkRead?: (id: string) => void
  onSeeAll?: () => void
  className?: string
}

const typeConfig: Record<
  Notification['type'],
  { icon: React.ElementType; iconColor: string; bgColor: string }
> = {
  info: {
    icon: Info,
    iconColor: 'text-navy-500 dark:text-navy-400',
    bgColor: 'bg-navy-50 dark:bg-navy-900/40',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/40',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/40',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/40',
  },
}

function NotificationBell({
  notifications = [],
  onMarkRead,
  onSeeAll,
  className,
}: NotificationBellProps) {
  const [open, setOpen] = React.useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          data-slot="notification-bell"
          type="button"
          className={cn(
            'relative inline-flex items-center justify-center',
            'w-9 h-9 rounded-md',
            'text-navy-500 dark:text-navy-400',
            'hover:bg-navy-50 dark:hover:bg-navy-800',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/50',
            'cursor-pointer',
            className
          )}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5',
                'flex items-center justify-center',
                'min-w-[18px] h-[18px] px-1',
                'rounded-full',
                'bg-red-600 text-white',
                'text-[10px] font-bold leading-none',
                'pointer-events-none'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[430px] max-w-[calc(100vw-16px)] p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="size-8 mb-2 opacity-40" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const config = typeConfig[notification.type]
              const TypeIcon = config.icon

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3',
                    'border-b border-border last:border-b-0',
                    'transition-colors duration-100',
                    'hover:bg-muted/50',
                    !notification.read && 'bg-navy-50/60 dark:bg-navy-900/20',
                    'cursor-pointer'
                  )}
                  onClick={() => {
                    if (!notification.read && onMarkRead) {
                      onMarkRead(notification.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      if (!notification.read && onMarkRead) {
                        onMarkRead(notification.id)
                      }
                    }
                  }}
                >
                  {/* Type icon */}
                  <div
                    className={cn(
                      'flex-shrink-0 flex items-center justify-center',
                      'w-8 h-8 rounded-full mt-0.5',
                      config.bgColor
                    )}
                  >
                    <TypeIcon className={cn('size-4', config.iconColor)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          'text-sm truncate',
                          notification.read
                            ? 'font-medium text-foreground'
                            : 'font-semibold text-foreground'
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span
                          className="flex-shrink-0 w-2 h-2 rounded-full bg-navy-500"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* See All footer */}
        {notifications.length > 0 && (
          <div
            className={cn(
              'border-t border-border',
              'bg-muted/30 dark:bg-muted/10',
              'px-4 py-2',
              'text-center'
            )}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onSeeAll?.()
              }}
              className={cn(
                'text-xs font-bold',
                'text-navy-600 dark:text-navy-400',
                'hover:text-navy-700 dark:hover:text-navy-300',
                'hover:underline',
                'transition-colors duration-150',
                'cursor-pointer'
              )}
            >
              See All
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { NotificationBell, type NotificationBellProps, type Notification }
