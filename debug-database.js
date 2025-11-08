const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from your .env file
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDatabase() {
  console.log('Debugging Supabase database...');
  
  // Check if we can connect to the database
  try {
    // Check products table
    console.log('\n--- Checking Products Table ---');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else {
      console.log(`Found ${products?.length || 0} products`);
      if (products && products.length > 0) {
        console.log('Sample products:', products.slice(0, 2));
      }
    }
    
    // Check categories
    console.log('\n--- Checking Categories ---');
    const { data: categories, error: categoriesError } = await supabase
      .from('products')
      .select('category');
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      console.log(`Found ${categories?.length || 0} category entries`);
      if (categories && categories.length > 0) {
        const uniqueCategories = [...new Set(categories.map(p => p.category).filter(cat => cat && cat.trim() !== ''))];
        console.log('Unique categories:', uniqueCategories);
      }
    }
    
    // Check table structure
    console.log('\n--- Checking Table Structure ---');
    const { data: tableInfo, error: tableError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error fetching table structure:', tableError);
    } else {
      if (tableInfo && tableInfo.length > 0) {
        console.log('Table columns:', Object.keys(tableInfo[0]));
      } else {
        console.log('Table is empty or doesn\'t exist');
      }
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

debugDatabase();