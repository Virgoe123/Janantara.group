
-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public clients are viewable by everyone." ON clients FOR SELECT USING (true);
CREATE POLICY "Public projects are viewable by everyone." ON projects FOR SELECT USING (true);
CREATE POLICY "Public services are viewable by everyone." ON services FOR SELECT USING (true);
CREATE POLICY "Public team members are viewable by everyone." ON team_members FOR SELECT USING (true);

-- Create policies for authenticated users to manage data
CREATE POLICY "Authenticated users can insert clients." ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update clients." ON clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete clients." ON clients FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert projects." ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update projects." ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete projects." ON projects FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert services." ON services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update services." ON services FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete services." ON services FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert team members." ON team_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update team members." ON team_members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete team members." ON team_members FOR DELETE USING (auth.role() = 'authenticated');

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_images', 'project_images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('team_images', 'team_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for storage
CREATE POLICY "Project images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'project_images');
CREATE POLICY "Authenticated users can upload project images." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project_images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update project images." ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'project_images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete project images." ON storage.objects FOR DELETE USING (bucket_id = 'project_images' AND auth.role() = 'authenticated');

CREATE POLICY "Team images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'team_images');
CREATE POLICY "Authenticated users can upload team images." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team_images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update team images." ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'team_images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete team images." ON storage.objects FOR DELETE USING (bucket_id = 'team_images' AND auth.role() = 'authenticated');
