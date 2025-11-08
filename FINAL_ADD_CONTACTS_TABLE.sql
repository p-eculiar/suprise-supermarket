-- Add contacts table to store contact form submissions
-- Final version based on the documented approach

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts table
-- Anyone can submit contact forms (no authentication required)
CREATE POLICY "Anyone can submit contacts"
ON contacts FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view contacts
CREATE POLICY "Admins can view contacts"
ON contacts FOR SELECT
USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE contacts TO anon, authenticated;