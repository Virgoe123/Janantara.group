-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to authenticated users" ON clients;
CREATE POLICY "Allow all access to authenticated users"
ON clients
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  client_id UUID REFERENCES clients(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON projects;
CREATE POLICY "Allow public read access"
ON projects
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow all access to authenticated users" ON projects;
CREATE POLICY "Allow all access to authenticated users"
ON projects
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- Create Storage bucket for project images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project_images', 'project_images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- RLS for project_images bucket
DROP POLICY IF EXISTS "Allow public read access on project_images" ON storage.objects;
CREATE POLICY "Allow public read access on project_images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project_images');

DROP POLICY IF EXISTS "Allow insert for authenticated users on project_images" ON storage.objects;
CREATE POLICY "Allow insert for authenticated users on project_images"
ON storage.objects
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'project_images');

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- To store the name of the lucide icon
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON services;
CREATE POLICY "Allow public read access"
ON services
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow all access to authenticated users" ON services;
CREATE POLICY "Allow all access to authenticated users"
ON services
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');