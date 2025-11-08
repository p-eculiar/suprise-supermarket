-- Simple RLS fix for social_leads table

-- First, let's check the current policies
\dp social_leads

-- Drop all existing policies
drop policy if exists "social_leads read admin" on social_leads;
drop policy if exists "social_leads crud admin" on social_leads;
drop policy if exists "social_leads read" on social_leads;
drop policy if exists "social_leads crud" on social_leads;

-- Create very permissive policies for testing
create policy "social_leads read test" 
on social_leads for select 
to authenticated, anon
using (true);

create policy "social_leads crud test" 
on social_leads for all 
to authenticated, anon
using (true)
with check (true);

-- Grant all permissions
grant all on social_leads to authenticated, anon;