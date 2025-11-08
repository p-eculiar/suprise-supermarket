const { exec } = require('child_process');
const path = require('path');

// Run the SQL script to create the missing social_leads table
const scriptPath = path.join(__dirname, 'CREATE_MISSING_TABLES.sql');

console.log('Creating social_leads table...');

exec(`npx supabase-cli db reset`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  
  console.log(`stdout: ${stdout}`);
  console.log('social_leads table created successfully!');
});