import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    
    // Clear all auth-related cookies
    const cookiesToClear = [
      'supabase-auth-token',
      'sb-access-token', 
      'sb-refresh-token',
      'supabase.auth.token',
      'sb-localhost-auth-token'
    ]
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false
      })
    })
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    // Even if there's an error, redirect to home
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  }
}

export async function GET() {
  return POST() // Handle GET requests the same way
}
