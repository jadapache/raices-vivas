"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HostDashboard from '@/components/dashboard/host-dashboard'
import CoordinatorDashboard from '@/components/dashboard/coordinator-dashboard'
import TouristDashboard from '@/components/dashboard/tourist-dashboard'
import { Button } from '@/components/ui/button'
import { AlertTriangle, LogIn, Loader2 } from 'lucide-react'

// A simplified interface or type for the profile is helpful
interface Profile {
  id: string;
  full_name: string;
  role: 'host' | 'coordinator' | 'tourist';
  community_name?: string;
  avatar_url?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  // This useEffect now relies on the a single source of truth for auth state
  // It uses the onAuthStateChange listener to get the session and profile data
  // which is much more reliable and avoids redundant API calls.
  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('Dashboard Auth state changed:', event, session?.user?.id || 'no user')

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setLoading(false)
        router.push('/auth')
        return
      }

      if (session?.user) {
        setUser(session.user)
        
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError)
            setError('Error al cargar el perfil. Por favor, vuelve a intentarlo.')
            setProfile(null)
          } else if (profileData) {
            setProfile(profileData as Profile)
            setError(null)
          } else {
            // Handle the case where the profile doesn't exist yet after a fresh sign up.
            // A trigger function on the DB should handle this automatically.
            // If the trigger fails, the user will be redirected to the auth page.
            console.warn('Profile not found for a signed-in user. Trigger function may have failed.')
            setError('No se pudo encontrar el perfil. Por favor, intenta de nuevo o inicia sesión.')
            setProfile(null)
            // Force a sign out to prevent a bad state
            supabase.auth.signOut().then(() => router.push('/auth'))
          }
        } catch (err) {
          console.error('Unexpected error fetching profile:', err)
          setError('Error inesperado al cargar el perfil.')
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
        // If there's no session, redirect to the auth page
        router.push('/auth')
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      authListener?.subscription.unsubscribe()
    }
  }, [router])

  const handleForceLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth')
      router.refresh()
    } catch (error) {
      console.error('Force logout error:', error)
      window.location.href = '/auth'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando panel de control...</h2>
          <p className="text-gray-600 mb-4">
            Por favor, espera un momento.
          </p>
          <Button onClick={handleForceLogout} variant="outline" size="sm">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    )
  }

  if (error || !user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Acceso</h1>
          <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la sesión o el perfil. Por favor, inicia sesión de nuevo.'}</p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/auth')} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
            <Button 
              onClick={handleForceLogout} 
              className="w-full"
              variant="destructive"
              size="sm"
            >
              Forzar Cierre de Sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  switch (profile.role) {
    case 'host':
      return <HostDashboard user={user} profile={profile} />
    case 'coordinator':
      return <CoordinatorDashboard user={user} profile={profile} />
    case 'tourist':
      return <TouristDashboard user={user} profile={profile} />
    default:
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">Rol no válido</h1>
            <p className="text-gray-600 mb-6">
              Tu cuenta tiene un rol no reconocido: {profile.role}
            </p>
            <Button onClick={handleForceLogout} className="w-full" variant="destructive">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      )
  }
}
