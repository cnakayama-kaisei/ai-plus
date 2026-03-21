import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

// Public paths that don't require authentication
const publicPaths = ['/login', '/api/auth/login', '/admin/login', '/api/admin/auth/login']

// Student paths that require authentication
const studentPaths = ['/home', '/content', '/search']

// Admin paths that require authentication
const adminPaths = ['/admin/contents', '/admin/users']

function hasValidStudentSession(request: NextRequest): boolean {
  const token = request.cookies.get('student_auth_token')?.value

  if (!token) {
    return false
  }

  const payload = verifyToken(token)

  return !!payload && payload.role === 'student' && payload.contractStatus === 'active'
}

function hasValidAdminSession(request: NextRequest): boolean {
  const token = request.cookies.get('admin_auth_token')?.value

  if (!token) {
    return false
  }

  const payload = verifyToken(token)

  return !!payload && payload.role === 'admin'
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for authentication on admin paths
  if (adminPaths.some((path) => pathname.startsWith(path))) {
    if (!hasValidAdminSession(request)) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  // Check for authentication on student paths
  if (studentPaths.some((path) => pathname.startsWith(path))) {
    if (!hasValidStudentSession(request)) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

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
