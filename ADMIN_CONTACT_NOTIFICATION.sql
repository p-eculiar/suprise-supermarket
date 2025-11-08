-- Create a view for admin contact notifications
-- This makes it easy for admins to see new contact submissions in the dashboard

-- Create a view that shows unread contacts
CREATE OR REPLACE VIEW admin_contact_notifications AS
SELECT 
  id,
  name,
  email,
  subject,
  message,
  created_at,
  'new' as status
FROM contacts
ORDER BY created_at DESC;

-- Create a function to mark contact as read
CREATE OR REPLACE FUNCTION mark_contact_as_read(contact_id UUID)
RETURNS VOID AS $$
BEGIN
  -- In a more complex implementation, you might have a status column
  -- For now, we'll just log that the contact was viewed
  RAISE NOTICE 'Contact % marked as read', contact_id;
END;
$$ LANGUAGE plpgsql;

-- Create a table to track which admin has read which contact
CREATE TABLE IF NOT EXISTS contact_read_status (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  admin_id UUID, -- This would reference your users table
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (contact_id, admin_id)
);

-- Create a view that shows unread contacts for a specific admin
CREATE OR REPLACE VIEW unread_contacts_for_admin AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.subject,
  c.message,
  c.created_at
FROM contacts c
LEFT JOIN contact_read_status crs ON c.id = crs.contact_id
WHERE crs.contact_id IS NULL -- Not read by anyone
   OR crs.admin_id != auth.uid() -- Not read by current admin
ORDER BY c.created_at DESC;

-- Create function to get unread contact count
CREATE OR REPLACE FUNCTION get_unread_contact_count()
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM contacts c
  LEFT JOIN contact_read_status crs ON c.id = crs.contact_id
  WHERE crs.contact_id IS NULL;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql;