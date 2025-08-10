"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { UserAvatar  } from "@/components/ui/user-avatar"
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
import { useAuth } from '@/components/auth/auth-provider' // Importamos el nuevo hook de autenticación

// Definimos una interfaz para el perfil para una mejor tipificación
interface Profile {
  id: string;
  full_name: string;
  role: 'host' | 'coordinator' | 'tourist' | 'unknown';
  community_name?: string;
  avatar_url?: string;
}

export default function Navbar() {
  // Obtenemos el estado de autenticación desde el contexto
  const { user, profile, loading, error } = useAuth(); 
  
  const [signingOut, setSigningOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()
  const supabase = createClient()

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      
      toast({
        title: t('common.success'),
        description: t('nav.signOut')
      })
      
      // Forzamos un refresco completo para limpiar el estado de toda la app
      window.location.href = '/'
    } catch (error) {
      console.error('Signout error:', error)
      toast({
        title: t('common.error'),
        description: t('errors.sessionError'),
        variant: "destructive"
      })
      handleForceLogout()
    } finally {
      setSigningOut(false)
    }
  }

  const handleForceLogout = () => {
    // Limpiamos todo el estado de manera agresiva y recargamos
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  }

  // Ahora, el Navbar renderiza en base a los estados del contexto.
  // El error de sesión ahora se gestiona con el estado 'error' del AuthProvider.
  if (error) {
    return (
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Raíces Vivas</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{t('errors.sessionError')}</span>
              </div>
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

          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitch />
            
            {/* El estado de carga se obtiene directamente del contexto */}
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
                    <div className="flex items-center">
                      {profile ? (
                        <UserAvatar profile={profile} />
                      ) : (
                        // Muestra un componente por defecto si no hay perfil
                        <UserAvatar profile={null} />
                      )}
                    </div>
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
