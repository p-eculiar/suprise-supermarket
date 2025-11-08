const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from .env file
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCategoriesFilter() {
  console.log('Testing categories filter implementation...');
  
  try {
    // Test 1: Get all categories from categories table
    console.log('\n1. Getting all categories from categories table:');
    const { data: catRows, error: catErr } = await supabase
      .from('categories')
      .select('name, image_url')
      .order('name', { ascending: true });
    
    if (catErr) {
      console.error('Error fetching categories:', catErr);
      return;
    }
    
    console.log('Categories from table:', catRows);
    
    // Test 2: Get all products and count by category
    console.log('\n2. Getting all products and counting by category:');
    const { data: prodRows, error: prodErr } = await supabase
      .from('products')
      .select('category')
      .eq('active', true);
    
    if (prodErr) {
      console.error('Error fetching products:', prodErr);
      return;
    }
    
    const counts = new Map();
    prodRows?.forEach(p => {
      const category = p.category;
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    
    console.log('Product counts by category:', Object.fromEntries(counts));
    
    // Test 3: Filter categories to only show those with products
    console.log('\n3. Filtering categories to only show those with products:');
    const categoriesWithProducts = catRows.filter(cat => 
      counts.get(cat.name) && counts.get(cat.name) > 0
    );
    
    console.log('Categories with products:', categoriesWithProducts);
    
    // Test 4: Show categories without products
    console.log('\n4. Categories without products:');
    const categoriesWithoutProducts = catRows.filter(cat => 
      !counts.get(cat.name) || counts.get(cat.name) === 0
    );
    
    console.log('Categories without products:', categoriesWithoutProducts);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testCategoriesFilter();