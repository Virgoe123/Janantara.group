-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS "team_members";
DROP TABLE IF EXISTS "services";
DROP TABLE IF EXISTS "projects";
DROP TABLE IF EXISTS "clients";

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create storage buckets for images if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_images', 'project_images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('team_images', 'team_images', true)
ON CONFLICT (id) DO NOTHING;


-- Drop old policies to avoid errors on re-run
DROP POLICY IF EXISTS "Allow public read access on project_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload on project_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on team_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload on team_images" ON storage.objects;

-- Create policies for project_images bucket
CREATE POLICY "Allow public read access on project_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project_images');

CREATE POLICY "Allow authenticated users to upload on project_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project_images');

-- Create policies for team_images bucket
CREATE POLICY "Allow public read access on team_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team_images');

CREATE POLICY "Allow authenticated users to upload on team_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team_images');


-- Enable Row Level Security (RLS) for all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Drop old RLS policies to avoid errors on re-run
DROP POLICY IF EXISTS "Allow public read access" ON clients;
DROP POLICY IF EXISTS "Allow authenticated users to manage clients" ON clients;
DROP POLICY IF EXISTS "Allow public read access" ON projects;
DROP POLICY IF EXISTS "Allow authenticated users to manage projects" ON projects;
DROP POLICY IF EXISTS "Allow public read access" ON services;
DROP POLICY IF EXISTS "Allow authenticated users to manage services" ON services;
DROP POLICY IF EXISTS "Allow public read access" ON team_members;
DROP POLICY IF EXISTS "Allow authenticated users to manage team members" ON team_members;

-- Create RLS policies
-- Clients
CREATE POLICY "Allow public read access" ON clients FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Projects
CREATE POLICY "Allow public read access" ON projects FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Services
CREATE POLICY "Allow public read access" ON services FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Team Members
CREATE POLICY "Allow public read access" ON team_members FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated users to manage team members" ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
