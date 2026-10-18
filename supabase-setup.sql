-- Tunita Kids: ejecutar una sola vez en Supabase > SQL Editor.
-- La interfaz pública solo puede leer prendas activas. Las escrituras requieren una
-- cuenta agregada manualmente a public.admin_users y las políticas RLS de abajo.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
drop policy if exists "Admins can see their own access" on public.admin_users;
create policy "Admins can see their own access"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.admin_users to authenticated;

create or replace function public.is_tunita_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_tunita_admin() from public;
grant execute on function public.is_tunita_admin() to authenticated;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  audience text,
  name text not null,
  detail text not null default '',
  price numeric(10,0) not null check (price >= 0),
  description text not null default '',
  image_url text not null,
  image_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
drop policy if exists "Public can see published products" on public.products;
create policy "Public can see published products"
  on public.products for select to anon
  using (active = true);
drop policy if exists "Signed-in users can see published or admin products" on public.products;
create policy "Signed-in users can see published or admin products"
  on public.products for select to authenticated
  using (active = true or (select public.is_tunita_admin()));
drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products"
  on public.products for insert to authenticated
  with check ((select public.is_tunita_admin()));
drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products"
  on public.products for update to authenticated
  using ((select public.is_tunita_admin()))
  with check ((select public.is_tunita_admin()));
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete to authenticated
  using ((select public.is_tunita_admin()));
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Anyone can view product photos" on storage.objects;
create policy "Anyone can view product photos"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');
drop policy if exists "Admins can upload product photos" on storage.objects;
create policy "Admins can upload product photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_tunita_admin()));
drop policy if exists "Admins can update product photos" on storage.objects;
create policy "Admins can update product photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_tunita_admin()))
  with check (bucket_id = 'product-images' and (select public.is_tunita_admin()));
drop policy if exists "Admins can delete product photos" on storage.objects;
create policy "Admins can delete product photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_tunita_admin()));

-- Producto que ya estaba en la tienda. Si corrés este SQL otra vez no duplica la prenda.
insert into public.products (id, category, audience, name, detail, price, description, image_url, active)
values (
  'fc7449b1-1f8b-4f19-9c6a-86d6a7c3569f', 'Conjuntos', 'Varones',
  'Conjunto Following The Track', 'Buzo y pantalón · Poca felpa', 1290,
  'Un conjunto cómodo de buzo y pantalón para acompañar los días frescos y sus aventuras.',
  'https://nicolasviotti95-cpu.github.io/tunita-kids/assets/following-track.jpg', true
)
on conflict (id) do nothing;

-- Después de crear tu usuario en Authentication > Users, copiá su UUID y ejecutá:
-- insert into public.admin_users (user_id) values ('PEGAR-ACA-EL-UUID-DE-TU-USUARIO');

