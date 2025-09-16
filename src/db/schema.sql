-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS for clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access" 
ON clients 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to insert"
ON clients
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access on projects"
ON projects
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert projects"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create a storage bucket for project images with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_images', 'project_images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for project_images bucket
CREATE POLICY "Allow public read access on project images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project_images');

CREATE POLICY "Allow authenticated users to upload project images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project_images');
