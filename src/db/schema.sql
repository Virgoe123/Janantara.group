-- Drop tables and policies if they exist to ensure a clean slate
DROP POLICY IF EXISTS "Public access for everyone" ON "public"."testimonials";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."testimonials";
DROP TABLE IF EXISTS "public"."testimonials";

DROP POLICY IF EXISTS "Public access for everyone" ON "public"."team_members";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."team_members";
DROP TABLE IF EXISTS "public"."team_members";

DROP POLICY IF EXISTS "Public access for everyone" ON "public"."services";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."services";
DROP TABLE IF EXISTS "public"."services";

DROP POLICY IF EXISTS "Public access for everyone" ON "public"."projects";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."projects";
DROP TABLE IF EXISTS "public"."projects";

DROP POLICY IF EXISTS "Public access for everyone" ON "public"."clients";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."clients";
DROP TABLE IF EXISTS "public"."clients";

-- Create tables
CREATE TABLE "public"."clients" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE "public"."projects" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    PRIMARY KEY (id)
);

CREATE TABLE "public"."services" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE "public"."team_members" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE "public"."testimonials" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    name TEXT NOT NULL,
    "title" TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);


-- Create Storage Buckets
-- Note: You might need to run these separately or ensure your user has permissions.
-- These are idempotent, so they won't fail if the buckets already exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_images', 'project_images', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('team_images', 'team_images', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial_images', 'testimonial_images', TRUE)
ON CONFLICT (id) DO NOTHING;


-- Set up Row Level Security (RLS)
-- Enable RLS for all tables
ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."testimonials" ENABLE ROW LEVEL SECURITY;

-- Create Policies for 'clients'
CREATE POLICY "Public access for everyone" ON "public"."clients" FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON "public"."clients" FOR ALL USING (auth.role() = 'authenticated');

-- Create Policies for 'projects'
CREATE POLICY "Public access for everyone" ON "public"."projects" FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON "public"."projects" FOR ALL USING (auth.role() = 'authenticated');

-- Create Policies for 'services'
CREATE POLICY "Public access for everyone" ON "public"."services" FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON "public"."services" FOR ALL USING (auth.role() = 'authenticated');

-- Create Policies for 'team_members'
CREATE POLICY "Public access for everyone" ON "public"."team_members" FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON "public"."team_members" FOR ALL USING (auth.role() = 'authenticated');

-- Create Policies for 'testimonials'
CREATE POLICY "Public access for everyone" ON "public"."testimonials" FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON "public"."testimonials" FOR ALL USING (auth.role() = 'authenticated');

-- Create Policies for Storage buckets
-- projects
CREATE POLICY "project_images_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING ( bucket_id = 'project_images' );
CREATE POLICY "project_images_auth_write" ON storage.objects FOR INSERT, UPDATE, DELETE TO authenticated WITH CHECK ( bucket_id = 'project_images' AND auth.role() = 'authenticated' );

-- team
CREATE POLICY "team_images_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING ( bucket_id = 'team_images' );
CREATE POLICY "team_images_auth_write" ON storage.objects FOR INSERT, UPDATE, DELETE TO authenticated WITH CHECK ( bucket_id = 'team_images' AND auth.role() = 'authenticated' );

-- testimonials
CREATE POLICY "testimonial_images_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING ( bucket_id = 'testimonial_images' );
CREATE POLICY "testimonial_images_auth_write" ON storage.objects FOR INSERT, UPDATE, DELETE TO authenticated WITH CHECK ( bucket_id = 'testimonial_images' AND auth.role() = 'authenticated' );
