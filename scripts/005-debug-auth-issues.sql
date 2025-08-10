-- Debug script to check auth and profile issues

-- 1. Check if there are any users without profiles
SELECT 
    au.id,
    au.email,
    au.created_at as user_created,
    p.id as profile_id,
    p.role,
    p.full_name,
    p.created_at as profile_created
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Check profiles with issues
SELECT 
    id,
    email,
    full_name,
    role,
    community_name,
    created_at,
    updated_at
FROM public.profiles
WHERE role IS NULL 
   OR email IS NULL 
   OR email = ''
ORDER BY created_at DESC;

-- 3. Fix any profiles with null roles
UPDATE public.profiles 
SET role = 'tourist' 
WHERE role IS NULL;

-- 4. Check RLS policies are working
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'experiences')
ORDER BY tablename, policyname;

-- 5. Test profile creation function
SELECT public.handle_new_user();
