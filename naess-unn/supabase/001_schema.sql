-- NAESS UNN CMS: schema, row level security, storage, demo seed.
-- Run in Supabase SQL editor. Then create your first user in Auth and run:
--   update public.profiles set role='super_admin' where id = '<auth user id>';

create extension if not exists pgcrypto;

create type content_status as enum ('draft','published','archived');
create type event_status   as enum ('upcoming','ongoing','completed','cancelled');
create type user_role      as enum ('super_admin','content_admin','editor');

-- ---------- users ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'editor',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create function app_role() returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid() and active
$$;
create function is_staff()         returns boolean language sql stable as $$ select app_role() is not null $$;
create function is_content_admin() returns boolean language sql stable as $$ select app_role() in ('super_admin','content_admin') $$;
create function is_super_admin()   returns boolean language sql stable as $$ select app_role() = 'super_admin' $$;

-- ---------- site configuration ----------
create table site_settings (            -- key/value: general, branding, seo, contact, footer
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null, label text, url text not null,
  sort_order int not null default 0, visible boolean not null default true
);

create table navigation_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references navigation_items(id) on delete cascade,
  location text not null default 'header' check (location in ('header','footer')),
  label text not null, url text not null,
  sort_order int not null default 0, visible boolean not null default true
);

create table homepage_sections (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,             -- hero, about, mission_vision, leadership, news, events, memories, history, stats, cta
  title text, subtitle text, body text, image_url text,
  button_label text, button_url text,
  secondary_button_label text, secondary_button_url text,
  alignment text default 'left',
  config jsonb not null default '{}',   -- section specific (stats list, item counts, overlay, etc.)
  visible boolean not null default true,
  sort_order int not null default 0
);

create table pages (                    -- about, mission, vision, objectives, values, contact text
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null,
  content text, image_url text,
  status content_status not null default 'published',
  seo_title text, seo_description text, og_image text,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------- media ----------
create table media (
  id uuid primary key default gen_random_uuid(),
  path text unique not null, url text not null,
  filename text, mime_type text, size_bytes bigint,
  alt_text text, width int, height int,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- news ----------
create table news_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text unique not null, sort_order int default 0
);
create table news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, excerpt text,
  content text, cover_image text, author text,
  category_id uuid references news_categories(id) on delete set null,
  tags text[] not null default '{}',
  status content_status not null default 'draft',
  featured boolean not null default false,
  published_at timestamptz,             -- future date = scheduled
  seo_title text, seo_description text, og_image text, canonical_url text,
  is_demo boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  fts tsvector generated always as (to_tsvector('english', coalesce(title,'')||' '||coalesce(excerpt,'')||' '||coalesce(content,''))) stored
);
create index on news using gin (fts);
create index on news (status, published_at desc);

-- ---------- events ----------
create table events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, description text,
  image_url text, event_date date not null, start_time time, end_time time,
  venue text, organizer text, registration_url text, report text,
  event_status event_status not null default 'upcoming',
  status content_status not null default 'draft',
  featured boolean not null default false,
  seo_title text, seo_description text, og_image text, canonical_url text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  fts tsvector generated always as (to_tsvector('english', coalesce(title,'')||' '||coalesce(description,'')||' '||coalesce(venue,''))) stored
);
create index on events using gin (fts);

-- ---------- leadership ----------
create table administrations (
  id uuid primary key default gen_random_uuid(),
  session text unique not null,         -- e.g. 2026/2027
  title text, description text,
  is_current boolean not null default false,
  status content_status not null default 'published',
  is_demo boolean not null default false
);
create unique index one_current_administration on administrations (is_current) where is_current;

create table positions (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, sort_order int not null default 0
);
create table executives (
  id uuid primary key default gen_random_uuid(),
  administration_id uuid not null references administrations(id) on delete cascade,
  position_id uuid references positions(id) on delete set null,
  full_name text not null, photo_url text,
  faculty text, department text, level text, bio text,
  social_links jsonb not null default '[]',
  sort_order int not null default 0,
  status content_status not null default 'published',
  is_demo boolean not null default false,
  fts tsvector generated always as (to_tsvector('english', coalesce(full_name,'')||' '||coalesce(bio,''))) stored
);
create index on executives using gin (fts);

