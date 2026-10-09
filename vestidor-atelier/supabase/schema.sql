-- ============================================================
-- Vestidor Digital Atelier — esquema, RLS y Storage
-- Ejecutar completo en Supabase > SQL Editor > New query > Run
-- ============================================================

-- 1) TABLAS ---------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text,
  category text not null check (category in ('tops', 'bottoms', 'shoes')),
  image_path text not null,
  created_at timestamptz not null default now()
);

-- ON DELETE SET NULL: al borrar una prenda, los outfits que la usan se conservan sin esa prenda.
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text,
  top_garment_id uuid references public.garments(id) on delete set null,
  bottom_garment_id uuid references public.garments(id) on delete set null,
  shoe_garment_id uuid references public.garments(id) on delete set null,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2) ÍNDICES --------------------------------------------------
create index if not exists garments_user_cat_idx on public.garments (user_id, category, created_at desc);
create index if not exists outfits_user_idx on public.outfits (user_id, created_at desc);
create index if not exists outfits_top_idx on public.outfits (top_garment_id);
create index if not exists outfits_bottom_idx on public.outfits (bottom_garment_id);
create index if not exists outfits_shoe_idx on public.outfits (shoe_garment_id);

-- 3) PERFIL AUTOMÁTICO AL CREAR USUARIO -----------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Si ya creaste el usuario antes de ejecutar este script:
insert into public.profiles (id, display_name)
select id, split_part(email, '@', 1) from auth.users on conflict do nothing;

-- 4) ROW LEVEL SECURITY --------------------------------------
alter table public.profiles enable row level security;
alter table public.garments enable row level security;
alter table public.outfits enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "garments_select_own" on public.garments;
drop policy if exists "garments_insert_own" on public.garments;
drop policy if exists "garments_update_own" on public.garments;
drop policy if exists "garments_delete_own" on public.garments;
create policy "garments_select_own" on public.garments for select to authenticated using (user_id = auth.uid());
create policy "garments_insert_own" on public.garments for insert to authenticated
  with check (user_id = auth.uid() and image_path like auth.uid()::text || '/%');
create policy "garments_update_own" on public.garments for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "garments_delete_own" on public.garments for delete to authenticated using (user_id = auth.uid());

-- Los outfits solo pueden referenciar prendas del mismo usuario.
drop policy if exists "outfits_select_own" on public.outfits;
drop policy if exists "outfits_insert_own" on public.outfits;
drop policy if exists "outfits_update_own" on public.outfits;
drop policy if exists "outfits_delete_own" on public.outfits;
create policy "outfits_select_own" on public.outfits for select to authenticated using (user_id = auth.uid());
create policy "outfits_insert_own" on public.outfits for insert to authenticated with check (
  user_id = auth.uid()
  and (top_garment_id is null or exists (select 1 from public.garments g where g.id = top_garment_id and g.user_id = auth.uid()))
  and (bottom_garment_id is null or exists (select 1 from public.garments g where g.id = bottom_garment_id and g.user_id = auth.uid()))
  and (shoe_garment_id is null or exists (select 1 from public.garments g where g.id = shoe_garment_id and g.user_id = auth.uid()))
);
create policy "outfits_update_own" on public.outfits for update to authenticated using (user_id = auth.uid()) with check (
  user_id = auth.uid()
  and (top_garment_id is null or exists (select 1 from public.garments g where g.id = top_garment_id and g.user_id = auth.uid()))
  and (bottom_garment_id is null or exists (select 1 from public.garments g where g.id = bottom_garment_id and g.user_id = auth.uid()))
  and (shoe_garment_id is null or exists (select 1 from public.garments g where g.id = shoe_garment_id and g.user_id = auth.uid()))
);
create policy "outfits_delete_own" on public.outfits for delete to authenticated using (user_id = auth.uid());

-- 5) STORAGE: bucket privado "garments" ----------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('garments', 'garments', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Cada usuario solo accede a la carpeta <user_id>/...
drop policy if exists "garments_files_select" on storage.objects;
drop policy if exists "garments_files_insert" on storage.objects;
drop policy if exists "garments_files_update" on storage.objects;
drop policy if exists "garments_files_delete" on storage.objects;
create policy "garments_files_select" on storage.objects for select to authenticated
  using (bucket_id = 'garments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "garments_files_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'garments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "garments_files_update" on storage.objects for update to authenticated
  using (bucket_id = 'garments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "garments_files_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'garments' and (storage.foldername(name))[1] = auth.uid()::text);
