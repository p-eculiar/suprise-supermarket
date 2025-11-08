# Contact Form Setup Guide

## Overview
This guide explains how to set up and configure the contact form in the Suprise Supermarket application.

## Contact Form Configuration

### Email Configuration
The contact form submissions are stored in the `contacts` table in the database. To receive email notifications when someone submits the contact form, you need to configure email notifications.

### Setting Up Email Notifications

1. **Configure Admin Emails**:
   Add the following to your `.env` file:
   ```
   REACT_APP_ADMIN_EMAIL_1=your-admin-email@example.com
   REACT_APP_ADMIN_EMAIL_2=another-admin-email@example.com
   ```

2. **Set Up Email Service**:
   The application can use SendGrid or similar email services. Add your API key to the `.env` file:
   ```
   REACT_APP_SENDGRID_API_KEY=your-sendgrid-api-key
   ```

### Database Configuration

The contacts table already exists in your database with the following structure:
```sql
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Adding RLS Policies

To ensure proper security, add the following Row Level Security policies to the contacts table:

```sql
-- Enable RLS on contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Anyone can submit contact forms
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contacts;
CREATE POLICY "Anyone can submit contact forms" ON contacts FOR INSERT WITH CHECK (true);

-- Admins can view and manage all contact submissions
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON contacts;
CREATE POLICY "Admins can manage contact submissions" ON contacts FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@surprisesupermarket.com', 'pchikezie05@gmail.com')
);
```

### Testing the Contact Form

1. Navigate to the Contact page (`/contact`)
2. Fill out the form with test information
3. Submit the form
4. Check the database to verify the submission was stored
5. Verify that admin users can access the submissions through the admin dashboard

### Managing Contact Submissions

Admin users can view and manage contact submissions through:
1. The Supabase dashboard directly
2. The admin dashboard (when implemented)
3. Custom admin interface (can be built as needed)

### Contact Form Fields

The contact form includes the following fields:
- **Name**: Required text field
- **Email**: Required email field
- **Phone**: Optional phone number field
- **Subject**: Required dropdown selection
- **Message**: Required textarea for the message content

### Customization

To customize the contact form:
1. Modify the `src/pages/Contact.tsx` file
2. Update the subject options in the dropdown
3. Add or remove fields as needed
4. Update the styling in the styled components
5. Modify the validation rules if necessary

### Troubleshooting

**Issue**: Contact form submissions not being stored
**Solution**: 
1. Check browser console for errors
2. Verify database connection
3. Ensure RLS policies are properly configured
4. Check Supabase logs for any errors

**Issue**: Admins cannot view submissions
**Solution**:
1. Verify admin email addresses in RLS policies
2. Ensure admin users have the correct role in the profiles table
3. Check that the user is logged in as an admin

### Security Considerations

1. **Rate Limiting**: Consider implementing rate limiting to prevent spam
2. **Validation**: All form submissions are validated on the client side
3. **Sanitization**: Input is sanitized before storing in the database
4. **Access Control**: Only authorized admins can view submissions
5. **Data Retention**: Consider implementing data retention policies for privacy compliance