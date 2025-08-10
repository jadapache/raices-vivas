-- Fix the user creation trigger and RLS policies

-- First, let's check if the trigger function exists and fix it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_name text;
  community text;
BEGIN
  -- Extract metadata safely
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'tourist');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  community := NEW.raw_user_meta_data->>'community_name';

  -- Insert into profiles table with error handling
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, community_name)
    VALUES (
      NEW.id, 
      COALESCE(NEW.email, ''), 
      user_name,
      user_role::user_role,
      community
    );
  EXCEPTION 
    WHEN others THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
      -- Insert with minimal data as fallback
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES (NEW.id, COALESCE(NEW.email, ''), '', 'tourist'::user_role)
      ON CONFLICT (id) DO NOTHING;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix RLS policies to be more permissive for profile creation
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    -- Allow system to create profiles during signup
    auth.role() = 'service_role'
  );

-- Add policy for service role to manage profiles
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Ensure the profiles table has proper constraints
ALTER TABLE public.profiles 
  ALTER COLUMN email SET DEFAULT '',
  ALTER COLUMN full_name SET DEFAULT '',
  ALTER COLUMN role SET DEFAULT 'tourist';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
