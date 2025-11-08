-- Create supporting tables for site sections (Deals of the Week, Banners, Categories)
-- Safe to run multiple times (uses IF NOT EXISTS and idempotent policies)

set search_path to public;

-- 1) Deals of the Week (separate from featured/popular)
create table if not exists deals_of_week (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  priority int not null default 1,
  active boolean not null default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table deals_of_week enable row level security;
drop policy if exists "deals read anon" on deals_of_week;
drop policy if exists "deals read authenticated" on deals_of_week;
drop policy if exists "deals crud admin" on deals_of_week;

-- Public read (active + within window)
create policy "deals read anon" on deals_of_week for select to anon using (
  active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now())
);
create policy "deals read authenticated" on deals_of_week for select to authenticated using (
  active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now())
);

-- Admin CRUD (expects you to grant role via PostgREST or use service key in admin app)
-- For quick start, allow authenticated to manage; tighten later if you use roles column
create policy "deals crud admin" on deals_of_week for all to authenticated using (true) with check (true);

-- 2) Banners (if not already created)
create table if not exists banners (
  slot text primary key,
  product_id uuid not null references products(id) on delete cascade,
  updated_at timestamptz not null default now()
);
alter table banners enable row level security;
drop policy if exists "banners read anon" on banners;
drop policy if exists "banners read authenticated" on banners;
drop policy if exists "banners crud admin" on banners;
create policy "banners read anon" on banners for select to anon using (true);
create policy "banners read authenticated" on banners for select to authenticated using (true);
create policy "banners crud admin" on banners for all to authenticated using (true) with check (true);

-- 3) Categories table (optional, if you want managed images/descriptions)
create table if not exists categories (
  name text primary key,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);
alter table categories enable row level security;
drop policy if exists "categories read anon" on categories;
drop policy if exists "categories read authenticated" on categories;
drop policy if exists "categories crud admin" on categories;
create policy "categories read anon" on categories for select to anon using (true);
create policy "categories read authenticated" on categories for select to authenticated using (true);
create policy "categories crud admin" on categories for all to authenticated using (true) with check (true);

-- Helpful composite view for deals (join to products)
create view if not exists deals_of_week_view as
select d.id, d.priority, d.active, d.starts_at, d.ends_at,
       p.id as product_id, p.name, p.image_url, p.price, p.discount, p.category, p.stock, p.rating
from deals_of_week d
join products p on p.id = d.product_id;

-- Grant access to the view
grant select on deals_of_week_view to anon, authenticated;


