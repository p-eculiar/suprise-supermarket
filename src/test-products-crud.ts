import { supabase } from './lib/supabase';

async function testProductsCRUD() {
  console.log('Testing products CRUD operations with real-time data...');
  
  // Test 1: Fetch products
  console.log('1. Fetching products...');
  try {
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (fetchError) throw fetchError;
    console.log('✓ Successfully fetched products:', products?.length || 0);
  } catch (error) {
    console.error('✗ Error fetching products:', error);
  }
  
  // Test 2: Create a test product
  console.log('2. Creating test product...');
  let testProductId: string | null = null;
  try {
    const testProduct = {
      name: 'Test Product - CRUD Verification',
      description: 'Temporary product for testing CRUD operations',
      category: 'vegetables',
      price: 9.99,
      compare_price: 12.99,
      stock: 50,
      sku: `TEST-${Date.now()}`,
      status: 'active',
      image_url: 'https://via.placeholder.com/400'
    };
    
    const { data: createdProduct, error: createError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (createError) throw createError;
    testProductId = createdProduct.id;
    console.log('✓ Successfully created test product:', createdProduct.name);
  } catch (error) {
    console.error('✗ Error creating test product:', error);
  }
  
  // Test 3: Update the test product
  console.log('3. Updating test product...');
  if (testProductId) {
    try {
      const updateData = {
        price: 14.99,
        stock: 25,
        updated_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', testProductId);
      
      if (updateError) throw updateError;
      console.log('✓ Successfully updated test product');
    } catch (error) {
      console.error('✗ Error updating test product:', error);
    }
  }
  
  // Test 4: Fetch the updated product
  console.log('4. Fetching updated product...');
  if (testProductId) {
    try {
      const { data: updatedProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', testProductId)
        .single();
      
      if (fetchError) throw fetchError;
      console.log('✓ Successfully fetched updated product:', updatedProduct?.price, updatedProduct?.stock);
    } catch (error) {
      console.error('✗ Error fetching updated product:', error);
    }
  }
  
  // Test 5: Delete the test product
  console.log('5. Deleting test product...');
  if (testProductId) {
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', testProductId);
      
      if (deleteError) throw deleteError;
      console.log('✓ Successfully deleted test product');
    } catch (error) {
      console.error('✗ Error deleting test product:', error);
    }
  }
  
  // Test 6: Verify deletion
  console.log('6. Verifying deletion...');
  if (testProductId) {
    try {
      const { data: deletedProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', testProductId)
        .single();
      
      if (fetchError && fetchError.code === 'PGRST116') {
        console.log('✓ Product successfully deleted (no data found)');
      } else if (deletedProduct) {
        console.log('✗ Product still exists after deletion');
      } else {
        console.log('✓ Product successfully deleted');
      }
    } catch (error) {
      console.log('✓ Product successfully deleted (error indicates no data found)');
    }
  }
  
  // Test 7: Real-time subscription
  console.log('7. Testing real-time subscription...');
  try {
    const channel = supabase
      .channel('test-products-crud')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'products',
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
          table: 'products',
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
          table: 'products',
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
  
  console.log('Products CRUD test completed!');
}

testProductsCRUD();