// Test script to verify contact form functionality
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://awepkphahdheqomgucby.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testContactForm() {
  console.log('Testing contact form functionality...');
  
  // Test data
  const contactData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Contact Form Submission',
    message: 'This is a test message from the contact form to verify functionality.'
  };
  
  try {
    // First, check if contacts table exists
    console.log('Checking if contacts table exists...');
    const { data: tableData, error: tableError } = await supabase
      .from('contacts')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Contacts table does not exist or is not accessible:', tableError.message);
      console.log('Please run the ADD_CONTACTS_TABLE.sql script in your Supabase SQL editor.');
      return;
    }
    
    console.log('Contacts table exists and is accessible.');
    
    // Insert test contact data
    console.log('Inserting test contact data...');
    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData]);
    
    if (error) {
      console.error('Error inserting contact data:', error.message);
      return;
    }
    
    console.log('✅ Contact form submission successful!');
    
    // Verify the data was inserted
    console.log('Verifying data insertion...');
    const { data: insertedData, error: selectError } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', contactData.email)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (selectError) {
      console.error('Error verifying inserted data:', selectError.message);
      return;
    }
    
    if (insertedData && insertedData.length > 0) {
      console.log('✅ Data successfully inserted into contacts table:');
      console.log('Name:', insertedData[0].name);
      console.log('Email:', insertedData[0].email);
      console.log('Subject:', insertedData[0].subject);
      console.log('Message:', insertedData[0].message);
      console.log('Created at:', insertedData[0].created_at);
    } else {
      console.log('❌ Data was not found after insertion');
    }
    
    // Test the email notification system
    console.log('\nTesting email notification system...');
    try {
      // Import and test email service
      // Note: This would require running in a Node.js environment with proper setup
      console.log('Email notification system test requires backend integration.');
      console.log('In a production environment, this would send an email to the admin emails:');
      console.log('- chikwendupeculiar66@gmail.com');
      console.log('- surpry1980@yahoo.com');
    } catch (emailError) {
      console.log('Email notification test skipped:', emailError.message);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Run the test
testContactForm();