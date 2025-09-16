
-- Drop tables in reverse order of creation to handle foreign key constraints
DROP TABLE IF EXISTS "testimonials";
DROP TABLE IF EXISTS "projects";
DROP TABLE IF EXISTS "clients";
DROP TABLE IF EXISTS "services";
DROP TABLE IF EXISTS "team_members";

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_images', 'project_images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('team_images', 'team_images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial_avatars', 'testimonial_avatars', true)
ON CONFLICT (id) DO NOTHING;


-- Set up Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public can read all" ON clients;
DROP POLICY IF EXISTS "Authenticated can do all" ON clients;
DROP POLICY IF EXISTS "Public can read all" ON projects;
DROP POLICY IF EXISTS "Authenticated can do all" ON projects;
DROP POLICY IF EXISTS "Public can read all" ON services;
DROP POLICY IF EXISTS "Authenticated can do all" ON services;
DROP POLICY IF EXISTS "Public can read all" ON team_members;
DROP POLICY IF EXISTS "Authenticated can do all" ON team_members;
DROP POLICY IF EXISTS "Public can read all" ON testimonials;
DROP POLICY IF EXISTS "Authenticated can do all" ON testimonials;

DROP POLICY IF EXISTS "Authenticated can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload team images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload testimonial avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view public buckets" ON storage.objects;


-- Create policies for public read access
CREATE POLICY "Public can read all" ON clients FOR SELECT USING (true);
CREATE POLICY "Public can read all" ON projects FOR SELECT USING (true);
CREATE POLICY "Public can read all" ON services FOR SELECT USING (true);
CREATE POLICY "Public can read all" ON team_members FOR SELECT USING (true);
CREATE POLICY "Public can read all" ON testimonials FOR SELECT USING (true);

-- Create policies for authenticated users to manage data
CREATE POLICY "Authenticated can do all" ON clients FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can do all" ON projects FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can do all" ON services FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can do all" ON team_members FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can do all" ON testimonials FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- Create policies for storage
CREATE POLICY "Public can view public buckets" ON storage.objects
FOR SELECT USING (
    bucket_id IN ('project_images', 'team_images', 'testimonial_avatars')
);

CREATE POLICY "Authenticated can upload project images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'project_images' AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated can upload team images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'team_images' AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated can upload testimonial avatars" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'testimonial_avatars' AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated can update their own images" ON storage.objects
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete their own images" ON storage.objects
FOR DELETE
USING (auth.role() = 'authenticated');
