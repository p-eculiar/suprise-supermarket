const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'CREATE_SOCIAL_LEADS_TABLE.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('Social Leads Table Setup');
console.log('========================');
console.log('');
console.log('To create the social_leads table in your Supabase database:');
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
console.log('This will create the social_leads table needed for the Social Media Leads feature.');