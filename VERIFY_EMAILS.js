// Simple script to verify emails are being fetched correctly
// Run this in your browser console on the admin users page

async function verifyEmails() {
  console.log('=== EMAIL VERIFICATION ===');
  
  // Access the supabase client from the window object
  const { data, error } = await window.supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }
  
  console.log('Profiles found:', data);
  
  data.forEach((profile, index) => {
    console.log(`${index + 1}. ${profile.full_name || 'No name'} - ${profile.email || 'NO EMAIL'} (${profile.role || 'no role'})`);
  });
  
  const missingEmails = data.filter(p => !p.email);
  console.log(`\nProfiles with missing emails: ${missingEmails.length}`);
  
  if (missingEmails.length > 0) {
    console.log('Profiles missing emails:');
    missingEmails.forEach(p => console.log(`  - ${p.id}: ${p.full_name || 'No name'}`));
  }
}

// Run the verification
verifyEmails();