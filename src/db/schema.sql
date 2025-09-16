-- Drop tables and policies if they exist to ensure a clean slate
DROP POLICY IF EXISTS "Allow public read access to clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated users to manage clients" ON public.clients;
DROP TABLE IF EXISTS public.clients;

DROP POLICY IF EXISTS "Allow public read access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow authenticated users to manage projects" ON public.projects;
DROP TABLE IF EXISTS public.projects;

DROP POLICY IF EXISTS "Allow public read access to services" ON public.services;
DROP POLICY IF EXISTS "Allow authenticated users to manage services" ON public.services;
DROP TABLE IF EXISTS public.services;

DROP POLICY IF EXISTS "Allow public read access to team members" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated users to manage team members" ON public.team_members;
DROP TABLE IF EXISTS public.team_members;

DROP POLICY IF EXISTS "Allow public read access to testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated users to manage testimonials" ON public.testimonials;
DROP TABLE IF EXISTS public.testimonials;

-- Manage Storage Buckets
-- Ensure buckets exist and set public access if needed.
-- We use separate buckets for different image types.

INSERT INTO storage.buckets (id, name, public)
VALUES ('project_images', 'project_images', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

INSERT INTO storage.buckets (id, name, public)
VALUES ('team_images', 'team_images', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial_avatars', 'testimonial_avatars', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Create clients Table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create projects Table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    created_at TIMEST-AMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create services Table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create team_members Table
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create testimonials Table
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    name TEXT NOT NULL,
    "role" TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access (for website visitors)
CREATE POLICY "Allow public read access to clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public read access to projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access to services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public read access to team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Allow public read access to testimonials" ON public.testimonials FOR SELECT USING (true);


-- RLS Policies for authenticated users (for CMS management)
CREATE POLICY "Allow authenticated users to manage clients" ON public.clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage services" ON public.services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage team members" ON public.team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage testimonials" ON public.testimonials FOR ALL USING (auth.role() = 'authenticated');
