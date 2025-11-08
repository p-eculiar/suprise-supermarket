const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupNavigationTable() {
  try {
    console.log('Setting up navigation_items table...');
    
    // Since we can't use execute_sql, we'll need to run the SQL commands manually
    // Let's first check if the table exists by trying to select from it
    const { data, error } = await supabase
      .from('navigation_items')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('relation "navigation_items" does not exist')) {
      console.log('Navigation table does not exist. Please create it manually in the Supabase dashboard:');
      console.log(`
        CREATE TABLE navigation_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          href TEXT NOT NULL,
          order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_navigation_items_order ON navigation_items(order);
        CREATE INDEX idx_navigation_items_active ON navigation_items(is_active);
        
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER update_navigation_items_updated_at 
          BEFORE UPDATE ON navigation_items
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
          
        INSERT INTO navigation_items (name, href, order, is_active) VALUES
          ('Home', '/', 1, true),
          ('Services', '/services', 2, true),
          ('About Us', '/about', 3, true),
          ('Categories', '/products', 4, true),
          ('Blog', '/blog', 5, true),
          ('Diaspora Gifting', '/diaspora-gifting', 6, true),
          ('Contact', '/contact', 7, true);
      `);
    } else {
      console.log('Navigation table already exists or is accessible.');
      
      // Check if we have any data
      const { data: items, error: itemsError } = await supabase
        .from('navigation_items')
        .select('*')
        .limit(1);
      
      if (itemsError) {
        console.error('Error checking navigation items:', itemsError);
      } else if (items && items.length === 0) {
        console.log('No navigation items found. Inserting default items...');
        
        // Insert default navigation items
        const { error: insertError } = await supabase
          .from('navigation_items')
          .insert([
            { name: 'Home', href: '/', order: 1, is_active: true },
            { name: 'Services', href: '/services', order: 2, is_active: true },
            { name: 'About Us', href: '/about', order: 3, is_active: true },
            { name: 'Categories', href: '/products', order: 4, is_active: true },
            { name: 'Blog', href: '/blog', order: 5, is_active: true },
            { name: 'Diaspora Gifting', href: '/diaspora-gifting', order: 6, is_active: true },
            { name: 'Contact', href: '/contact', order: 7, is_active: true }
          ]);
        
        if (insertError) {
          console.error('Error inserting default navigation items:', insertError);
        } else {
          console.log('Default navigation items inserted successfully!');
        }
      } else {
        console.log(`Found ${items ? items.length : 0} navigation items.`);
      }
    }
    
    console.log('Navigation setup completed!');
  } catch (error) {
    console.error('Error setting up navigation table:', error);
  }
}

setupNavigationTable();