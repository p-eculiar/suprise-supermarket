-- Create a database function to send email notifications for contact form submissions
-- This uses Supabase's built-in email functionality

-- First, let's create a function that sends email notifications
CREATE OR REPLACE FUNCTION send_contact_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be triggered when a new contact is inserted
  -- In a real implementation, you would integrate with an email service here
  
  -- For now, we'll just log that a contact was submitted
  RAISE NOTICE 'New contact form submission from %: %', NEW.email, NEW.subject;
  
  -- In a production environment, you could:
  -- 1. Use Supabase's integration with SendGrid/Resend/etc.
  -- 2. Call an external webhook
  -- 3. Insert into a notification queue table that's processed by a background job
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that fires when a new contact is inserted
CREATE OR REPLACE TRIGGER contact_notification_trigger
  AFTER INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION send_contact_notification();

-- Alternative approach: Create a notification queue table
CREATE TABLE IF NOT EXISTS contact_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Insert into notification queue when contact is submitted
CREATE OR REPLACE FUNCTION queue_contact_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a record into the notification queue
  INSERT INTO contact_notifications (contact_id, status)
  VALUES (NEW.id, 'pending');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification queue
CREATE OR REPLACE TRIGGER contact_queue_trigger
  AFTER INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION queue_contact_notification();