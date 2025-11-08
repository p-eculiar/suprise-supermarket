import { supabase } from './lib/supabase';

async function testCategoriesCRUD() {
  console.log('Testing categories CRUD operations with real-time data...');
  
  // Test 1: Fetch categories
  console.log('1. Fetching categories...');
  try {
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (fetchError) throw fetchError;
    console.log('✓ Successfully fetched categories:', categories?.length || 0);
  } catch (error) {
    console.error('✗ Error fetching categories:', error);
  }
  
  // Test 2: Create a test category
  console.log('2. Creating test category...');
  let testCategoryId: string | null = null;
  try {
    const slug = `test-category-${Date.now()}`;
    const testCategory = {
      name: 'Test Category - CRUD Verification',
      slug: slug,
      description: 'Temporary category for testing CRUD operations',
      is_active: true
    };
    
    const { data: createdCategory, error: createError } = await supabase
      .from('categories')
      .insert([testCategory])
      .select()
      .single();
    
    if (createError) throw createError;
    testCategoryId = createdCategory.id;
    console.log('✓ Successfully created test category:', createdCategory.name);
  } catch (error) {
    console.error('✗ Error creating test category:', error);
  }
  
  // Test 3: Update the test category
  console.log('3. Updating test category...');
  if (testCategoryId) {
    try {
      const updateData = {
        description: 'Updated description for testing',
        is_active: false
      };
      
      const { error: updateError } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', testCategoryId);
      
      if (updateError) throw updateError;
      console.log('✓ Successfully updated test category');
    } catch (error) {
      console.error('✗ Error updating test category:', error);
    }
  }
  
  // Test 4: Fetch the updated category
  console.log('4. Fetching updated category...');
  if (testCategoryId) {
    try {
      const { data: updatedCategory, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', testCategoryId)
        .single();
      
      if (fetchError) throw fetchError;
      console.log('✓ Successfully fetched updated category:', updatedCategory?.description, updatedCategory?.is_active);
    } catch (error) {
      console.error('✗ Error fetching updated category:', error);
    }
  }
  
  // Test 5: Delete the test category
  console.log('5. Deleting test category...');
  if (testCategoryId) {
    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', testCategoryId);
      
      if (deleteError) throw deleteError;
      console.log('✓ Successfully deleted test category');
    } catch (error) {
      console.error('✗ Error deleting test category:', error);
    }
  }
  
  // Test 6: Verify deletion
  console.log('6. Verifying deletion...');
  if (testCategoryId) {
    try {
      const { data: deletedCategory, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', testCategoryId)
        .single();
      
      if (fetchError && fetchError.code === 'PGRST116') {
        console.log('✓ Category successfully deleted (no data found)');
      } else if (deletedCategory) {
        console.log('✗ Category still exists after deletion');
      } else {
        console.log('✓ Category successfully deleted');
      }
    } catch (error) {
      console.log('✓ Category successfully deleted (error indicates no data found)');
    }
  }
  
  // Test 7: Real-time subscription
  console.log('7. Testing real-time subscription...');
  try {
    const channel = supabase
      .channel('test-categories-crud')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'categories',
        },
        (payload) => {
          console.log('✓ Real-time INSERT event received:', payload.new?.name);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'categories',
        },
        (payload) => {
          console.log('✓ Real-time UPDATE event received:', payload.new?.name);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'categories',
        },
        (payload) => {
          console.log('✓ Real-time DELETE event received:', payload.old?.id);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });
    
    // Keep the subscription alive for a moment
    setTimeout(() => {
      supabase.removeChannel(channel);
      console.log('Real-time subscription test completed');
    }, 5000);
    
  } catch (error) {
    console.error('✗ Error with real-time subscription:', error);
  }
  
  console.log('Categories CRUD test completed!');
}

testCategoriesCRUD();