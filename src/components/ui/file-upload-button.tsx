'use client'

import * as React from 'react'
import { Upload } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'

type ButtonVariant = VariantProps<typeof Button>['variant']
type ButtonSize = VariantProps<typeof Button>['size']

interface FileUploadButtonProps {
  onFileSelect: (files: FileList) => void
  accept?: string
  multiple?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  children?: React.ReactNode
  className?: string
  icon?: LucideIcon
  disabled?: boolean
}

function FileUploadButton({
  onFileSelect,
  accept,
  multiple = false,
  variant = 'default',
  size = 'default',
  children,
  className,
  icon: Icon = Upload,
  disabled = false,
}: FileUploadButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [selectedNames, setSelectedNames] = React.useState<string[]>([])

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFileSelect(files)
        setSelectedNames(Array.from(files).map((f) => f.name))
      }
      // Reset input so the same file can be re-selected
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [onFileSelect]
  )

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        onFileSelect(files)
        setSelectedNames(Array.from(files).map((f) => f.name))
      }
    },
    [onFileSelect]
  )

  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      <div
        className={cn(
          'relative overflow-hidden',
          isDragOver && 'ring-2 ring-navy-500 ring-offset-2 rounded-md'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative cursor-pointer',
            isDragOver && 'bg-navy-50 dark:bg-navy-900 border-navy-400'
          )}
        >
          <Icon className="size-4" />
          {children ?? (multiple ? 'Choose Files' : 'Choose File')}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={multiple ? 'Choose files to upload' : 'Choose a file to upload'}
          tabIndex={-1}
        />
      </div>
      {selectedNames.length > 0 && (
        <div className="text-xs text-muted-foreground max-w-[200px] truncate">
          {selectedNames.length === 1
            ? selectedNames[0]
            : `${selectedNames.length} files selected`}
        </div>
      )}
    </div>
  )
}

export { FileUploadButton, type FileUploadButtonProps }
