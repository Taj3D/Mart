import { Loader2, Shield } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-navy-600/50 border border-navy-500/30 mb-4">
          <Shield className="h-8 w-8 text-amber-400" />
        </div>
        <Loader2 className="h-8 w-8 text-amber-400 animate-spin mx-auto mb-3" />
        <p className="text-navy-300 text-sm">Loading Electronics Mart...</p>
      </div>
    </div>
  )
}
