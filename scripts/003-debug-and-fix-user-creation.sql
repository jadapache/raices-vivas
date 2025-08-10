-- First, let's check what's happening with the trigger
-- Drop and recreate everything to ensure it works

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a more robust function with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value text;
    user_full_name text;
    user_community_name text;
BEGIN
    -- Extract values with proper null handling
    user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'tourist');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
    user_community_name := NEW.raw_user_meta_data->>'community_name';
    
    -- Log the values for debugging (you can remove this later)
    RAISE LOG 'Creating profile for user %, role: %, name: %, community: %', 
        NEW.id, user_role_value, user_full_name, user_community_name;
    
    -- Insert the profile with explicit casting
    INSERT INTO public.profiles (id, email, full_name, role, community_name, created_at, updated_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        user_full_name,
        user_role_value::user_role,
        user_community_name,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        -- Still return NEW to not break the auth flow
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Let's also check if there are any existing profiles with wrong roles
-- and provide a way to fix them manually if needed
SELECT id, email, role, full_name, community_name 
FROM public.profiles 
WHERE role != 'tourist' OR community_name IS NOT NULL
ORDER BY created_at DESC;
