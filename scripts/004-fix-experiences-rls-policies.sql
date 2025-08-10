-- Let's check and fix the RLS policies for experiences table

-- First, let's see current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'experiences';

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can view approved experiences" ON public.experiences;
DROP POLICY IF EXISTS "Hosts can view own experiences" ON public.experiences;
DROP POLICY IF EXISTS "Coordinators can view all experiences" ON public.experiences;
DROP POLICY IF EXISTS "Hosts can insert experiences" ON public.experiences;
DROP POLICY IF EXISTS "Hosts can update own experiences" ON public.experiences;
DROP POLICY IF EXISTS "Coordinators can update experiences" ON public.experiences;

-- Recreate policies with better logic

-- SELECT policies
CREATE POLICY "Anyone can view approved experiences" ON public.experiences
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Hosts can view own experiences" ON public.experiences
    FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "Coordinators can view all experiences" ON public.experiences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'coordinator'
        )
    );

-- INSERT policy - simplified and more permissive for hosts
CREATE POLICY "Hosts can insert experiences" ON public.experiences
    FOR INSERT WITH CHECK (
        auth.uid() = host_id AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'host'
        )
    );

-- UPDATE policies
CREATE POLICY "Hosts can update own experiences" ON public.experiences
    FOR UPDATE USING (
        auth.uid() = host_id AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'host'
        )
    );

CREATE POLICY "Coordinators can update experiences" ON public.experiences
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'coordinator'
        )
    );

-- Let's also make sure the profiles table has the right data
-- Check if there are any profiles with missing or incorrect roles
SELECT id, email, role, full_name, community_name, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Update any profiles that might have null or incorrect roles
UPDATE public.profiles 
SET role = 'tourist' 
WHERE role IS NULL;

-- Grant necessary permissions
GRANT ALL ON public.experiences TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
