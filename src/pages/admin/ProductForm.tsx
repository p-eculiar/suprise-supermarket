import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiImage, FiUpload, FiX, FiSave } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { EmailNotificationService } from '../../services/emailService';
import ImageUpload from '../../components/admin/ImageUpload';
import toast from '../../components/common/Toast';

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

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

  // Fetch product data if editing
  useEffect(() => {
    if (isEdit && id) {
      fetchProduct(id);
    }
  }, [id, isEdit]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        description: data.description || '',
        category: data.categoryName || data.category || '',
        price: data.price.toString(),
        comparePrice: data.originalPrice?.toString() || '',
        stock: data.stock.toString(),
        sku: data.sku || '',
        status: data.isActive ? 'active' : 'inactive',
        image_url: data.imageUrl || data.image_url || ''
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product data');
    }
  };

  const handleImageUploaded = (url: string) => {
    setFormData({ ...formData, image_url: url });
    toast.success('Image uploaded successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        categoryName: formData.category,
        category: formData.category,
        price: parseFloat(formData.price),
        originalPrice: formData.comparePrice ? parseFloat(formData.comparePrice) : parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sku: formData.sku || `SKU-${Date.now()}`,
        imageUrl: formData.image_url || 'https://via.placeholder.com/400',
        image_url: formData.image_url || 'https://via.placeholder.com/400',
        isActive: formData.status === 'active',
        isFeatured: false,
        rating: 0,
        reviewCount: 0,
      };

      if (isEdit && id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;
        alert('Product updated successfully!');
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;

        // Send email notifications to subscribed users
        try {
          await EmailNotificationService.sendNewProductNotification({
            productId: newProduct.id,
            productName: newProduct.name,
            productPrice: newProduct.price,
            productImage: newProduct.imageUrl,
            productDescription: newProduct.description || 'Check out our new product!',
          });
          
          console.log('Email notifications queued successfully');
        } catch (emailError) {
          console.error('Failed to send email notifications:', emailError);
          // Don't fail the product creation if email fails
        }

        alert('Product created successfully! Email notifications sent to subscribers.');
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`Failed to save product: ${error.message}`);
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
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="dairy">Dairy & Eggs</option>
                    <option value="meat">Meat & Fish</option>
                    <option value="bakery">Bakery</option>
                    <option value="beverages">Beverages</option>
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
  transition: all 0.3s ease;
  
  &:hover {
    background: #F8F9FA;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
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
  font-size: 0.875rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.1);
  }
`;

const InputHint = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.5rem;
`;

const ImageUploadArea = styled.div`
  margin-bottom: 1.5rem;
`;

const UploadButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  border: 2px dashed #E1E8ED;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #6C9A7F;
    background: #6C9A7F05;
  }
  
  svg {
    width: 32px;
    height: 32px;
    color: #6C9A7F;
  }
  
  span {
    font-weight: 600;
    color: #6C9A7F;
  }
`;

const UploadHint = styled.div`
  font-size: 0.75rem;
  color: #999;
  text-align: center;
  margin-top: 0.75rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveImageBtn = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #E74C3C;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;
