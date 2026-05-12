'use client'

import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto">
      {/* Footer Bottom - replaces .footer-bottom with Deep Navy Blue */}
      <div className="bg-navy-700 dark:bg-navy-800 border-t-4 border-amber-600 dark:border-amber-500 pt-2.5 pb-4">
        <div className="container-fluid mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px]">
            <p className="flex items-center gap-1.5 text-navy-100 dark:text-navy-200">
              <Shield className="h-4 w-4 text-amber-400" />
              Developed by{' '}
              <span className="font-bold underline decoration-amber-400 decoration-2 underline-offset-2 text-white">
                NextGen Digital Studio
              </span>
            </p>
            <p className="text-center text-navy-200 dark:text-navy-300 underline decoration-navy-400 decoration-1 underline-offset-2">
              Copyright &copy; {new Date().getFullYear()}{' '}
              <span className="font-bold text-white">IMS</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-navy-300 dark:text-navy-400">
              <span className="text-xs opacity-70">X-Mart Global ERP v10.1</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
