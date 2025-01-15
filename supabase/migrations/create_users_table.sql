-- Vytvoření tabulky users s rozšířenými sloupci
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text unique,
  photo_url text,
  settings jsonb default '{"notifications": true, "darkMode": false, "language": "cs"}'::jsonb,
  goals text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vytvoření storage bucketu pro profilové fotky
insert into storage.buckets (id, name) values ('profile-photos', 'profile-photos');

-- Nastavení RLS politik pro tabulku users
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.users for update
  using ( auth.uid() = id );

-- Nastavení RLS politik pro storage bucket profile-photos
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'profile-photos' );

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check ( bucket_id = 'profile-photos' AND auth.uid() = owner );

