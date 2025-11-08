const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'FIX_SOCIAL_LEADS_RLS.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('Social Leads RLS Fix');
console.log('====================');
console.log('');
console.log('To fix the row-level security policies for the social_leads table:');
console.log('');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Create a new query');
console.log('4. Copy and paste the SQL below:');
console.log('');
console.log('================ START SQL ================');
console.log(sqlContent);
console.log('================ END SQL =================');
console.log('');
console.log('5. Click "Run" to execute the query');
console.log('');
console.log('This will fix the RLS policies that are preventing data insertion.');