-- ---------- history ----------
create table history_entries (
  id uuid primary key default gen_random_uuid(),
  year text not null, title text not null, description text,
  image_url text, gallery jsonb not null default '[]',
  sort_order int not null default 0,
  status content_status not null default 'published',
  is_demo boolean not null default false,
  fts tsvector generated always as (to_tsvector('english', coalesce(title,'')||' '||coalesce(description,''))) stored
);
create index on history_entries using gin (fts);

-- ---------- gallery ----------
create table gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, description text,
  cover_image text, album_date date, location text,
  featured boolean not null default false,
  status content_status not null default 'draft',
  seo_title text, seo_description text, og_image text,
  is_demo boolean not null default false
);
create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references gallery_albums(id) on delete cascade,
  image_url text not null, caption text, alt_text text,
  sort_order int not null default 0
);
-- optional event gallery link
create table event_gallery (
  event_id uuid references events(id) on delete cascade,
  album_id uuid references gallery_albums(id) on delete cascade,
  primary key (event_id, album_id)
);

-- ---------- documents ----------
create table document_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null, slug text unique not null, sort_order int default 0
);
create table documents (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, description text,
  category_id uuid references document_categories(id) on delete set null,
  file_url text not null, file_name text, mime_type text, size_bytes bigint,
  status content_status not null default 'draft',
  featured boolean not null default false,
  seo_title text, seo_description text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  fts tsvector generated always as (to_tsvector('english', coalesce(title,'')||' '||coalesce(description,''))) stored
);
create index on documents using gin (fts);

-- ---------- activity log ----------
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  user_name text, action text not null, entity text, entity_id text, summary text,
  created_at timestamptz not null default now()
);
create index on activity_logs (created_at desc);

