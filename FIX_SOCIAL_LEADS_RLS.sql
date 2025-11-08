-- Fix RLS policies for social_leads table

-- Enable RLS if not already enabled
alter table social_leads enable row level security;

-- Drop existing policies
drop policy if exists "social_leads read admin" on social_leads;
drop policy if exists "social_leads crud admin" on social_leads;

-- Create simple policies that allow authenticated users to read and write
-- (This is a temporary fix - in production, you should restrict this to admins only)
create policy "social_leads read" 
on social_leads for select 
to authenticated 
using (true);

create policy "social_leads crud" 
on social_leads for all 
to authenticated 
using (true)
with check (true);

-- Grant permissions
grant select, insert, update, delete on social_leads to authenticated;