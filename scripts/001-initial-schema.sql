-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('host', 'coordinator', 'tourist');
CREATE TYPE experience_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'tourist',
    community_name TEXT, -- For host users
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiences table
CREATE TABLE public.experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    location TEXT NOT NULL,
    duration_hours INTEGER NOT NULL,
    max_participants INTEGER NOT NULL,
    price_per_person DECIMAL(10,2) NOT NULL,
    included_items TEXT[], -- Array of included items
    requirements TEXT,
    images TEXT[], -- Array of image URLs
    status experience_status DEFAULT 'pending',
    coordinator_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
    tourist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    participants INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending',
    special_requests TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for experiences
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

CREATE POLICY "Hosts can insert experiences" ON public.experiences
    FOR INSERT WITH CHECK (
        auth.uid() = host_id AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'host'
        )
    );

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

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = tourist_id);

CREATE POLICY "Hosts can view bookings for their experiences" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.experiences 
            WHERE id = experience_id AND host_id = auth.uid()
        )
    );

CREATE POLICY "Tourists can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = tourist_id);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
CREATE INDEX idx_experiences_status ON public.experiences(status);
CREATE INDEX idx_experiences_host_id ON public.experiences(host_id);
CREATE INDEX idx_bookings_experience_id ON public.bookings(experience_id);
CREATE INDEX idx_bookings_tourist_id ON public.bookings(tourist_id);
