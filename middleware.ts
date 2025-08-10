import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes
    const protectedRoutes = ['/dashboard', '/profile', '/bookings']
    const isProtectedRoute = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )

    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/auth', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect authenticated users away from auth page
    if (req.nextUrl.pathname === '/auth' && session) {
      const redirectUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/profile/:path*', 
    '/bookings/:path*', 
    '/auth',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
