const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from .env file
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupCategoriesTable() {
  console.log('Setting up categories table...');
  
  try {
    // Check if categories table exists by trying to select from it
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('Categories table does not exist. Creating it...');
      
      // Create the categories table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT,
          product_count INTEGER DEFAULT 0,
          display_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      // We can't execute raw SQL directly, so we'll use the Supabase dashboard or migrations
      console.log('Please create the categories table using the Supabase dashboard with the following schema:');
      console.log(createTableQuery);
      
      // Create indexes
      console.log('Also create these indexes:');
      console.log('CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);');
      console.log('CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);');
      console.log('CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);');
      
      // Create updated_at trigger function if it doesn't exist
      console.log('Create this trigger function if it does not exist:');
      console.log(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      console.log('Create this trigger:');
      console.log(`
        CREATE TRIGGER update_categories_updated_at 
          BEFORE UPDATE ON categories
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
      `);
      
      // Insert sample categories
      console.log('Inserting sample categories...');
      const sampleCategories = [
        { name: 'Vegetables', slug: 'vegetables', description: 'Fresh vegetables from local farms' },
        { name: 'Fruits', slug: 'fruits', description: 'Seasonal fruits and berries' },
        { name: 'Dairy', slug: 'dairy', description: 'Milk, cheese, yogurt and other dairy products' },
        { name: 'Meat', slug: 'meat', description: 'Fresh meat and poultry' },
        { name: 'Bakery', slug: 'bakery', description: 'Freshly baked breads and pastries' },
        { name: 'Beverages', slug: 'beverages', description: 'Soft drinks, juices and other beverages' },
        { name: 'Snacks', slug: 'snacks', description: 'Chips, cookies and other snacks' },
        { name: 'Frozen', slug: 'frozen', description: 'Frozen foods and ice cream' },
        { name: 'Organic', slug: 'organic', description: 'Organic and natural products' }
      ];
      
      // Try to insert sample categories
      const { error: insertError } = await supabase
        .from('categories')
        .upsert(sampleCategories, { onConflict: 'name' });
      
      if (insertError) {
        console.log('Note: Categories table may not exist yet. Please create it first using the Supabase dashboard.');
      } else {
        console.log('Sample categories inserted successfully!');
      }
    } else {
      console.log('Categories table already exists.');
      
      // Check if we have any categories
      if (!data || data.length === 0) {
        console.log('No categories found. Inserting sample categories...');
        
        const sampleCategories = [
          { name: 'Vegetables', slug: 'vegetables', description: 'Fresh vegetables from local farms', is_active: true },
          { name: 'Fruits', slug: 'fruits', description: 'Seasonal fruits and berries', is_active: true },
          { name: 'Dairy', slug: 'dairy', description: 'Milk, cheese, yogurt and other dairy products', is_active: true },
          { name: 'Meat', slug: 'meat', description: 'Fresh meat and poultry', is_active: true },
          { name: 'Bakery', slug: 'bakery', description: 'Freshly baked breads and pastries', is_active: true },
          { name: 'Beverages', slug: 'beverages', description: 'Soft drinks, juices and other beverages', is_active: true },
          { name: 'Snacks', slug: 'snacks', description: 'Chips, cookies and other snacks', is_active: true },
          { name: 'Frozen', slug: 'frozen', description: 'Frozen foods and ice cream', is_active: true },
          { name: 'Organic', slug: 'organic', description: 'Organic and natural products', is_active: true }
        ];
        
        const { error: insertError } = await supabase
          .from('categories')
          .upsert(sampleCategories, { onConflict: 'name' });
        
        if (insertError) {
          console.error('Error inserting sample categories:', insertError);
        } else {
          console.log('Sample categories inserted successfully!');
        }
      } else {
        console.log(`Found ${data.length} existing categories.`);
      }
    }
  } catch (error) {
    console.error('Error setting up categories table:', error);
  }
}

setupCategoriesTable();