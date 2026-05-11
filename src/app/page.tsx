'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, User, Key, Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import { Footer } from '@/components/footer'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSeeding, setIsSeeding] = useState(false)
  const [isSeeded, setIsSeeded] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if database is seeded on mount
  useEffect(() => {
    checkSeedStatus()
  }, [])

  const checkSeedStatus = async () => {
    try {
      const res = await fetch('/api/auth/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setIsSeeded(true)
      }
    } catch {
      // Silently fail - will try again on login
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!userName.trim() || !password.trim()) {
      setError('Please enter both user name and password')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        userName,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        })
      } else if (result?.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome to IMS ERP System",
        })
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 dark:from-navy-950 dark:via-navy-900 dark:to-navy-800">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-white/90" />
          <h1 className="text-lg font-bold text-white tracking-wide">IMS ERP</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white dark:bg-navy-900/80 rounded-xl shadow-2xl border border-white/20 dark:border-navy-600/30 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-navy-700 to-navy-500 dark:from-navy-800 dark:to-navy-600 px-6 py-6 text-center">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                <Shield className="h-9 w-9 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Inventory Management System</h2>
              <p className="text-navy-100 text-sm mt-1">Sign in to your account</p>
            </div>

            {/* Card Body */}
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* User Name */}
                <div className="space-y-2">
                  <Label htmlFor="userName" className="text-sm font-medium text-navy-700 dark:text-navy-200">
                    <User className="h-3.5 w-3.5 inline mr-1" />
                    User Name
                  </Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Enter your user name"
                    value={userName}
                    onChange={(e) => { setUserName(e.target.value); setError('') }}
                    className="h-11 bg-white dark:bg-navy-800/50 border-navy-200 dark:border-navy-600 focus:ring-navy-500 focus:border-navy-500"
                    autoFocus
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-navy-700 dark:text-navy-200">
                    <Key className="h-3.5 w-3.5 inline mr-1" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      className="h-11 bg-white dark:bg-navy-800/50 border-navy-200 dark:border-navy-600 focus:ring-navy-500 focus:border-navy-500 pr-10"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm text-muted-foreground cursor-pointer select-none"
                  >
                    Remember me?
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-navy-700 to-navy-500 hover:from-navy-800 hover:to-navy-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Log in
                    </>
                  )}
                </Button>
              </form>

              {/* Default credentials info */}
              {isSeeded && (
                <div className="mt-4 bg-navy-50 dark:bg-navy-800/30 rounded-lg px-4 py-3 border border-navy-100 dark:border-navy-700">
                  <p className="text-xs text-navy-600 dark:text-navy-300 font-medium mb-1">Default Credentials:</p>
                  <p className="text-xs text-navy-500 dark:text-navy-400">
                    User: <span className="font-mono font-semibold">admin</span> &nbsp;|&nbsp; Password: <span className="font-mono font-semibold">admin123</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Software info below card */}
          <div className="text-center mt-6">
            <p className="text-white/60 text-xs">
              Enterprise Resource Planning Solution
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-navy-900/50 dark:bg-navy-950/50 border-t border-white/10">
        <Footer />
      </div>
    </div>
  )
}
