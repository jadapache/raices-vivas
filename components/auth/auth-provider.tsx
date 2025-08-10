"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Session } from '@supabase/supabase-js'

interface Profile {
  id: string;
  full_name: string;
  role: 'host' | 'coordinator' | 'tourist' | 'unknown';
  community_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true;
    
    // Se suscribe a los cambios de autenticación.
    // El callback se dispara inmediatamente al suscribirse con la sesión actual.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        console.log('onAuthStateChange event:', event);
        setLoading(true);
        setError(null);

        if (session) {
            setUser(session.user);
            try {
                // Se carga el perfil del usuario una vez que la sesión es válida.
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (!isMounted) return;

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error('Profile fetch error:', profileError);
                    setError('Error al cargar el perfil.');
                    setProfile(null);
                    await supabase.auth.signOut();
                    router.push('/auth');
                } else if (profileData) {
                    setProfile(profileData as Profile);
                    setError(null);
                } else {
                    console.warn('Profile not found. Redirecting to auth.');
                    setError('No se pudo encontrar el perfil.');
                    setProfile(null);
                    await supabase.auth.signOut();
                    router.push('/auth');
                }
            } catch (err) {
                console.error('Unexpected error fetching profile:', err);
                if (isMounted) {
                    setError('Error inesperado al cargar el perfil.');
                    setProfile(null);
                    await supabase.auth.signOut();
                    router.push('/auth');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        } else {
            // Si no hay sesión, reiniciamos todos los estados
            if (isMounted) {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        }
    });

    // Función de limpieza para desuscribirse del oyente
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const value = { user, profile, loading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
