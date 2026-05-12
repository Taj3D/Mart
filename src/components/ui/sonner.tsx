"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

/**
 * IMS Toaster - Deep Navy Blue themed toast notifications
 * Replaces Toastr with Sonner + Navy Blue theme
 * Supports: info, success, error, warning types
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="ims-toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.ims-toaster]:bg-background group-[.ims-toaster]:text-foreground group-[.ims-toaster]:border-border group-[.ims-toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-navy-600 group-[.toast]:text-white group-[.toast]:hover:bg-navy-700",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          // Info toast - Navy Blue (replacing #2f96b4)
          info: "group-[.ims-toaster]:bg-navy-600 group-[.ims-toaster]:text-white group-[.ims-toaster]:border-navy-500",
          // Success toast - Green (keeping #51a351 equivalent)
          success: "group-[.ims-toaster]:!bg-emerald-600 group-[.ims-toaster]:text-white group-[.ims-toaster]:border-emerald-500",
          // Error toast - Red (keeping #bd362f equivalent)
          error: "group-[.ims-toaster]:!bg-red-600 group-[.ims-toaster]:text-white group-[.ims-toaster]:border-red-500",
          // Warning toast - Amber (keeping #f89406 equivalent)
          warning: "group-[.ims-toaster]:!bg-amber-600 group-[.ims-toaster]:text-white group-[.ims-toaster]:border-amber-500",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          // Custom toast widths matching Toastr
          "--toast-width": "380px",
        } as React.CSSProperties
      }
      richColors
      closeButton
      duration={5000}
      gap={8}
      {...props}
    />
  )
}

export { Toaster }
