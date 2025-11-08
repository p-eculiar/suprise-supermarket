const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCategories() {
  console.log('Testing categories loading...');
  
  try {
    // First try to get categories from the categories table
    console.log('1. Trying to fetch from categories table...');
    const { data: catRows, error: catErr } = await supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true });

    console.log('Categories table data:', catRows);
    console.log('Categories table error:', catErr);
    
    if (!catErr && catRows && catRows.length > 0) {
      console.log('Found categories in categories table');
      return;
    }

    // Fallback: get categories from products
    console.log('2. Falling back to products table...');
    const { data: prodRows, error: prodErr } = await supabase
      .from('products')
      .select('category')
      .eq('active', true);

    console.log('Products table data (first 5):', prodRows ? prodRows.slice(0, 5) : null);
    console.log('Products table error:', prodErr);
    
    if (!prodErr && prodRows) {
      const uniqueCategories = Array.from(new Set(prodRows.map((p) => p.category)));
      console.log('Unique categories from products:', uniqueCategories);
    }
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testCategories();