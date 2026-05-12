import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth middleware for X-Mart Global ERP v10.1
// Protects write operations (POST/PUT/DELETE) on API routes
// GET requests are allowed for data fetching (UI needs to load)
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Allow auth-related routes (login, session, seed)
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname === '/logo.svg'
  ) {
    return NextResponse.next()
  }

  // Allow GET requests to API routes (data fetching)
  // This allows the UI to render even without authentication
  // Production deployments should tighten this to require auth for all API calls
  if (pathname.startsWith('/api/') && method === 'GET') {
    return NextResponse.next()
  }

  // For write operations (POST/PUT/DELETE/PATCH), check for session token
  if (pathname.startsWith('/api/')) {
    const sessionToken =
      request.cookies.get('next-auth.session-token') ||
      request.cookies.get('__Secure-next-auth.session-token')
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required', message: 'Please log in to perform this action' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg).*)'],
}
