-- 1. HAPUS STRUKTUR LAMA (JIKA ADA) UNTUK EKSEKUSI BERULANG
drop policy if exists "Allow public read access to clients" on public.clients;
drop policy if exists "Allow authenticated users to manage clients" on public.clients;

drop policy if exists "Allow public read access to projects" on public.projects;
drop policy if exists "Allow authenticated users to manage projects" on public.projects;

drop policy if exists "Allow public read access to services" on public.services;
drop policy if exists "Allow authenticated users to manage services" on public.services;

drop policy if exists "Allow public read access to team members" on public.team_members;
drop policy if exists "Allow authenticated users to manage team members" on public.team_members;

drop policy if exists "Allow public read access to testimonials" on public.testimonials;
drop policy if exists "Allow authenticated users to manage testimonials" on public.testimonials;

drop table if exists public.testimonials;
drop table if exists public.team_members;
drop table if exists public.services;
drop table if exists public.projects;
drop table if exists public.clients;

-- 2. BUAT TABEL
-- Tabel Clients
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Tabel Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  link text,
  client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Tabel Services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null,
  created_at timestamptz not null default now()
);

-- Tabel Team Members
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- Tabel Testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);


-- 3. BUAT STORAGE BUCKETS
insert into storage.buckets (id, name, public)
values 
  ('project_images', 'project_images', true),
  ('team_images', 'team_images', true),
  ('testimonial_avatars', 'testimonial_avatars', true)
on conflict (id) do nothing;


-- 4. AKTIFKAN ROW LEVEL SECURITY (RLS)
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.services enable row level security;
alter table public.team_members enable row level security;
alter table public.testimonials enable row level security;

-- 5. BUAT KEBIJAKAN (POLICIES)
-- Policies untuk Clients
create policy "Allow public read access to clients" on public.clients for select using (true);
create policy "Allow authenticated users to manage clients" on public.clients for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Policies untuk Projects
create policy "Allow public read access to projects" on public.projects for select using (true);
create policy "Allow authenticated users to manage projects" on public.projects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Policies untuk Services
create policy "Allow public read access to services" on public.services for select using (true);
create policy "Allow authenticated users to manage services" on public.services for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Policies untuk Team Members
create policy "Allow public read access to team members" on public.team_members for select using (true);
create policy "Allow authenticated users to manage team members" on public.team_members for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Policies untuk Testimonials
create policy "Allow public read access to testimonials" on public.testimonials for select using (true);
create policy "Allow authenticated users to manage testimonials" on public.testimonials for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Policies untuk Storage
create policy "Allow public access to project_images" on storage.objects for select using ( bucket_id = 'project_images' );
create policy "Allow authenticated users to manage project_images" on storage.objects for all using ( bucket_id = 'project_images' and auth.role() = 'authenticated' );

create policy "Allow public access to team_images" on storage.objects for select using ( bucket_id = 'team_images' );
create policy "Allow authenticated users to manage team_images" on storage.objects for all using ( bucket_id = 'team_images' and auth.role() = 'authenticated' );

create policy "Allow public access to testimonial_avatars" on storage.objects for select using ( bucket_id = 'testimonial_avatars' );
create policy "Allow authenticated users to manage testimonial_avatars" on storage.objects for all using ( bucket_id = 'testimonial_avatars' and auth.role() = 'authenticated' );
