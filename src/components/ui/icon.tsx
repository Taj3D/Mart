'use client'

import * as React from 'react'
import * as LucideIcons from 'lucide-react'
import { getLucideIcon, type LucideIconName } from '@/lib/icon-map'

/* ---------- Size Mapping ---------- */
// Font Awesome size classes → pixel sizes
const FA_SIZE_MAP = {
  xs: 12,
  sm: 14,
  default: 14, // FA default is 14px
  lg: 18,      // 1.333em × 14 ≈ 18
  '2x': 28,    // 2em × 14 = 28
  '3x': 42,    // 3em × 14 = 42
  '4x': 56,    // 4em × 14 = 56
  '5x': 70,    // 5em × 14 = 70
} as const

type FASize = keyof typeof FA_SIZE_MAP

/* ---------- Rotation Mapping ---------- */
const FA_ROTATION_MAP = {
  '90': 'rotate-90',
  '180': 'rotate-180',
  '270': 'rotate-270',
} as const

type FARotation = keyof typeof FA_ROTATION_MAP

/* ---------- Icon Props ---------- */
export interface IconProps extends Omit<LucideIcons.LucideProps, 'ref'> {
  /** Font Awesome icon name (with or without fa- prefix) or Lucide icon name directly */
  icon: string
  /** Font Awesome size modifier: 'xs' | 'sm' | 'lg' | '2x' | '3x' | '4x' | '5x' */
  faSize?: FASize
  /** Fixed width (like fa-fw) - useful for alignment in lists/tables */
  fw?: boolean
  /** Spin animation (like fa-spin) - 2s linear infinite rotation */
  spin?: boolean
  /** Pulse animation (like fa-pulse) - 1s steps(8) rotation */
  pulse?: boolean
  /** Rotation (like fa-rotate-90, fa-rotate-180, fa-rotate-270) */
  rotate?: FARotation
  /** Horizontal flip (like fa-flip-horizontal) */
  flipH?: boolean
  /** Vertical flip (like fa-flip-vertical) */
  flipV?: boolean
  /** Border around icon (like fa-border) */
  bordered?: boolean
  /** Pull icon to left or right (like fa-pull-left, fa-pull-right) */
  pull?: 'left' | 'right'
  /** Inverse color - white (like fa-inverse) */
  inverse?: boolean
  /** Screen reader only - hides icon visually (like .sr-only on icon) */
  srOnly?: boolean
}

/**
 * Icon component - Replaces Font Awesome icons with Lucide React equivalents.
 *
 * Supports all Font Awesome 4.7.0 features:
 * - Size modifiers (fa-lg, fa-2x, fa-3x, fa-4x, fa-5x)
 * - Spin/pulse animations
 * - Rotation and flip transforms
 * - Fixed width for alignment
 * - Border, pull, inverse
 * - Screen reader support
 *
 * @example
 * // Basic usage with FA name
 * <Icon icon="search" />
 * <Icon icon="fa-search" />
 *
 * // With FA sizing
 * <Icon icon="home" faSize="2x" />
 * <Icon icon="user" faSize="lg" />
 *
 * // Animations
 * <Icon icon="spinner" spin />
 * <Icon icon="cog" pulse />
 *
 * // Transforms
 * <Icon icon="share" rotate="90" />
 * <Icon icon="arrow-right" flipH />
 *
 * // Alignment
 * <Icon icon="check" fw />           // Fixed width
 * <Icon icon="star" bordered />      // Border
 * <Icon icon="arrow-left" pull="left" />
 *
 * // Direct Lucide name (when you know the Lucide icon name)
 * <Icon icon="Search" />
 * <Icon icon="ChevronRight" faSize="lg" spin />
 */
