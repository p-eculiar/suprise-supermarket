-- Setup Supabase webhook for contact form notifications
-- This is the recommended approach for production

-- First, ensure the contacts table has the right structure
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied'));

-- Create an index on status for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

-- Create a function to handle contact notifications
-- This would be called by a webhook or background process
CREATE OR REPLACE FUNCTION process_new_contact()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the new contact submission
  RAISE NOTICE 'New contact form submission: % (%) - %', NEW.name, NEW.email, NEW.subject;
  
  -- Update status to 'new' if not already set
  IF NEW.status IS NULL OR NEW.status = '' THEN
    NEW.status := 'new';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new contacts
CREATE OR REPLACE TRIGGER new_contact_trigger
  BEFORE INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION process_new_contact();

-- To set up Supabase webhooks for production:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to "Database" → "Webhooks"
-- 3. Create a new webhook with these settings:
--    - Event: INSERT on contacts table
--    - URL: Your webhook endpoint (e.g., https://your-app.com/api/contact-notification)
--    - Headers: Include authentication if needed

-- Example webhook payload structure:
/*
{
  "type": "INSERT",
  "table": "contacts",
  "record": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "General Inquiry",
    "message": "Hello, I have a question...",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
*/

-- Your webhook endpoint would then process this and send emails using your preferred email service