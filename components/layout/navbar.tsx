"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MapPin, User, LogOut, Settings, Calendar, Loader2, AlertTriangle, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { LanguageSwitch } from '@/components/ui/language-switch'
import { useI18n } from '@/lib/i18n/context'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [sessionError, setSessionError] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()

  useEffect(() => {
    let mounted = true
    let authSubscription: any = null
    
    const loadUser = async () => {
      try {
        const supabase = createClient()
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          if (mounted) {
            setSessionError(true)
            setLoading(false)
          }
          return
        }

        if (!mounted) return
        
        if (session?.user) {
          console.log('Initial session found:', session.user.id)
          setUser(session.user)
          
          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (mounted) {
            if (profileError) {
              console.error('Profile error:', profileError)
              setProfile(null)
            } else {
              setProfile(profile)
            }
            setLoading(false)
          }
        } else {
          console.log('No initial session found')
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setSessionError(true)
          setLoading(false)
        }
      }
    }

    // Initial load
    loadUser()

    // Listen for auth changes
    const supabase = createClient()
    authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('Auth state changed:', event, session?.user?.id || 'no user')
      
      // Handle different auth events
      switch (event) {
        case 'INITIAL_SESSION':
          // Already handled in loadUser()
          break
          
        case 'SIGNED_IN':
          if (session?.user) {
            setUser(session.user)
            setSessionError(false)
            
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            setProfile(profile)
            setLoading(false)
          }
          break
          
        case 'SIGNED_OUT':
          setUser(null)
          setProfile(null)
          setSessionError(false)
          setLoading(false)
          break
          
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed')
          break
          
        default:
          console.log('Unhandled auth event:', event)
      }
    })

    return () => {
      mounted = false
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe()
      }
    }
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Signout error:', error)
        throw error
      }
      
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      setSessionError(false)
      
      toast({
        title: t('common.success'),
        description: t('nav.signOut')
      })
      
      // Redirect to home
      router.push('/')
      
    } catch (error) {
      console.error('Signout error:', error)
      toast({
        title: t('common.error'),
        description: t('errors.sessionError'),
        variant: "destructive"
      })
      
      // Force logout by clearing everything and redirecting
      handleForceLogout()
    } finally {
      setSigningOut(false)
    }
  }

  const handleForceLogout = () => {
    // Clear all possible auth data
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear state
    setUser(null)
    setProfile(null)
    setSessionError(false)
    setLoading(false)
    
    // Force page reload to clear any cached state
    window.location.href = '/'
  }

  const handleRetryAuth = () => {
    setLoading(true)
    setSessionError(false)
    window.location.reload()
  }

  // Show error state if there's a session error
  if (sessionError) {
    return (
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Raíces Vivas</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{t('errors.sessionError')}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleRetryAuth}>
                {t('common.retry')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleForceLogout}>
                {t('errors.clearSession')}
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">Raíces Vivas</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitch />
            
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">{t('common.loading')}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleForceLogout}
                  className="ml-2"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            ) : user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name} />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile?.full_name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-blue-600 capitalize">
                        {t(`roles.${profile?.role}`)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'tourist' && (
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {t('nav.myBookings')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={signingOut}>
                    {signingOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    {signingOut ? t('common.loading') : t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="secondary" asChild>
                  <Link href="/auth">{t('nav.signIn')}</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth">{t('nav.signUp')}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitch />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">{t('common.loading')}</span>
                </div>
              ) : user && profile ? (
                <>
                  <div className="px-3 py-2 border-b">
                    <p className="font-medium">{profile?.full_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-blue-600 capitalize">
                      {t(`roles.${profile?.role}`)}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  {profile?.role === 'tourist' && (
                    <Link
                      href="/bookings"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.myBookings')}
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    disabled={signingOut}
                  >
                    {signingOut ? t('common.loading') : t('nav.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    href="/auth"
                    className="block px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.signUp')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
