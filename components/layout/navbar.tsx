"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu, X, User, Settings, LogOut, Languages } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/context'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { t, language, setLanguage } = useI18n()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Auth error:', error)
        setLoading(false)
        return
      }

      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profile)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
  }

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RV</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Raíces Vivas</span>
          </Link>

          {/* Desktop Auth & Language */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle - Sin hover background */}
            <button 
              onClick={toggleLanguage}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            >
              <Languages className="h-4 w-4 mr-2" />
              {language.toUpperCase()}
            </button>

            {/* Auth buttons */}
            {!loading && (
              !user ? (
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                    <Link href="/auth">
                      {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                    </Link>
                  </button>
                  <Button asChild>
                    <Link href="/auth?mode=signup">
                      {language === 'es' ? 'Registrarse' : 'Sign Up'}
                    </Link>
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback>
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{profile?.full_name || 'Usuario'}</p>
                        <p className="w-[200px] truncate text-sm text-gray-600">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        {language === 'es' ? 'Perfil' : 'Profile'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        {language === 'es' ? 'Panel' : 'Dashboard'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Cerrar Sesión' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-200">
            {/* Language Toggle Mobile - Sin hover background */}
            <button 
              onClick={toggleLanguage}
              className="w-full flex items-center justify-start px-2 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            >
              <Languages className="h-4 w-4 mr-2" />
              {language === 'es' ? 'Español' : 'English'}
            </button>

            {!loading && (
              !user ? (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <button className="w-full flex items-center justify-start px-2 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                    <Link href="/auth" onClick={() => setIsOpen(false)}>
                      {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                    </Link>
                  </button>
                  <Button asChild className="w-full">
                    <Link href="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                      {language === 'es' ? 'Registrarse' : 'Sign Up'}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="px-2 py-2 text-sm">
                    <p className="font-medium">{profile?.full_name || 'Usuario'}</p>
                    <p className="text-gray-600 truncate">{user?.email}</p>
                  </div>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <User className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Perfil' : 'Profile'}
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Settings className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Panel' : 'Dashboard'}
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    {language === 'es' ? 'Cerrar Sesión' : 'Logout'}
                  </Button>
                </div>
              )
              )}
          </div>
        )}
      </div>
    </nav>
  )
}