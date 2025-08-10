import { createClient } from './supabase/client'

export async function signUp(email: string, password: string, userData: {
  full_name: string
  role: 'host' | 'tourist' | 'coordinator'
  community_name?: string
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const supabase = createClient()
  
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User error:', userError)
      return null
    }
    
    if (!user) {
      return null
    }
    
    // Get the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Profile error:', profileError)
      // If profile doesn't exist, try to create it
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found, attempting to create...')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            role: user.user_metadata?.role || 'tourist',
            community_name: user.user_metadata?.community_name || null
          })
          .select()
          .single()
        
        if (createError) {
          console.error('Error creating profile:', createError)
          return { user, profile: null }
        }
        
        return { user, profile: newProfile }
      }
      return { user, profile: null }
    }
    
    return { user, profile }
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}
