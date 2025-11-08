// Debug script to check user email fetching in the frontend
// Run this in the browser console when on the Users page

async function debugUserEmails() {
  try {
    console.log('=== DEBUG USER EMAILS ===');
    
    // Import supabase client (this assumes it's available in window object)
    // If not, you'll need to import it properly
    const supabase = window.supabase; // Adjust this based on how supabase is imported in your app
    
    if (!supabase) {
      console.error('Supabase client not found. Make sure you run this in the context of your app.');
      return;
    }
    
    console.log('1. Fetching profiles data...');
    
    // Fetch profiles data exactly as done in the Users.tsx file
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Profiles query error:', profilesError);
      return;
    }
    
    console.log('2. Profiles data received:', profilesData);
    
    if (!profilesData || profilesData.length === 0) {
      console.log('No profiles found in the database');
      return;
    }
    
    console.log('3. Analyzing profile data structure...');
    
    // Log the structure of the first few profiles
    for (let i = 0; i < Math.min(3, profilesData.length); i++) {
      const profile = profilesData[i];
      console.log(`Profile ${i + 1}:`, {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
        all_properties: Object.keys(profile)
      });
    }
    
    // Check for missing or invalid emails
    const profilesWithoutEmails = profilesData.filter(p => !p.email || p.email === '');
    const profilesWithEmails = profilesData.filter(p => p.email && p.email !== '');
    
    console.log('4. Email analysis:');
    console.log(`- Total profiles: ${profilesData.length}`);
    console.log(`- Profiles with emails: ${profilesWithEmails.length}`);
    console.log(`- Profiles without emails: ${profilesWithoutEmails.length}`);
    
    if (profilesWithoutEmails.length > 0) {
      console.log('Profiles without emails:');
      profilesWithoutEmails.forEach((p, index) => {
        console.log(`  ${index + 1}. ID: ${p.id}, Name: ${p.full_name || 'No name'}`);
      });
    }
    
    if (profilesWithEmails.length > 0) {
      console.log('Profiles with emails (first 5):');
      profilesWithEmails.slice(0, 5).forEach((p, index) => {
        console.log(`  ${index + 1}. ID: ${p.id}, Name: ${p.full_name || 'No name'}, Email: ${p.email}`);
      });
    }
    
    // Try to fetch from auth.users table as well
    console.log('5. Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (authError) {
      console.log('Could not fetch from auth.users (this is normal if RLS restricts access):', authError.message);
    } else {
      console.log('Auth users data:', authUsers);
    }
    
    console.log('=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('Debug script error:', error);
  }
}

// Run the debug function
debugUserEmails();