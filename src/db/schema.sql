
-- Hapus tabel lama jika ada untuk memastikan skrip bisa dijalankan ulang
DROP TABLE IF EXISTS "testimonials" CASCADE;
DROP TABLE IF EXISTS "team_members" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;

-- Hapus storage buckets lama jika ada
-- Perhatikan: Menghapus bucket juga akan menghapus semua file di dalamnya.
SELECT FROM storage.buckets WHERE id = 'project_images';
DO $$
BEGIN
  IF FOUND THEN
    PERFORM storage.empty_bucket('project_images');
    PERFORM storage.delete_bucket('project_images');
  END IF;
END $$;

SELECT FROM storage.buckets WHERE id = 'team_images';
DO $$
BEGIN
  IF FOUND THEN
    PERFORM storage.empty_bucket('team_images');
    PERFORM storage.delete_bucket('team_images');
  END IF;
END $$;

SELECT FROM storage.buckets WHERE id = 'testimonial_images';
DO $$
BEGIN
  IF FOUND THEN
    PERFORM storage.empty_bucket('testimonial_images');
    PERFORM storage.delete_bucket('testimonial_images');
  END IF;
END $$;

-- Buat Tabel Klien (Clients)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Buat Tabel Layanan (Services)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Buat Tabel Proyek (Projects)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Buat Tabel Anggota Tim (Team Members)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Buat Tabel Testimonial (Testimonials)
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Buat Storage Buckets untuk Gambar
INSERT INTO storage.buckets (id, name, public) VALUES ('project_images', 'project_images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('team_images', 'team_images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('testimonial_images', 'testimonial_images', true);


-- Konfigurasi Row Level Security (RLS)

-- Aktifkan RLS untuk semua tabel
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Public read access" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage" ON clients;
DROP POLICY IF EXISTS "Public read access" ON services;
DROP POLICY IF EXISTS "Authenticated users can manage" ON services;
DROP POLICY IF EXISTS "Public read access" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage" ON projects;
DROP POLICY IF EXISTS "Public read access" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can manage" ON team_members;
DROP POLICY IF EXISTS "Public read access" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can manage" ON testimonials;

-- Policies untuk tabel `clients`
CREATE POLICY "Public read access" ON clients FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage" ON clients FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk tabel `services`
CREATE POLICY "Public read access" ON services FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage" ON services FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk tabel `projects`
CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk tabel `team_members`
CREATE POLICY "Public read access" ON team_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage" ON team_members FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk tabel `testimonials`
CREATE POLICY "Public read access" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk Storage Buckets
-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Public read access for project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage project images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for team images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage team images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for testimonial images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage testimonial images" ON storage.objects;

-- Policies untuk `project_images`
CREATE POLICY "Public read access for project images" ON storage.objects FOR SELECT USING (bucket_id = 'project_images');
CREATE POLICY "Authenticated users can manage project images" ON storage.objects FOR ALL WITH CHECK (bucket_id = 'project_images' AND auth.role() = 'authenticated');

-- Policies untuk `team_images`
CREATE POLICY "Public read access for team images" ON storage.objects FOR SELECT USING (bucket_id = 'team_images');
CREATE POLICY "Authenticated users can manage team images" ON storage.objects FOR ALL WITH CHECK (bucket_id = 'team_images' AND auth.role() = 'authenticated');

-- Policies untuk `testimonial_images`
CREATE POLICY "Public read access for testimonial images" ON storage.objects FOR SELECT USING (bucket_id = 'testimonial_images');
CREATE POLICY "Authenticated users can manage testimonial images" ON storage.objects FOR ALL WITH CHECK (bucket_id = 'testimonial_images' AND auth.role() = 'authenticated');
