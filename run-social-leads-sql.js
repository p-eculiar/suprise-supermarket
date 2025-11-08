const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if the SQL file exists
const sqlFilePath = path.join(__dirname, 'CREATE_SOCIAL_LEADS_TABLE.sql');

if (!fs.existsSync(sqlFilePath)) {
  console.error('CREATE_SOCIAL_LEADS_TABLE.sql file not found!');
  process.exit(1);
}

console.log('Running CREATE_SOCIAL_LEADS_TABLE.sql...');

// Read the SQL file
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// For now, just output the SQL content to the console
// In a real implementation, you would connect to Supabase and execute this SQL
console.log('SQL to execute:');
console.log('================');
console.log(sqlContent);
console.log('================');
console.log('');
console.log('To run this SQL:');
console.log('1. Copy the SQL content above');
console.log('2. Paste it into your Supabase SQL editor');
console.log('3. Execute it in your database');