import { FileQuestion, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <FileQuestion className="h-16 w-16 text-navy-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy-700 dark:text-navy-300 mb-2">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button asChild className="bg-navy-600 hover:bg-navy-700">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
