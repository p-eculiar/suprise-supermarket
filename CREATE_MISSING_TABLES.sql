-- Create missing tables for admin dashboard features

-- 1) Deals of the Week table
create table if not exists deals_of_week (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  priority int not null default 1,
  active boolean not null default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  -- Custom fields for overriding product details
  custom_name text,
  custom_description text,
  custom_price decimal(10,2),
  custom_image_url text,
  custom_discount decimal(5,2)
);

-- RLS for deals_of_week
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

-- Admin CRUD
create policy "deals crud admin" on deals_of_week for all to authenticated using (true) with check (true);

-- 2) Banners table
create table if not exists banners (
  slot text primary key,
  product_id uuid not null references products(id) on delete cascade,
  updated_at timestamptz not null default now()
);

-- RLS for banners
alter table banners enable row level security;
drop policy if exists "banners read anon" on banners;
drop policy if exists "banners read authenticated" on banners;
drop policy if exists "banners crud admin" on banners;

create policy "banners read anon" on banners for select to anon using (true);
create policy "banners read authenticated" on banners for select to authenticated using (true);
create policy "banners crud admin" on banners for all to authenticated using (true) with check (true);

-- 3) Social Leads table
create table if not exists social_leads (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  author_name text not null,
  author_handle text,
  post_content text not null,
  post_url text,
  contact_info text,
  keywords_matched text[],
  sentiment text not null default 'neutral',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS for social_leads
alter table social_leads enable row level security;
drop policy if exists "social_leads read admin" on social_leads;
drop policy if exists "social_leads crud admin" on social_leads;

-- Only admins can read and manage social leads
create policy "social_leads read admin" on social_leads for select to authenticated using (true);
create policy "social_leads crud admin" on social_leads for all to authenticated using (true) with check (true);

-- 4) Add custom fields to deals_of_week if they don't exist
alter table deals_of_week add column if not exists custom_name text;
alter table deals_of_week add column if not exists custom_description text;
alter table deals_of_week add column if not exists custom_price decimal(10,2);
alter table deals_of_week add column if not exists custom_image_url text;
alter table deals_of_week add column if not exists custom_discount decimal(5,2);

-- 5) Create helpful composite view for deals (join to products)
-- Drop the existing view first to avoid column name conflicts
drop view if exists deals_of_week_view;

-- Create the view with proper column names
create or replace view deals_of_week_view as
select 
  d.id,
  d.priority,
  d.active,
  d.starts_at,
  d.ends_at,
  d.custom_name,
  d.custom_description,
  d.custom_price,
  d.custom_image_url,
  d.custom_discount,
  p.id as product_id,
  p.name as product_name,
  p.image_url,
  p.price as product_price,
  p.discount as product_discount,
  p.category,
  p.stock,
  p.rating
from deals_of_week d
left join products p on p.id = d.product_id;

-- Grant access to the view
grant select on deals_of_week_view to anon, authenticated;

-- 6) Insert sample data for testing
-- Sample deals
insert into deals_of_week (product_id, priority, active, custom_name, custom_price, custom_discount) 
select id, 1, true, 'Special Offer: ' || name, price * 0.9, 10.0
from products 
where active = true 
limit 3
on conflict do nothing;

-- Sample banners (if products exist)
insert into banners (slot, product_id) 
select 'left', id 
from products 
where active = true and image_url is not null 
limit 1
on conflict do nothing;

insert into banners (slot, product_id) 
select 'right', id 
from products 
where active = true and image_url is not null 
order by created_at desc
limit 1
on conflict do nothing;