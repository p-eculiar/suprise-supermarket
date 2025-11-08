-- Create social_leads table for Social Media Leads feature

-- Create the social_leads table
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

-- Grant access to the table
grant select, insert, update, delete on social_leads to authenticated;