-- Create clients table
create table
  public.clients (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    name character varying not null,
    constraint clients_pkey primary key (id)
  ) tablespace pg_default;
  
-- Create projects table
create table
  public.projects (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    title character varying not null,
    description text null,
    image_url character varying null,
    client_id uuid null,
    link text null,
    constraint projects_pkey primary key (id),
    constraint projects_client_id_fkey foreign key (client_id) references clients (id) on delete set null
  ) tablespace pg_default;
  
-- Create services table
create table
  public.services (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    title character varying not null,
    description text not null,
    icon character varying not null,
    constraint services_pkey primary key (id)
  ) tablespace pg_default;
  
-- Create team_members table
create table
  public.team_members (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    name character varying not null,
    role character varying not null,
    image_url character varying null,
    constraint team_members_pkey primary key (id)
  ) tablespace pg_default;
  
-- Create Storage buckets
insert into storage.buckets (id, name, public)
values ('project_images', 'project_images', true);

insert into storage.buckets (id, name, public)
values ('team_images', 'team_images', true);

-- RLS Policies for Storage
create policy "Allow public read access to project images"
on storage.objects for select
using ( bucket_id = 'project_images' );

create policy "Allow authenticated users to upload project images"
on storage.objects for insert to authenticated
with check ( bucket_id = 'project_images' );

create policy "Allow public read access to team images"
on storage.objects for select
using ( bucket_id = 'team_images' );

create policy "Allow authenticated users to upload team images"
on storage.objects for insert to authenticated
with check ( bucket_id = 'team_images' );

-- Enable RLS for all tables
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.services enable row level security;
alter table public.team_members enable row level security;

-- Policies for 'clients' table
create policy "Allow public read-only access" on public.clients
for select using (true);
create policy "Allow full access for authenticated users" on public.clients
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Policies for 'projects' table
create policy "Allow public read-only access" on public.projects
for select using (true);
create policy "Allow full access for authenticated users" on public.projects
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Policies for 'services' table
create policy "Allow public read-only access" on public.services
for select using (true);
create policy "Allow full access for authenticated users" on public.services
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Policies for 'team_members' table
create policy "Allow public read-only access" on public.team_members
for select using (true);
create policy "Allow full access for authenticated users" on public.team_members
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