-- ---------- row level security ----------
-- Public-readable config (writes: content admins)
do $$ declare t text; begin
  foreach t in array array['site_settings','social_links','navigation_items','homepage_sections','news_categories','document_categories','positions'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "admin write" on %I for all using (is_content_admin()) with check (is_content_admin())', t);
  end loop;
end $$;

-- Status-gated content (public sees published; staff sees all; editors write; content admins delete)
do $$ declare t text; begin
  foreach t in array array['pages','events','administrations','executives','history_entries','gallery_albums','documents'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "public read published" on %I for select using (status = ''published'' or is_staff())', t);
    execute format('create policy "staff insert" on %I for insert with check (is_staff())', t);
    execute format('create policy "staff update" on %I for update using (is_staff()) with check (is_staff())', t);
    execute format('create policy "admin delete" on %I for delete using (is_content_admin())', t);
  end loop;
end $$;

alter table news enable row level security;
create policy "public read published" on news for select
  using ((status = 'published' and published_at <= now()) or is_staff());
create policy "staff insert" on news for insert with check (is_staff());
create policy "staff update" on news for update using (is_staff()) with check (is_staff());
create policy "admin delete" on news for delete using (is_content_admin());

alter table gallery_items enable row level security;
create policy "public read" on gallery_items for select using (
  exists (select 1 from gallery_albums a where a.id = album_id and (a.status = 'published' or is_staff())));
create policy "staff write" on gallery_items for all using (is_staff()) with check (is_staff());

alter table event_gallery enable row level security;
create policy "public read" on event_gallery for select using (true);
create policy "staff write" on event_gallery for all using (is_staff()) with check (is_staff());

alter table media enable row level security;
create policy "staff read" on media for select using (is_staff());
create policy "staff insert" on media for insert with check (is_staff());
create policy "admin modify" on media for update using (is_content_admin());
create policy "admin delete" on media for delete using (is_content_admin());

alter table profiles enable row level security;
create policy "self or super read" on profiles for select using (id = auth.uid() or is_super_admin());
create policy "super manage" on profiles for update using (is_super_admin()) with check (is_super_admin());

alter table activity_logs enable row level security;
create policy "super read" on activity_logs for select using (is_super_admin());
create policy "staff insert own" on activity_logs for insert with check (is_staff() and user_id = auth.uid());

-- ---------- storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media','media', true, 20971520,
  array['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do nothing;

create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media staff upload" on storage.objects for insert with check (bucket_id = 'media' and is_staff());
create policy "media admin modify" on storage.objects for update using (bucket_id = 'media' and is_content_admin());
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and is_content_admin());

-- ---------- seed (placeholders only; no invented NAESS history) ----------
insert into site_settings (key, value) values
 ('general', '{"name":"National Association of Ebonyi State Students, University of Nigeria, Nsukka","short_name":"NAESS UNN","description":"Official website of NAESS UNN.","logo_url":null,"favicon_url":null}'),
 ('branding', '{"primary":"#14532d","secondary":"#166534","accent":"#b45309","background":"#fafaf7","text":"#1c1917"}'),
 ('seo', '{"title":"NAESS UNN","description":"Official website of the National Association of Ebonyi State Students, UNN.","keywords":"NAESS, UNN, Ebonyi students","og_image":null}'),
 ('contact', '{"email":"","phone":"","address":"","description":"Add NAESS contact information here."}'),
 ('footer', '{"description":"Add a short NAESS description here.","copyright":"© NAESS UNN. All rights reserved.","visible":true}');

insert into homepage_sections (key,title,subtitle,body,button_label,button_url,sort_order) values
 ('hero','National Association of Ebonyi State Students','University of Nigeria, Nsukka','Add a short welcome statement here.','About NAESS','/about',1),
 ('about','Who We Are',null,'Add NAESS introduction here.','Read more','/about',2),
 ('mission_vision','Mission & Vision',null,null,null,null,3),
 ('leadership','Executive Council',null,null,'Meet the council','/executives',4),
 ('news','Latest News',null,null,'All news','/news',5),
 ('events','Upcoming Events',null,null,'All events','/events',6),
 ('memories','Memories',null,null,'View gallery','/gallery',7),
 ('history','Our History',null,null,'Full timeline','/history',8),
 ('stats','NAESS at a Glance',null,null,null,null,9),
 ('cta','Stay connected',null,'Add a call to action here.','Contact us','/contact',10);

insert into navigation_items (label,url,sort_order) values
 ('Home','/',1),('About','/about',2),('History','/history',3),('Executives','/executives',4),
 ('News','/news',5),('Events','/events',6),('Gallery','/gallery',7),('Documents','/documents',8),('Contact','/contact',9);

insert into news_categories (name,slug,sort_order) values
 ('News','news',1),('Announcement','announcement',2),('Academic','academic',3),('Welfare','welfare',4),
 ('Events','events',5),('Executive','executive',6),('General','general',7);

insert into document_categories (name,slug,sort_order) values
 ('Constitution','constitution',1),('Reports','reports',2),('Minutes','minutes',3),('Notices','notices',4),
 ('Publications','publications',5),('Forms','forms',6),('Other','other',7);

insert into positions (name,sort_order) values
 ('President',1),('Vice President',2),('General Secretary',3),('Public Relations Officer',4),('Treasurer',5);

insert into pages (slug,title,content,sort_order) values
 ('about','Who We Are','<p>Add NAESS introduction here.</p>',1),
 ('mission','Our Mission','<p>Add NAESS mission here.</p>',2),
 ('vision','Our Vision','<p>Add NAESS vision here.</p>',3),
 ('objectives','Our Objectives','<p>Add NAESS objectives here.</p>',4),
 ('values','Core Values','<p>Add NAESS core values here.</p>',5);

insert into administrations (session,title,description,is_current,is_demo)
values ('2026/2027','2026/2027 Executive Council','DEMO: replace with the real administration.',true,true);

insert into history_entries (year,title,description,sort_order,is_demo)
values ('Year','Add NAESS historical milestone here.','DEMO entry. Replace or delete.',1,true);
