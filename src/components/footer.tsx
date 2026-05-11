'use client'

import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container-fluid mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            Developed with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> by{' '}
            <span className="font-semibold text-foreground">NextGen Digital Studio</span>
          </p>
          <p className="text-center">
            Copyright &copy; {new Date().getFullYear()}{' '}
            <span className="font-semibold text-foreground">NextGen Digital Studio</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-70">IMS v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
