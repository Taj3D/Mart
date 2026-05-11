"use client"

import { toast } from "sonner"

/**
 * IMS Toast Notification System
 * Deep Navy Blue themed - Replaces Toastr
 * 
 * Usage:
 *   imsToast.success("Saved!", { description: "Record updated successfully" })
 *   imsToast.error("Failed!", { description: "Could not save record" })
 *   imsToast.info("Note", { description: "This action cannot be undone" })
 *   imsToast.warning("Caution", { description: "Low stock alert" })
 *   imsToast.promise(saveData(), { loading: "Saving...", success: "Saved!", error: "Failed!" })
 *   imsToast.confirm("Are you sure?", { onConfirm: () => doAction() })
 */

export interface ImsToastOptions {
  description?: string
  duration?: number
  position?: "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center"
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick?: () => void
  }
  id?: string | number
  icon?: React.ReactNode
  onDismiss?: () => void
  onAutoClose?: () => void
}

export interface ImsPromiseToastOptions {
  loading?: string
  success?: string | ((data: any) => string)
  error?: string | ((error: any) => string)
  description?: string
  duration?: number
}

export interface ImsConfirmOptions {
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  variant?: "default" | "destructive"
  duration?: number
}

/**
 * Info toast - Deep Navy Blue background
 * Replaces toastr.info()
 */
function info(message: string, options?: ImsToastOptions) {
  return toast.info(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
    action: options?.action
      ? { label: options.action.label, onClick: options.action.onClick }
      : undefined,
    cancel: options?.cancel
      ? { label: options.cancel.label, onClick: options.cancel.onClick }
      : undefined,
    id: options?.id,
    icon: options?.icon,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  })
}

/**
 * Success toast - Green background
 * Replaces toastr.success()
 */
function success(message: string, options?: ImsToastOptions) {
  return toast.success(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    action: options?.action
      ? { label: options.action.label, onClick: options.action.onClick }
      : undefined,
    cancel: options?.cancel
      ? { label: options.cancel.label, onClick: options.cancel.onClick }
      : undefined,
    id: options?.id,
    icon: options?.icon,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  })
}

/**
 * Error toast - Red background
 * Replaces toastr.error()
 */
function error(message: string, options?: ImsToastOptions) {
  return toast.error(message, {
    description: options?.description,
    duration: options?.duration ?? 6000,
    action: options?.action
      ? { label: options.action.label, onClick: options.action.onClick }
      : undefined,
    cancel: options?.cancel
      ? { label: options.cancel.label, onClick: options.cancel.onClick }
      : undefined,
    id: options?.id,
    icon: options?.icon,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  })
}

/**
 * Warning toast - Amber background
 * Replaces toastr.warning()
 */
function warning(message: string, options?: ImsToastOptions) {
  return toast.warning(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
    action: options?.action
      ? { label: options.action.label, onClick: options.action.onClick }
      : undefined,
    cancel: options?.cancel
      ? { label: options.cancel.label, onClick: options.cancel.onClick }
      : undefined,
    id: options?.id,
    icon: options?.icon,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  })
}

/**
 * Promise toast - Shows loading, then success/error
 * Useful for API calls
 */
function promise<T>(
  promise: Promise<T>,
  options: ImsPromiseToastOptions = {}
) {
  return toast.promise(promise, {
    loading: options.loading ?? "Loading...",
    success: options.success ?? "Operation successful",
    error: options.error ?? "Operation failed",
    description: options.description,
    duration: options.duration ?? 5000,
  })
}

/**
 * Confirm toast - Shows a confirmation dialog in toast form
 * Replaces confirm() dialogs in ERP
 */
function confirm(message: string, options: ImsConfirmOptions) {
  const variant = options.variant ?? "default"
  const confirmLabel = options.confirmText ?? "Confirm"
  const cancelLabel = options.cancelText ?? "Cancel"

  return toast[variant === "destructive" ? "error" : "info"](message, {
    description: options.description,
    duration: options.duration ?? 10000,
    action: {
      label: confirmLabel,
      onClick: () => {
        options.onConfirm()
      },
    },
    cancel: {
      label: cancelLabel,
      onClick: options.onCancel,
    },
  })
}

/**
 * Loading toast - Shows a persistent loading indicator
 */
function loading(message: string, options?: { description?: string; id?: string | number }) {
  return toast.loading(message, {
    description: options?.description,
    id: options?.id,
  })
}

/**
 * Dismiss a specific toast or all toasts
 */
function dismiss(toastId?: string | number) {
  return toast.dismiss(toastId)
}

/**
 * Custom message toast with Navy Blue theme
 */
function message(message: string, options?: ImsToastOptions) {
  return toast(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
    action: options?.action
      ? { label: options.action.label, onClick: options.action.onClick }
      : undefined,
    cancel: options?.cancel
      ? { label: options.cancel.label, onClick: options.cancel.onClick }
      : undefined,
    id: options?.id,
    icon: options?.icon,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
  })
}

export const imsToast = {
  info,
  success,
  error,
  warning,
  promise,
  confirm,
  loading,
  dismiss,
  message,
}

export { toast } from "sonner"
