import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../../components/admin/ImageUpload';
import toast from '../../components/common/Toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiImage, FiRefreshCw, FiEye } from 'react-icons/fi';
import { useRealtime } from '../../hooks/useRealtime';
import { useSettings } from '../../contexts/SettingsContext';

interface Category {
  id?: string;
  name: string;
  slug?: string;
  count: number;
  image_url?: string;
  description?: string;
  is_active?: boolean;
}

// Add interface for Product
interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category: string;
  description?: string;
  stock: number;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image_url: ''
  });
  // Add state for viewing products in a category
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const { formatCurrency } = useSettings();

  useEffect(() => {
    loadCategories();
  }, []);

  // Real-time updates: listen to both categories table and products changes affecting counts
  useRealtime({
    table: 'categories',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: () => {
      loadCategories();
      toast.info('Categories updated');
      // Notify other parts of the application about category changes
      window.dispatchEvent(new CustomEvent('categoriesUpdated'));
    },
    channelName: 'categories-realtime'
  });
  
  useRealtime({
    table: 'products',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: () => {
      loadCategories();
      toast.info('Product changes detected');
      // Notify other parts of the application about product changes
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    },
    channelName: 'products-for-categories'
  });

  const loadCategories = async () => {
    try {
      setLoading(true);

      // First, get all categories from the categories table
      const { data: catRows, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      // Always get all product categories to ensure we show all categories that have products
      // Also get image_url from products to use as fallback for categories without images
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('category, image_url');

      if (productError) throw productError;

      // Create a map of all product categories with their counts and a sample image
      const productCategoryMap = new Map<string, { count: number; image_url?: string }>();
      products?.forEach(p => {
        if (p.category) {
          const existing = productCategoryMap.get(p.category) || { count: 0 };
          productCategoryMap.set(p.category, {
            count: existing.count + 1,
            image_url: existing.image_url || p.image_url // Use first found image as fallback
          });
        }
      });

      // If we have categories in the categories table, merge with product categories
      if (!catErr && catRows && catRows.length > 0) {
        // Create a set of category names from the categories table for quick lookup
        const categoryNames = new Set(catRows.map(row => row.name || ''));
        
        // Start with categories from the categories table
        const normalized = catRows.map(row => ({
          id: row.id,
          name: row.name || '',
          slug: row.slug,
          description: row.description,
          image_url: row.image_url,
          is_active: row.is_active,
          count: productCategoryMap.get(row.name || '')?.count || 0,
        })).filter(cat => cat.name);

        // Add any product categories that don't exist in the categories table
        Array.from(productCategoryMap.entries()).forEach(([categoryName, data]) => {
          if (!categoryNames.has(categoryName)) {
            normalized.push({
              id: undefined, // No ID since it's not in the categories table
              name: categoryName,
              slug: categoryName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, ''),
              description: undefined,
              image_url: data.image_url, // Use image from products as fallback
              is_active: true,
              count: data.count,
            });
          }
        });

        setCategories(normalized.sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        ));
        return;
      }

      // Fallback: if no categories table or error, group products by category
      const categoryMap = new Map<string, { count: number; image_url?: string }>();
      products?.forEach(product => {
        if (product.category) {
          const existing = categoryMap.get(product.category) || { count: 0 };
          categoryMap.set(product.category, {
            count: existing.count + 1,
            image_url: existing.image_url || product.image_url // Use image from products
          });
        }
      });
      
      const categoriesArray = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name: name || '',
        count: data.count,
        image_url: data.image_url
      })).filter(cat => cat.name);

      setCategories(categoriesArray.sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      ));
    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast.error(`Failed to load categories: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Add refresh function
  const handleRefresh = () => {
    loadCategories();
  };

  // Add function to load products for a specific category
  const loadCategoryProducts = async (category: Category) => {
    try {
      setLoadingProducts(true);
      setViewingCategory(category);
      
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category.name)
        .order('name', { ascending: true });

      if (error) throw error;
      
      setCategoryProducts(products || []);
    } catch (error: any) {
      console.error('Error loading category products:', error);
      toast.error(`Failed to load products for category: ${error.message || 'Unknown error'}`);
      setCategoryProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      // Generate slug from name
      const slug = newCategory.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Create category in categories table
      const { data, error: insertErr } = await supabase
        .from('categories')
        .insert([{
          name: newCategory.name.trim(),
          slug,
          description: newCategory.description,
          image_url: newCategory.image_url,
          is_active: true
        }])
        .select()
        .single();

      if (insertErr) {
        console.error('Error inserting category:', insertErr);
        toast.error(`Failed to create category: ${insertErr.message}`);
        return;
      }

      toast.success(`Category "${newCategory.name}" created successfully!`);
      setIsAddModalOpen(false);
      setNewCategory({ name: '', description: '', image_url: '' });
      
      // Reload categories to get updated data
      loadCategories();
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(`Failed to add category: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    // Validate category name
    if (!category.name || category.name.trim() === '') {
      toast.error('Category name is required');
      return;
    }

    const categoryName = category.name.trim();

    // If category has an ID, update the existing category
    if (category.id) {
      try {
        // Generate slug from name
        const slug = categoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // First update the category
        const { error: updErr } = await supabase
          .from('categories')
          .update({ 
            name: categoryName, // Allow name change
            slug, // Update slug when name changes
            image_url: category.image_url || null,
            description: category.description || null,
            is_active: category.is_active !== undefined ? category.is_active : true
          })
          .eq('id', category.id);
          
        if (updErr) {
          console.error('Error updating category:', updErr);
          const errorMessage = updErr && typeof updErr === 'object' && 'message' in updErr 
            ? (updErr as any).message 
            : 'Unknown error';
          toast.error(`Failed to update category: ${errorMessage}`);
          return;
        }
        
        // If the category name changed, we also need to update all products in this category
        if (category.name !== categoryName) {
          const { error: productUpdateError } = await supabase
            .from('products')
            .update({ category: categoryName })
            .eq('category', category.name);
            
          if (productUpdateError) {
            console.error('Error updating products with new category name:', productUpdateError);
            toast.error(`Category updated but failed to update products: ${productUpdateError?.message || 'Unknown error'}`);
            // We don't return here because the category update was successful
          }
        }
        
        toast.success('Category updated successfully!');
        setEditingCategory(null);
        
        // Reload categories to get updated data
        loadCategories();
      } catch (error: any) {
        console.error('Error updating category:', error);
        toast.error(`Failed to update category: ${error.message || 'Unknown error'}`);
      }
      return;
    }
    
    // If category doesn't have an ID, it was created from product data
    // We need to create a proper category record for it
    try {
      // Check if a category with this name already exists
      const { data: existingCategory, error: fetchError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .maybeSingle();

      // If category already exists, update it instead of creating a new one
      if (existingCategory && !fetchError) {
        // Generate slug from name
        const slug = categoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // First update the category
        const { error: updErr } = await supabase
          .from('categories')
          .update({ 
            name: categoryName, // Allow name change
            slug, // Update slug
            image_url: category.image_url || null,
            description: category.description || null,
            is_active: true
          })
          .eq('id', existingCategory.id);
          

        
        // If the category name changed, we also need to update all products in this category
        if (category.name !== categoryName) {
          const { error: productUpdateError } = await supabase
            .from('products')
            .update({ category: categoryName })
            .eq('category', category.name);
            
          if (productUpdateError) {
            console.error('Error updating products with new category name:', productUpdateError);
            toast.error(`Category updated but failed to update products: ${productUpdateError?.message || 'Unknown error'}`);
            // We don't return here because the category update was successful
          }
        }
          

        
        toast.success(`Category "${categoryName}" updated successfully!`);
        setEditingCategory(null);
        
        // Reload categories to get updated data
        loadCategories();
        return;
      }

      // Generate slug from name
      const slug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Create a new category record without specifying ID
      const newCategory = {
        name: categoryName,
        slug,
        description: category.description || null,
        image_url: category.image_url || null,
        is_active: true
      };

      const { data, error: insertErr } = await supabase
        .from('categories')
        .insert([newCategory])
        .select();

      if (insertErr) {
        console.error('Error creating category:', insertErr);
        toast.error(`Failed to create category: ${insertErr.message}`);
        return;
      }

      toast.success(`Category "${categoryName}" created successfully!`);
      setEditingCategory(null);
      
      // Reload categories to get updated data
      loadCategories();
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(`Failed to create category: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    // Check if category has an ID, if not, we can't delete it
    if (!categoryId) {
      toast.error('This category cannot be deleted because it was created from product data.');
      return;
    }
    
    const category = categories.find(c => c.id === categoryId);
    const productCount = category?.count || 0;
    
    if (!window.confirm(`Are you sure you want to delete the "${categoryName}" category? This will affect ${productCount} products.`)) {
      return;
    }

    try {
      // Delete from categories table
      const { error: delErr } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (delErr) {
        console.error('Error deleting category:', delErr);
        toast.error(`Failed to delete category: ${delErr.message}`);
        return;
      }

      toast.success('Category deleted successfully');
      
      // Reload categories to get updated data
      loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(`Failed to delete category: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <div>
            <Title>Categories Management</Title>
            <Subtitle>Organize your product categories</Subtitle>
          </div>
          <HeaderActions>
            <RefreshButton onClick={handleRefresh}>
              <FiRefreshCw />
              Refresh
            </RefreshButton>
            <AddButton onClick={() => setIsAddModalOpen(true)}>
              <FiPlus /> Add Category
            </AddButton>
          </HeaderActions>
        </Header>
        <LoadingState>
          <Spinner />
          <p>Loading categories...</p>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Categories Management</Title>
          <Subtitle>Organize your product categories</Subtitle>
        </div>
        <HeaderActions>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
            Refresh
          </RefreshButton>
          <AddButton onClick={() => setIsAddModalOpen(true)}>
            <FiPlus /> Add Category
          </AddButton>
        </HeaderActions>
      </Header>

      <CategoriesGrid>
        {categories.map((category) => (
          <CategoryCard key={category.id || category.name}>
            <CategoryImage>
              {category.image_url ? (
                <img src={category.image_url} alt={category.name} />
              ) : (
                <ImagePlaceholder>
                  <FiImage />
                </ImagePlaceholder>
              )}
            </CategoryImage>
            
            <CategoryContent>
              <CategoryName>{category.name}</CategoryName>
              <ProductCount>{category.count} products</ProductCount>
            </CategoryContent>

            <CategoryActions>
              <ActionButton 
                $color="#3498DB"
                onClick={() => setEditingCategory(category)}
              >
                <FiEdit2 />
              </ActionButton>
              <ActionButton 
                $color="#27AE60"
                onClick={() => loadCategoryProducts(category)}
              >
                <FiEye />
              </ActionButton>
              {category.id && (
                <ActionButton 
                  $color="#E74C3C"
                  onClick={() => handleDeleteCategory(category.id!, category.name)}
                >
                  <FiTrash2 />
                </ActionButton>
              )}
            </CategoryActions>
          </CategoryCard>
        ))}
      </CategoriesGrid>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <Modal onClick={() => setIsAddModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Add New Category</h2>
              <CloseButton onClick={() => setIsAddModalOpen(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGroup>
                <Label>Category Name *</Label>
                <Input
                  type="text"
                  placeholder="e.g., Vegetables, Fruits, Dairy"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  placeholder="Brief description of the category..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <Label>Category Image</Label>
                <ImageUpload
                  currentImageUrl={newCategory.image_url}
                  onImageUploaded={(url) => setNewCategory({ ...newCategory, image_url: url })}
                  label="Upload category image"
                  helpText="Recommended: 800x600px, JPG or PNG"
                />
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </CancelButton>
              <SaveButton onClick={handleAddCategory}>
                <FiSave /> Save Category
              </SaveButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <Modal onClick={() => setEditingCategory(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Edit Category</h2>
              <CloseButton onClick={() => setEditingCategory(null)}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGroup>
                <Label>Category Name</Label>
                <Input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
                <HelpText>
                  Changing the category name will update all products in this category.
                </HelpText>
              </FormGroup>

              <FormGroup>
                <Label>Category Image</Label>
                <ImageUpload
                  currentImageUrl={editingCategory.image_url}
                  onImageUploaded={(url) => setEditingCategory({ ...editingCategory, image_url: url })}
                  label="Update category image"
                  helpText="Recommended: 800x600px, JPG or PNG"
                />
              </FormGroup>

              <InfoBox>
                <strong>{editingCategory?.count || 0} products</strong> are in this category
              </InfoBox>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setEditingCategory(null)}>
                Cancel
              </CancelButton>
              <SaveButton onClick={async () => {
                if (editingCategory) {
                  handleUpdateCategory(editingCategory);
                }
              }}>
                <FiSave /> Update Category
              </SaveButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* View Category Products Modal */}
      {viewingCategory && (
        <Modal onClick={() => setViewingCategory(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Products in "{viewingCategory.name}"</h2>
              <CloseButton onClick={() => setViewingCategory(null)}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              {loadingProducts ? (
                <LoadingState>
                  <Spinner />
                  <p>Loading products...</p>
                </LoadingState>
              ) : categoryProducts.length === 0 ? (
                <p>No products found in this category.</p>
              ) : (
                <ProductsGrid>
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id}>
                      <ProductImage>
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} />
                        ) : (
                          <ImagePlaceholder>
                            <FiImage />
                          </ImagePlaceholder>
                        )}
                      </ProductImage>
                      <ProductInfo>
                        <ProductName>{product.name}</ProductName>
                        <ProductPrice>{formatCurrency(product.price)}</ProductPrice>
                        <ProductStock>In Stock: {product.stock}</ProductStock>
                      </ProductInfo>
                    </ProductCard>
                  ))}
                </ProductsGrid>
              )}
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setViewingCategory(null)}>
                Close
              </CancelButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Categories;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
  color: #636E72;
  font-size: 1rem;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    border-color: #6C9A7F;
    color: #6C9A7F;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: #5A8470;
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CategoryCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
  
  @media (max-width: 480px) {
    &:hover {
      transform: none; /* Disable hover effect on mobile */
    }
  }
`;

const CategoryImage = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }
  
  @media (max-width: 480px) {
    height: 150px;
    
    &:hover img {
      transform: none; /* Disable hover effect on mobile */
    }
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  color: #999;

  svg {
    font-size: 3rem;
  }
  
  @media (max-width: 480px) {
    svg {
      font-size: 2rem;
    }
  }
`;

const CategoryContent = styled.div`
  padding: 1.25rem;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const CategoryName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const ProductCount = styled.p`
  color: #636E72;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0 1.25rem 1.25rem 1.25rem;
  
  @media (max-width: 480px) {
    padding: 0 1rem 1rem 1rem;
  }
`;

const ActionButton = styled.button<{ $color: string }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ $color }) => $color};
    color: white;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;

  p {
    margin-top: 1rem;
    color: #636E72;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
    
    p {
      font-size: 0.9rem;
    }
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6C9A7F;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    align-items: flex-start;
    overflow-y: auto;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: 480px) {
    max-height: 100vh;
    border-radius: 12px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #DFE6E9;

  h2 {
    font-size: 1.5rem;
    color: #2D3436;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    
    h2 {
      font-size: 1.25rem;
    }
  }
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: #F8F9FA;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  color: #636E72;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: #DFE6E9;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #DFE6E9;
  justify-content: flex-end;
  
  @media (max-width: 480px) {
    padding: 1rem;
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2D3436;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #DFE6E9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #6C9A7F;
  }

  &:disabled {
    background: #F8F9FA;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #DFE6E9;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #6C9A7F;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
`;

const HelpText = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #636E72;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const InfoBox = styled.div`
  padding: 1rem;
  background: #E8F4F8;
  border-left: 4px solid #3498DB;
  border-radius: 4px;
  margin-top: 1rem;
  color: #2D3436;
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  color: #636E72;
  border: 2px solid #DFE6E9;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #F8F9FA;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #5A8470;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

// Product Grid and Card Styles
const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
  
  @media (max-width: 480px) {
    &:hover {
      transform: none;
    }
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }
  
  @media (max-width: 480px) {
    height: 150px;
    
    &:hover img {
      transform: none;
    }
  }
`;

const ProductInfo = styled.div`
  padding: 1.25rem;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ProductName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const ProductPrice = styled.p`
  color: #6C9A7F;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const ProductStock = styled.p`
  color: #636E72;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;
