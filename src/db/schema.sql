-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL
);

-- Enable RLS for clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
DROP POLICY IF EXISTS "Allow public read access to clients" ON clients;
CREATE POLICY "Allow public read access to clients" ON clients FOR SELECT USING (true);

-- Policy for authenticated users to manage clients
DROP POLICY IF EXISTS "Allow authenticated users to manage clients" ON clients;
CREATE POLICY "Allow authenticated users to manage clients" ON clients FOR ALL USING (auth.role() = 'authenticated');

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  link text,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL
);

-- Enable RLS for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
DROP POLICY IF EXISTS "Allow public read access to projects" ON projects;
CREATE POLICY "Allow public read access to projects" ON projects FOR SELECT USING (true);

-- Policy for authenticated users to manage projects
DROP POLICY IF EXISTS "Allow authenticated users to manage projects" ON projects;
CREATE POLICY "Allow authenticated users to manage projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL
);

-- Enable RLS for services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
DROP POLICY IF EXISTS "Allow public read access to services" ON services;
CREATE POLICY "Allow public read access to services" ON services FOR SELECT USING (true);

-- Policy for authenticated users to manage services
DROP POLICY IF EXISTS "Allow authenticated users to manage services" ON services;
CREATE POLICY "Allow authenticated users to manage services" ON services FOR ALL USING (auth.role() = 'authenticated');

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  image_url text
);

-- Enable RLS for team_members table
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
DROP POLICY IF EXISTS "Allow public read access to team members" ON team_members;
CREATE POLICY "Allow public read access to team members" ON team_members FOR SELECT USING (true);

-- Policy for authenticated users to manage team members
DROP POLICY IF EXISTS "Allow authenticated users to manage team members" ON team_members;
CREATE POLICY "Allow authenticated users to manage team members" ON team_members FOR ALL USING (auth.role() = 'authenticated');


-- Create Storage bucket for project images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_images', 'project_images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for project_images bucket
DROP POLICY IF EXISTS "Allow public read access to project images" ON storage.objects;
CREATE POLICY "Allow public read access to project images" ON storage.objects FOR SELECT USING (bucket_id = 'project_images');

DROP POLICY IF EXISTS "Allow authenticated users to upload project images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project_images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update project images" ON storage.objects;
CREATE POLICY "Allow authenticated users to update project images" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'project_images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete project images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete project images" ON storage.objects FOR DELETE USING (bucket_id = 'project_images' AND auth.role() = 'authenticated');

-- Create Storage bucket for team images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('team_images', 'team_images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for team_images bucket
DROP POLICY IF EXISTS "Allow public read access to team images" ON storage.objects;
CREATE POLICY "Allow public read access to team images" ON storage.objects FOR SELECT USING (bucket_id = 'team_images');

DROP POLICY IF EXISTS "Allow authenticated users to upload team images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload team images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team_images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update team images" ON storage.objects;
CREATE POLICY "Allow authenticated users to update team images" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'team_images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete team images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete team images" ON storage.objects FOR DELETE USING (bucket_id = 'team_images' AND auth.role() = 'authenticated');
