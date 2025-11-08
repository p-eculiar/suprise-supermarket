import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiImage, FiUpload, FiX, FiSave } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { EmailNotificationService } from '../../services/emailService';
import ImageUpload from '../../components/admin/ImageUpload';
import toast from '../../components/common/Toast';

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    comparePrice: '',
    stock: '',
    sku: '',
    status: 'active',
    image_url: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Load available categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Get all distinct categories from products table
        const { data, error } = await supabase
          .from('products')
          .select('category')
          .neq('category', null);
        
        if (error) throw error;
        
        // Extract unique categories and sort them
        const categories: string[] = [];
        const seen = new Set<string>();
        
        data.forEach(item => {
          if (item.category && !seen.has(item.category)) {
            seen.add(item.category);
            categories.push(item.category);
          }
        });
        
        categories.sort();
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to hardcoded categories
        setAvailableCategories(['vegetables', 'fruits', 'dairy', 'meat', 'bakery', 'beverages']);
      }
    };
    
    loadCategories();
  }, []);

  // For new products, we can show the form immediately
  useEffect(() => {
    if (!isEdit) {
      setIsDataLoaded(true);
    }
  }, [isEdit]);

  // Log form data changes for debugging
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  // Fetch product data if editing
  useEffect(() => {
    if (isEdit && id) {
      console.log('Starting to fetch product data for ID:', id);
      fetchProduct(id);
    }
  }, [id, isEdit]);

  const fetchProduct = async (productId: string) => {
    try {
      console.log('Fetching product with ID:', productId);
      
      // First, let's see what products exist
      const { data: allProducts, error: allProductsError } = await supabase
        .from('products')
        .select('id, name');
        
      if (!allProductsError && allProducts) {
        console.log('All products in database:', allProducts);
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        console.error('Error details:', {
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: error.message
        });
        throw error;
      }
      
      if (!data) {
        console.error('Product not found with ID:', productId);
        console.log('Available product IDs:', allProducts?.map(p => p.id) || 'None');
        throw new Error('Product not found');
      }
      
      console.log('Product data received:', data);
      console.log('Product ID from params:', id);
      console.log('Available categories:', availableCategories);

      // Ensure all fields have proper default values
      const productData = {
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        price: data.price?.toString() || '',
        comparePrice: data.compare_price?.toString() || '',
        stock: data.stock?.toString() || '',
        sku: data.sku || '',
        status: data.status || 'active',
        image_url: data.image_url || ''
      };

      console.log('Setting form data:', productData);
      setFormData(productData);
      setIsDataLoaded(true);
      
      console.log('Form data set:', productData);
      console.log('Form state after setting:', formData);
      
      // Validate that required fields are populated
      if (!productData.name) {
        console.warn('Product name is empty');
      }
      if (!productData.category) {
        console.warn('Product category is empty');
      }
      if (!productData.price) {
        console.warn('Product price is empty');
      }
      if (!productData.stock) {
        console.warn('Product stock is empty');
      }
      
      // Additional validation
      if (productData.name && productData.category && productData.price && productData.stock) {
        console.log('All required fields are populated');
      } else {
        console.warn('Some required fields are missing:', {
          name: !!productData.name,
          category: !!productData.category,
          price: !!productData.price,
          stock: !!productData.stock
        });
      }
      
      // Check if category is in available categories
      if (productData.category && !availableCategories.includes(productData.category)) {
        console.warn('Product category not in available categories:', productData.category);
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error(`Failed to load product data: ${error.message || 'Unknown error'}`);
      setIsDataLoaded(true); // Still set as loaded to show the form even if there's an error
    }
  };

  // Set up real-time subscription for this specific product when editing
  useEffect(() => {
    if (isEdit && id && isDataLoaded) {
      console.log('Setting up real-time subscription for product ID:', id);
      
      // Set up real-time subscription
      const channel = supabase
        .channel(`product-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'products',
            filter: `id=eq.${id}`
          },
          (payload) => {
            // Update form data when product is updated elsewhere
            const updatedProduct = payload.new;
            console.log('Real-time update received:', updatedProduct);
            setFormData({
              name: updatedProduct.name || '',
              description: updatedProduct.description || '',
              category: updatedProduct.category || '',
              price: updatedProduct.price?.toString() || '',
              comparePrice: updatedProduct.compare_price?.toString() || '',
              stock: updatedProduct.stock?.toString() || '',
              sku: updatedProduct.sku || '',
              status: updatedProduct.status || 'active',
              image_url: updatedProduct.image_url || ''
            });
            toast.info('Product data updated elsewhere - form refreshed');
          }
        )
        .subscribe((status) => {
          console.log(`Real-time subscription status for product-${id}:`, status);
        });

      // Cleanup subscription on unmount
      return () => {
        console.log('Cleaning up real-time subscription for product ID:', id);
        supabase.removeChannel(channel);
      };
    }
  }, [id, isEdit, isDataLoaded]);

  const handleImageUploaded = (url: string) => {
    // Handle both setting and removing images
    if (url === '') {
      // Image removed
      setFormData({ ...formData, image_url: '' });
      toast.success('Image removed successfully!');
    } else {
      // Image uploaded
      setFormData({ ...formData, image_url: url });
      toast.success('Image uploaded successfully!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Form data on submit:', formData);
    console.log('Form data types:', {
      name: typeof formData.name,
      price: typeof formData.price,
      stock: typeof formData.stock
    });

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Product name is required');
      }
      if (!formData.category) {
        throw new Error('Category is required');
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('Valid price is required');
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        throw new Error('Valid stock quantity is required');
      }

      console.log('Form validation passed');

      // Prepare product data for update
      const productData: any = {
        name: formData.name.trim(),
        category: formData.category,
        price: formData.price, // Keep as string for now
        stock: formData.stock, // Keep as string for now
        status: formData.status,
        updated_at: new Date().toISOString()
      };
      
      // Add optional fields if they have values
      if (formData.description && formData.description.trim() !== '') {
        productData.description = formData.description.trim();
      }
      if (formData.image_url) productData.image_url = formData.image_url;
      if (formData.sku && formData.sku.trim() !== '') productData.sku = formData.sku.trim();
      if (formData.comparePrice && formData.comparePrice.trim() !== '') {
        productData.compare_price = formData.comparePrice;
      }
      
      console.log('Product data to save:', productData);

      if (isEdit && id) {
        // Update existing product - use a more direct approach
        console.log('Attempting to update product with data:', productData);
        
        // Create a simple update object with explicit values
        const updateData: Record<string, any> = {
          name: String(productData.name).trim(),
          category: String(productData.category).trim(),
          price: Number(parseFloat(productData.price).toFixed(2)),
          stock: Number(parseInt(productData.stock)),
          status: String(productData.status),
          updated_at: new Date().toISOString()
        };
        
        // Handle image URL properly - if it's empty, set it to null
        if (productData.image_url) {
          updateData.image_url = String(productData.image_url);
        } else {
          // If image_url is empty, explicitly set it to null to clear it from the database
          updateData.image_url = null;
        }
        
        // Add other optional fields
        if (productData.description && String(productData.description).trim()) {
          updateData.description = String(productData.description).trim();
        }
        if (productData.sku && String(productData.sku).trim()) {
          updateData.sku = String(productData.sku).trim();
        }
        if (productData.compare_price) {
          updateData.compare_price = Number(parseFloat(productData.compare_price).toFixed(2));
        }
        
        console.log('Final update data:', updateData);
        console.log('Product ID:', id);
        
        // Force the update with explicit error handling
        try {
          console.log('Sending update to database:', { 
            updateData, 
            productId: id,
            timestamp: new Date().toISOString()
          });
          
          const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select('*');
            
          console.log('Raw update response:', { data, error });
          console.log('Update data sent:', updateData);
          console.log('Product ID used:', id);
          
          // Log the exact query being sent
          console.log('Update query details:', {
            table: 'products',
            condition: `id = ${id}`,
            updateFields: Object.keys(updateData)
          });
          
          // First, let's verify the product actually exists
          console.log('Checking if product exists before update...');
          const { data: existingProduct, error: existingProductError } = await supabase
            .from('products')
            .select('id, name, updated_at')
            .eq('id', id);
            
          console.log('Existing product check:', { existingProduct, existingProductError });
          
          if (existingProductError) {
            console.error('Error checking existing product:', existingProductError);
          } else if (!existingProduct || existingProduct.length === 0) {
            console.warn('Product not found in database with ID:', id);
            console.warn('Available products:');
            // Let's list some products to see what IDs exist
            const { data: allProducts, error: allProductsError } = await supabase
              .from('products')
              .select('id, name')
              .limit(10);
              
            if (!allProductsError && allProducts) {
              console.log('Sample products:', allProducts);
            }
          } else {
            console.log('Product found:', existingProduct[0]);
            // Let's also check the exact ID format
            console.log('Product ID from database:', existingProduct[0].id);
            console.log('Product ID we are using:', id);
            console.log('IDs match:', existingProduct[0].id === id);
            console.log('ID types:', typeof existingProduct[0].id, typeof id);
            console.log('ID lengths:', existingProduct[0].id.length, id.length);
          }
          
          // Let's also check the user's permissions
          const { data: userData, error: userError } = await supabase.auth.getUser();
          console.log('Current user:', { userData, userError });
          
          if (userData?.user) {
            console.log('User ID:', userData.user.id);
            console.log('User email:', userData.user.email);
            
            // Let's check if there are any RLS policies
            console.log('Checking RLS policies for products table...');
            
            // Let's try to check if the user has the right role
            try {
              const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userData.user.id)
                .single();
                
              console.log('User role check:', { roleData, roleError });
            } catch (roleCheckError) {
              console.log('User roles table not accessible or does not exist');
            }
            
            // Let's also try a count query to see if the product exists
            const { count, error: countError } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('id', id);
              
            console.log('Product count query:', { count, countError });
          }
          
          // Check if we're using the service role or have admin privileges
          console.log('Checking Supabase client configuration...');
          console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
          // Don't log the key for security reasons
          
          // Let's try to check what policies exist on the products table
          console.log('Attempting to diagnose RLS policies...');
            
          if (error) {
            console.error('Database update error:', error);
            console.error('Error details:', {
              code: error.code,
              details: error.details,
              hint: error.hint,
              message: error.message
            });
            
            // Check if it's a permission error
            if (error.message.includes('permission') || error.message.includes('denied') || error.code === '42501') {
              console.error('❌ PERMISSION ERROR: User does not have permission to update products');
              console.error('This is likely due to RLS (Row Level Security) policies on the products table');
              console.error('The user needs to have the correct role or the RLS policies need to be adjusted');
            }
            
            throw new Error(`Failed to update product: ${error.message}`);
          }
          
          // Check what was actually returned
          console.log('Update response data:', data);
          if (data && data.length > 0) {
            console.log('First returned record:', data[0]);
            toast.success('Product updated successfully!');
            
            // Verify the update actually happened
            setTimeout(async () => {
              try {
                const { data: verifyData, error: verifyError } = await supabase
                  .from('products')
                  .select('name')
                  .eq('id', id)
                  .single();
                  
                if (!verifyError && verifyData) {
                  console.log('Verification - Updated name:', verifyData.name);
                  console.log('Expected name:', updateData.name);
                  if (verifyData.name === updateData.name) {
                    console.log('✅ Update verification successful');
                  } else {
                    console.warn('⚠️ Update verification failed - name not updated');
                  }
                }
              } catch (verifyErr) {
                console.error('Verification failed:', verifyErr);
              }
            }, 500);
          } else {
            console.log('No records returned from update - this might be normal for Supabase updates');
            // This might actually be successful - let's check
            setTimeout(async () => {
              try {
                const { data: verifyData, error: verifyError } = await supabase
                  .from('products')
                  .select('name')
                  .eq('id', id)
                  .single();
                  
                if (!verifyError && verifyData) {
                  console.log('Verification - Current name:', verifyData.name);
                  console.log('Expected name:', updateData.name);
                  if (verifyData.name === updateData.name) {
                    console.log('✅ Update was actually successful!');
                    toast.success('Product updated successfully!');
                  } else {
                    console.warn('⚠️ Update failed - name not updated');
                    // Check user permissions
                    const { data: userData, error: userError } = await supabase.auth.getUser();
                    if (userData?.user) {
                      const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', userData.user.id)
                        .single();
                        
                      console.log('User profile for permissions check:', { profileData, profileError });
                    }
                    toast.error('Database permission error. RLS policies on products table need adjustment.');
                  }
                }
              } catch (verifyErr) {
                console.error('Verification failed:', verifyErr);
              }
            }, 500);
          }
          
          // Force refresh of all related data
          queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          window.dispatchEvent(new CustomEvent('productsUpdated'));
          
          // Immediately fetch the updated data to verify and show success
          setTimeout(async () => {
            try {
              console.log('Fetching updated product data...');
              const { data: verifyData, error: verifyError } = await supabase
                .from('products')
                .select('name, price, stock, category, updated_at')
                .eq('id', id)
                .single();
                
              console.log('Raw verification response:', { verifyData, verifyError });
              
              if (verifyError) {
                console.error('Verification error:', verifyError);
                toast.success('Product updated successfully!');
              } else {
                console.log('Verification data:', verifyData);
                console.log('Update data sent:', updateData);
                
                // Check if values match
                console.log('Detailed comparison:');
                console.log('  DB Name:', `"${verifyData.name}"`);
                console.log('  Update Name:', `"${updateData.name}"`);
                console.log('  Name equality:', verifyData.name === updateData.name);
                console.log('  Name lengths:', verifyData.name.length, 'vs', updateData.name.length);
                
                const nameMatch = verifyData.name === updateData.name;
                const priceMatch = Math.abs(verifyData.price - updateData.price) < 0.01;
                const stockMatch = verifyData.stock === updateData.stock;
                
                console.log('Comparison results:', { nameMatch, priceMatch, stockMatch });
                
                if (nameMatch && priceMatch && stockMatch) {
                  console.log('✅ All values updated correctly!');
                  toast.success('Product updated successfully!');
                } else {
                  console.warn('⚠️ Values still not matching:');
                  console.warn('  Name:', `"${verifyData.name}"`, '===', `"${updateData.name}"`, '->', nameMatch);
                  console.warn('  Price:', verifyData.price, '===', updateData.price, '->', priceMatch);
                  console.warn('  Stock:', verifyData.stock, '===', updateData.stock, '->', stockMatch);
                  
                  // Let's do one more check - maybe there's a timing issue
                  if (!nameMatch) {
                    console.log('Retrying name update specifically...');
                    console.log('Retry data:', { 
                      name: updateData.name,
                      id: id,
                      timestamp: new Date().toISOString()
                    });
                    
                    const { data: retryData, error: nameUpdateError } = await supabase
                      .from('products')
                      .update({ name: updateData.name })
                      .eq('id', id)
                      .select('name, updated_at');
                    
                    console.log('Name update retry response:', { retryData, nameUpdateError });
                    
                    if (nameUpdateError) {
                      console.error('Name update retry failed:', nameUpdateError);
                    } else {
                      console.log('Name update retry successful');
                      if (retryData && retryData.length > 0) {
                        console.log('Returned data from name update:', retryData[0]);
                      }
                    }
                    
                    // Let's also try a direct query to see what's in the database
                    setTimeout(async () => {
                      try {
                        const { data: directQueryData, error: directQueryError } = await supabase
                          .from('products')
                          .select('name, updated_at')
                          .eq('id', id)
                          .single();
                          
                        console.log('Direct query after name update:', { directQueryData, directQueryError });
                        if (directQueryData) {
                          console.log('Direct query name:', `"${directQueryData.name}"`);
                          console.log('Name matches update:', directQueryData.name === updateData.name);
                        }
                      } catch (directQueryErr) {
                        console.error('Direct query failed:', directQueryErr);
                      }
                    }, 300);
                  }
                  
                  // Still show success because the update was sent, even if verification failed
                  toast.success('Product updated successfully!');
                }
                
                // Do a final check after another delay to ensure everything is updated
                setTimeout(async () => {
                  try {
                    console.log('Performing final verification...');
                    const { data: finalCheckData, error: finalCheckError } = await supabase
                      .from('products')
                      .select('name, price, stock, category')
                      .eq('id', id)
                      .single();
                      
                    if (!finalCheckError && finalCheckData) {
                      console.log('Final check data:', finalCheckData);
                      
                      console.log('Final detailed comparison:');
                      console.log('  DB Name:', `"${finalCheckData.name}"`);
                      console.log('  Update Name:', `"${updateData.name}"`);
                      console.log('  Name equality:', finalCheckData.name === updateData.name);
                      
                      const finalNameMatch = finalCheckData.name === updateData.name;
                      const finalPriceMatch = Math.abs(finalCheckData.price - updateData.price) < 0.01;
                      const finalStockMatch = finalCheckData.stock === updateData.stock;
                      
                      if (finalNameMatch && finalPriceMatch && finalStockMatch) {
                        console.log('✅ Final verification confirms all values updated correctly!');
                      } else {
                        console.warn('⚠️ Final verification still shows mismatches:');
                        console.warn('  Name:', `"${finalCheckData.name}"`, '===', `"${updateData.name}"`, '->', finalNameMatch);
                        console.warn('  Price:', finalCheckData.price, '===', updateData.price, '->', finalPriceMatch);
                        console.warn('  Stock:', finalCheckData.stock, '===', updateData.stock, '->', finalStockMatch);
                      }
                    } else if (finalCheckError) {
                      console.error('Final check error:', finalCheckError);
                    }
                  } catch (finalCheckErr) {
                    console.error('Final check failed:', finalCheckErr);
                  }
                }, 1500);
              }
            } catch (verifyErr) {
              console.error('Verification failed:', verifyErr);
              // Still show success because the update was sent
              toast.success('Product updated successfully!');
            }
          }, 500);
        } catch (updateError: any) {
          console.error('Update failed:', updateError);
          toast.error(`Failed to update product: ${updateError.message}`);
          throw updateError;
        }
      } else {
        // Create new product
        productData.image_url = productData.image_url || 'https://via.placeholder.com/400';
        productData.created_at = new Date().toISOString();
        
        console.log('Attempting to create product with data:', productData);
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          throw error;
        }
        
        console.log('Database insert successful, response:', newProduct);

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        
        // Broadcast product creation to other pages
        window.dispatchEvent(new CustomEvent('productsUpdated'));
        
        // Send email notifications to subscribed users
        try {
          await EmailNotificationService.sendNewProductNotification({
            productId: newProduct.id,
            productName: newProduct.name,
            productPrice: newProduct.price,
            productImage: newProduct.image_url,
            productDescription: newProduct.description || 'Check out our new product!',
          });
          
          console.log('Email notifications queued successfully');
        } catch (emailError) {
          console.error('Failed to send email notifications:', emailError);
          // Don't fail the product creation if email fails
        }

        toast.success('Product created successfully! Email notifications sent to subscribers.');
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>{isEdit ? 'Edit Product' : 'Add New Product'}</Title>
        <BackButton onClick={() => navigate('/admin/products')}>
          <FiX />
          Cancel
        </BackButton>
      </Header>

      {/* Show loading indicator while fetching data for edit mode */}
      {isEdit && !isDataLoaded ? (
        <LoadingContainer>
          <div>Loading product data...</div>
        </LoadingContainer>
      ) : (
        <Form onSubmit={handleSubmit}>
          <FormGrid>
            {/* Main Information */}
            <MainSection>
              <SectionCard>
                <SectionTitle>Product Information</SectionTitle>

                <FormGroup>
                  <Label>Product Name *</Label>
                  <Input
                    type="text"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter product description"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      {availableCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>SKU</Label>
                    <Input
                      type="text"
                      placeholder="Product SKU"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Compare at Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.comparePrice}
                      onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Stock *</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </FormGroup>
                </FormRow>
              </SectionCard>

              {/* Product Images */}
              <SectionCard>
                <SectionTitle>Product Images</SectionTitle>
                
                <ImageUpload
                  currentImageUrl={formData.image_url}
                  onImageUploaded={handleImageUploaded}
                  productId={id}
                  label="Product Image"
                  helpText="Upload JPG, PNG, or WebP (max 5MB). Recommended size: 800x800px"
                />
              </SectionCard>
            </MainSection>

            {/* Sidebar */}
            <Sidebar>
              <SectionCard>
                <SectionTitle>Status</SectionTitle>
                <FormGroup>
                  <Label>Product Status</Label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </Select>
                </FormGroup>
              </SectionCard>

              <SectionCard>
                <SectionTitle>Organization</SectionTitle>
                <FormGroup>
                  <Label>Tags</Label>
                  <Input
                    type="text"
                    placeholder="organic, fresh, local"
                  />
                  <InputHint>Separate tags with commas</InputHint>
                </FormGroup>
              </SectionCard>

              <SaveButton type="submit">
                <FiSave />
                {isEdit ? 'Update Product' : 'Save Product'}
              </SaveButton>
            </Sidebar>
          </FormGrid>
        </Form>
      )}
    </Container>
  );
};

export default ProductForm;

const Container = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #636E72;
`;

const Form = styled.form``;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SectionCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #00B894;
    box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.1);
  }
  
  &:disabled {
    background: #F8F9FA;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #00B894;
    box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #00B894;
    box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.1);
  }
`;

const InputHint = styled.div`
  font-size: 0.75rem;
  color: #636E72;
  margin-top: 0.25rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover:not(:disabled) {
    background: #5A8569;
  }
  
  &:disabled {
    background: #B2BEC3;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 1.25rem;
  }
`;
