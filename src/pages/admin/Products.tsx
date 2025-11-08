import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiImage } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

const AdminProducts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const queryClient = useQueryClient();

  // Fetch products from Supabase
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', searchTerm, filterCategory],
    queryFn: async () => {
      let query = supabase.from('products').select('*');
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      if (filterCategory && filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      alert('Product deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    },
  });

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Products Management</Title>
        <AddButton to="/admin/products/new">
          <FiPlus />
          Add New Product
        </AddButton>
      </Header>

      <FilterBar>
        <SearchBox>
          <FiSearch />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <FilterGroup>
          <FilterButton>
            <FiFilter />
            Filter
          </FilterButton>
          <CategorySelect value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat & Fish</option>
            <option value="bakery">Bakery</option>
          </CategorySelect>
        </FilterGroup>
      </FilterBar>

      <ProductsTable>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                Loading products...
              </TableCell>
            </TableRow>
          ) : products && products.length > 0 ? (
            products.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>
                  <ProductImage src={product.imageUrl || product.image_url} alt={product.name} />
                </TableCell>
                <TableCell>
                  <ProductName>{product.name}</ProductName>
                </TableCell>
                <TableCell>{product.categoryName || product.category}</TableCell>
                <TableCell>
                  <Price>${product.price.toFixed(2)}</Price>
                </TableCell>
                <TableCell>
                  <Stock $low={product.stock < 50}>{product.stock} units</Stock>
                </TableCell>
                <TableCell>
                  <StatusBadge $status={product.stock > 0 ? 'active' : 'out_of_stock'}>
                    {product.stock > 0 ? 'Active' : 'Out of Stock'}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <ActionButtons>
                    <EditButton to={`/admin/products/edit/${product.id}`}>
                      <FiEdit2 />
                    </EditButton>
                    <DeleteButton onClick={() => handleDeleteProduct(product.id)}>
                      <FiTrash2 />
                    </DeleteButton>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </ProductsTable>
    </Container>
  );
};

export default AdminProducts;

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

const AddButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
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

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 0 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  svg {
    color: #999;
    width: 20px;
    height: 20px;
  }
  
  input {
    flex: 1;
    border: none;
    outline: none;
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #6C9A7F;
    color: #6C9A7F;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const CategorySelect = styled.select`
  padding: 0.875rem 1rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  
  &:focus {
    border-color: #6C9A7F;
  }
`;

const ProductsTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.thead`
  background: #F8F9FA;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #F8F9FA;
  }
`;

const TableHead = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #636E72;
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
  color: #2D3436;
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
`;

const ProductName = styled.div`
  font-weight: 600;
`;

const Price = styled.div`
  font-weight: 600;
  color: #6C9A7F;
`;

const Stock = styled.div<{ $low?: boolean }>`
  color: ${props => props.$low ? '#E74C3C' : '#636E72'};
  font-weight: ${props => props.$low ? '600' : '400'};
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$status === 'active' ? '#4CAF5015' : '#E74C3C15'};
  color: ${props => props.$status === 'active' ? '#4CAF50' : '#E74C3C'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EditButton = styled(Link)`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6C9A7F15;
  color: #6C9A7F;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6C9A7F;
    color: white;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DeleteButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E74C3C15;
  color: #E74C3C;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #E74C3C;
    color: white;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;
