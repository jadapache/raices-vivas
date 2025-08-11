"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Calendar, Loader2, Menu, X, Languages } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/context';
import { useAuth } from '@/components/auth/auth-provider';

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
  const { user, profile, loading } = useAuth();
  
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  // Usamos el hook de i18n para obtener las traducciones y el idioma actual
  const { t, language, setLanguage } = useI18n();
  const supabase = createClient();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      toast({
        title: t('forms.success'), // Usando la clave correcta de tu archivo de traducciones
        description: t('nav.logout') // Usando la clave correcta 'logout'
      });
      
      window.location.href = '/';
    } catch (error) {
      console.error('Signout error:', error);
      toast({
        title: t('forms.error'), // Usando la clave correcta 'error'
        description: t('errors.sessionError'),
        variant: "destructive"
      });
    } finally {
      setSigningOut(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RV</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Raíces Vivas</span>
          </Link>

          {/* Menú de escritorio */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            >
              <Languages className="h-4 w-4 mr-2" />
              {language.toUpperCase()}
            </button>
            
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">{t('forms.loading')}</span>
              </div>
            ) : user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserAvatar profile={profile} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile?.full_name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
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
                        {t('dashboard.my_bookings_title')}
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
                    {signingOut ? t('forms.loading') : t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="secondary" asChild>
                  <Link href="/auth">{t('nav.login')}</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth">{t('nav.signup')}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Menú móvil */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            >
              <Languages className="h-4 w-4 mr-2" />
              {language.toUpperCase()}
            </button>
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
          <div className="md:hidden py-4 space-y-4 border-t border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">{t('forms.loading')}</span>
              </div>
            ) : user && profile ? (
              <>
                <div className="px-3 py-2 border-b">
                  <p className="font-medium">{profile?.full_name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
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
                    {t('booking.myBookings')}
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
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  disabled={signingOut}
                >
                  {signingOut ? t('forms.loading') : t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <Link
                  href="/auth"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth"
                  className="block px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
