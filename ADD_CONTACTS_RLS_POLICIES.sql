-- Add Row Level Security policies for the contacts table
-- This should be run after the table is created

-- Enable Row Level Security (if not already enabled)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts table
-- Anyone can submit contact forms (no authentication required)
CREATE POLICY "Anyone can submit contacts"
ON contacts FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view contacts (admins will be able to see them)
CREATE POLICY "Authenticated users can view contacts"
ON contacts FOR SELECT
USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE contacts TO anon, authenticated;