
-- Enable RLS
alter table "public"."clients" enable row level security;

-- Create Policy
create policy "Allow logged-in users to view clients"
on "public"."clients"
as permissive
for select
to authenticated
using (true);

create policy "Allow logged-in users to insert clients"
on "public"."clients"
as permissive
for insert
to authenticated
with check (true);

-- Projects Table
create table if not exists "public"."projects" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text not null,
    "description" text,
    "image_url" text,
    "client_id" uuid,
    "link" text,
    constraint "projects_pkey" primary key (id),
    constraint "projects_client_id_fkey" foreign key (client_id) references clients (id) on delete set null
);

-- Enable RLS for Projects
alter table "public"."projects" enable row level security;

-- Policies for Projects
create policy "Allow logged-in users to view projects"
on "public"."projects"
as permissive
for select
to authenticated
using (true);

create policy "Allow logged-in users to insert projects"
on "public"."projects"
as permissive
for insert
to authenticated
with check (true);

-- Create Storage Bucket for Project Images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project_images', 'project_images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
on conflict (id) do nothing;

-- Policies for Storage Bucket
create policy "Allow logged-in users to upload images"
on storage.objects for insert to authenticated with check ( bucket_id = 'project_images' );

create policy "Allow anyone to view images"
on storage.objects for select using ( bucket_id = 'project_images' );
