-- Create a database function that sends a webhook notification when a contact is submitted
-- This is more suitable for production environments

-- Function to send webhook notification
CREATE OR REPLACE FUNCTION notify_contact_submission()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  payload JSON;
  response RECORD;
BEGIN
  -- Get webhook URL from environment or use a default
  webhook_url := current_setting('app.contact_webhook_url', true);
  
  -- If no webhook URL is configured, just log and return
  IF webhook_url IS NULL OR webhook_url = '' THEN
    RAISE NOTICE 'No webhook URL configured for contact notifications';
    RETURN NEW;
  END IF;
  
  -- Create payload with contact data
  payload := json_build_object(
    'contact', json_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'subject', NEW.subject,
      'message', NEW.message,
      'created_at', NEW.created_at
    )
  );
  
  -- In a real implementation, you would make an HTTP request here
  -- Since PostgreSQL doesn't have built-in HTTP support, you would typically:
  -- 1. Use a separate service to monitor the contacts table
  -- 2. Use Supabase's webhooks feature
  -- 3. Use a background job processor
  
  RAISE NOTICE 'Contact webhook notification would be sent to % with payload: %', webhook_url, payload;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contact notifications
CREATE OR REPLACE TRIGGER contact_webhook_trigger
  AFTER INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION notify_contact_submission();

-- To configure the webhook URL, you would run:
-- ALTER DATABASE your_database SET app.contact_webhook_url = 'https://your-webhook-url.com/contact';