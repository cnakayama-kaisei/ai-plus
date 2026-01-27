import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

// Public paths that don't require authentication
const publicPaths = ['/login', '/api/auth/login']

// Paths that require authentication
const protectedPaths = ['/home']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for authentication on protected paths
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      // No token found, redirect to login
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Verify token
    const payload = verifyToken(token)

    if (!payload) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      // Clear invalid token
      response.cookies.delete('auth_token')
      return response
    }

    // Check contract status
    if (payload.contractStatus !== 'active') {
      // Contract is not active, redirect to login with message
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'contract_expired')
      const response = NextResponse.redirect(loginUrl)
      // Clear token for expired contracts
      response.cookies.delete('auth_token')
      return response
    }

    // User is authenticated and has active contract
    return NextResponse.next()
  }

  // For all other paths, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
