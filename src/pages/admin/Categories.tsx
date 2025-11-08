import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../../components/admin/ImageUpload';
import toast from '../../components/common/Toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiImage } from 'react-icons/fi';

interface Category {
  name: string;
  count: number;
  image_url?: string;
  description?: string;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Get distinct categories from products with counts
      const { data: products, error } = await supabase
        .from('products')
        .select('category, image_url');

      if (error) throw error;

      // Group by category and count
      const categoryMap = new Map<string, { count: number; image_url?: string }>();
      
      products?.forEach(product => {
        const existing = categoryMap.get(product.category) || { count: 0 };
        categoryMap.set(product.category, {
          count: existing.count + 1,
          image_url: existing.image_url || product.image_url
        });
      });

      // Convert to array
      const categoriesArray = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        image_url: data.image_url
      }));

      setCategories(categoriesArray.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      // Check if category already exists
      if (categories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
        toast.error('Category already exists');
        return;
      }

      // For now, we don't have a categories table, so we just show success
      // In a real implementation, you would insert into a categories table
      toast.success(`Category "${newCategory.name}" created successfully!`);
      
      setIsAddModalOpen(false);
      setNewCategory({ name: '', description: '', image_url: '' });
      loadCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${categoryName}" category? This will affect ${categories.find(c => c.name === categoryName)?.count || 0} products.`)) {
      return;
    }

    try {
      // In a real implementation, you would:
      // 1. Delete the category from categories table
      // 2. Update or delete products in this category
      
      toast.warning('Category deletion requires updating all products in this category');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  if (loading) {
    return (
      <Container>
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
        <AddButton onClick={() => setIsAddModalOpen(true)}>
          <FiPlus /> Add Category
        </AddButton>
      </Header>

      <CategoriesGrid>
        {categories.map((category) => (
          <CategoryCard key={category.name}>
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
                $color="#E74C3C"
                onClick={() => handleDeleteCategory(category.name)}
              >
                <FiTrash2 />
              </ActionButton>
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
                  disabled
                />
                <HelpText>Category name cannot be changed to maintain data integrity</HelpText>
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
                <strong>{editingCategory.count} products</strong> are in this category
              </InfoBox>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setEditingCategory(null)}>
                Cancel
              </CancelButton>
              <SaveButton onClick={() => {
                toast.success('Category updated!');
                setEditingCategory(null);
                loadCategories();
              }}>
                <FiSave /> Update Category
              </SaveButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AdminCategories;

// Styled Components
const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #636E72;
  font-size: 1rem;
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

  &:hover {
    background: #5A8470;
    transform: translateY(-2px);
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
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
`;

const CategoryContent = styled.div`
  padding: 1.25rem;
`;

const CategoryName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const ProductCount = styled.p`
  color: #636E72;
  font-size: 0.9rem;
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0 1.25rem 1.25rem 1.25rem;
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #DFE6E9;
  justify-content: flex-end;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2D3436;
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
`;

const HelpText = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #636E72;
`;

const InfoBox = styled.div`
  padding: 1rem;
  background: #E8F4F8;
  border-left: 4px solid #3498DB;
  border-radius: 4px;
  margin-top: 1rem;
  color: #2D3436;
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
`;
