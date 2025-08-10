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
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    // We'll create a single function to handle the session check
    // so we can call it from different places.
    const handleSession = async (session: Session | null) => {
      if (!isMounted) return;

      setLoading(true);
      setError(null);

      if (session) {
        setUser(session.user);
        try {
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
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };
    
    // 1. First, subscribe to Supabase's auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('onAuthStateChange event:', event);
      handleSession(session);
    });
    
    // 2. Next, fetch the initial session to set the state on first load.
    const getInitialSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    // 3. Add a listener for when the browser tab becomes visible.
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible. Re-checking session...');
        setLoading(true); // Set loading to true while we re-check
        const { data: { session } } = await supabase.auth.getSession();
        handleSession(session);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    getInitialSession();

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [supabase, router]);

  const value = { user, profile, loading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
