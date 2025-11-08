-- Add RLS policies for contacts table

-- Enable RLS on contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Anyone can submit contact forms
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contacts;
CREATE POLICY "Anyone can submit contact forms" ON contacts FOR INSERT WITH CHECK (true);

-- Admins can view and manage all contact submissions
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON contacts;
CREATE POLICY "Admins can manage contact submissions" ON contacts FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@surprisesupermarket.com', 'pchikezie05@gmail.com', 'chikwendupeculiar66@gmail.com', 'surpry1980@yahoo.com')
);

-- Verify the policies were created
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'contacts';