const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      icon,
      faSize,
      fw = false,
      spin = false,
      pulse = false,
      rotate,
      flipH = false,
      flipV = false,
      bordered = false,
      pull,
      inverse = false,
      srOnly = false,
      className = '',
      size: sizeProp,
      strokeWidth: strokeWidthProp,
      ...props
    },
    ref
  ) => {
    // Resolve the icon: first try FA mapping, then try direct Lucide name
    const lucideName = getLucideIcon(icon) || (icon as LucideIconName)

    // Get the Lucide component
    const LucideComponent = (LucideIcons as Record<string, React.ComponentType<LucideIcons.LucideProps>>)[lucideName]

    if (!LucideComponent) {
      // Fallback: render a question mark icon for unknown icons
      const FallbackIcon = (LucideIcons as Record<string, React.ComponentType<LucideIcons.LucideProps>>)['HelpCircle']
      if (FallbackIcon) {
        return (
          <FallbackIcon
            ref={ref}
            size={faSize ? FA_SIZE_MAP[faSize] : sizeProp || 14}
            className={cn(
              'text-muted-foreground/50',
              className
            )}
            strokeWidth={strokeWidthProp ?? 2}
            {...props}
          />
        )
      }
      return null
    }

    // Calculate size: FA size takes precedence, then size prop, then default 14px
    const computedSize = faSize ? FA_SIZE_MAP[faSize] : sizeProp || 14

    // Build class names for FA-like features
    const classNames = [
      // Base icon class (like .fa)
      'inline-block',

      // Fixed width (like .fa-fw)
      fw ? 'ims-icon-fw' : '',

      // Spin animation (like .fa-spin)
      spin ? 'ims-icon-spin' : '',

      // Pulse animation (like .fa-pulse)
      pulse ? 'ims-icon-pulse' : '',

      // Rotation transforms
      rotate ? `ims-icon-rotate-${rotate}` : '',

      // Flip transforms
      flipH ? 'ims-icon-flip-h' : '',
      flipV ? 'ims-icon-flip-v' : '',

      // Border (like .fa-border)
      bordered ? 'ims-icon-border' : '',

      // Pull (like .fa-pull-left, .fa-pull-right)
      pull === 'left' ? 'ims-icon-pull-left' : '',
      pull === 'right' ? 'ims-icon-pull-right' : '',

      // Inverse color (like .fa-inverse)
      inverse ? 'ims-icon-inverse' : '',

      // Screen reader only
      srOnly ? 'sr-only' : '',

      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <LucideComponent
        ref={ref}
        size={computedSize}
        strokeWidth={strokeWidthProp ?? 2}
        className={classNames}
        {...props}
      />
    )
  }
)

Icon.displayName = 'Icon'

/* ---------- Utility: cn ---------- */
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

/* ---------- Icon Stack Component ---------- */
export interface IconStackProps {
  children: React.ReactNode
  className?: string
  size?: number
}

/**
 * IconStack - Replaces Font Awesome's fa-stack for layering icons.
 *
 * @example
 * <IconStack size={32}>
 *   <Icon icon="square" faSize="2x" className="text-navy-600" />
 *   <Icon icon="times" className="text-white" style={{ position: 'absolute' }} />
 * </IconStack>
 */
export function IconStack({ children, className = '', size = 32 }: IconStackProps) {
  return (
    <span
      className={`ims-icon-stack ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  )
}

/* ---------- Icon List Component ---------- */
export interface IconListProps {
  children: React.ReactNode
  className?: string
}

/**
 * IconList - Replaces Font Awesome's fa-ul/fa-li for icon lists.
 *
 * @example
 * <IconList>
 *   <IconListItem icon="check">Item 1</IconListItem>
 *   <IconListItem icon="check">Item 2</IconListItem>
 * </IconList>
 */
export function IconList({ children, className = '' }: IconListProps) {
  return (
    <ul className={`ims-icon-list ${className}`}>
      {children}
    </ul>
  )
}

export interface IconListItemProps {
  icon: string
  children: React.ReactNode
  className?: string
  iconClassName?: string
}

export function IconListItem({ icon, children, className = '', iconClassName = '' }: IconListItemProps) {
  return (
    <li className={`ims-icon-list-item ${className}`}>
      <span className="ims-icon-list-marker">
        <Icon icon={icon} className={iconClassName} />
      </span>
      <span>{children}</span>
    </li>
  )
}

/* ---------- Pre-built Common Icon Components ---------- */
// These are commonly used in ERP applications with sensible defaults

export const SearchIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="search" {...props} />
export const PlusIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="plus" {...props} />
export const EditIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="edit" {...props} />
export const DeleteIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="trash" {...props} />
export const SaveIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="save" {...props} />
export const CloseIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="close" {...props} />
export const CheckIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="check" {...props} />
export const RefreshIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="refresh" spin {...props} />
export const LoadingIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="spinner" spin {...props} />
export const HomeIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="home" {...props} />
export const UserIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="user" {...props} />
export const SettingsIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="cog" {...props} />
export const DownloadIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="download" {...props} />
export const UploadIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="upload" {...props} />
export const PrintIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="print" {...props} />
export const FilterIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="filter" {...props} />
export const SortIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="sort" {...props} />
export const CalendarIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="calendar" {...props} />
export const ClockIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="clock-o" {...props} />
export const LockIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="lock" {...props} />
export const UnlockIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="unlock" {...props} />
export const EyeIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="eye" {...props} />
export const EyeOffIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="eye-slash" {...props} />
export const BellIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="bell" {...props} />
export const MailIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="envelope" {...props} />
export const FileIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="file" {...props} />
export const FolderIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="folder" {...props} />
export const ShoppingCartIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="shopping-cart" {...props} />
export const MoneyIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="money" {...props} />
export const ChartIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="bar-chart" {...props} />
export const DatabaseIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="database" {...props} />
export const ServerIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="server" {...props} />
export const WarningIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="warning" {...props} />
export const InfoIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="info-circle" {...props} />
export const SuccessIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="check-circle" {...props} />
export const ErrorIcon = (props: Omit<IconProps, 'icon'>) => <Icon icon="times-circle" {...props} />

export { Icon }
export default Icon
