const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from your .env file
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection by fetching products
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, price, image_url')
      .limit(5);

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    console.log('Connection successful!');
    console.log('Products found:', data.length);
    console.log('Sample products:', data);
    
    // Check total count
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting products:', countError);
    } else {
      console.log('Total products in database:', count);
    }
    
    // Check categories
    const { data: categories, error: categoriesError } = await supabase
      .from('products')
      .select('category')
      .neq('category', '')
      .not('category', 'is', null);

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      const uniqueCategories = [...new Set(categories.map(p => p.category))];
      console.log('Categories found:', uniqueCategories);
    }
    
  } catch (err) {
    console.error('Connection test failed:', err);
  }
}

testConnection();