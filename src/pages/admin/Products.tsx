import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiImage, FiAlertTriangle, FiPackage, FiTrendingUp, FiX, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { inventoryService } from '../../services/inventoryService';
import { AdminProductsLoader, InlineLoader } from '../../components/common/GranularLoading';
import toast from '../../components/common/Toast';
import { useSettings } from '../../contexts/SettingsContext';

const AdminProducts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showInventoryAlerts, setShowInventoryAlerts] = useState(false);
  const queryClient = useQueryClient();
  const { formatCurrency } = useSettings();

  // Debounce search term to avoid excessive queries
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch products from Supabase with better error handling
  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-products', debouncedSearchTerm, filterCategory],
    queryFn: async () => {
      let query = supabase.from('products').select('*');
      
      if (debouncedSearchTerm) {
        query = query.ilike('name', `%${debouncedSearchTerm}%`);
      }
      
      if (filterCategory && filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });

  // Fetch inventory alerts with better error handling
  const { data: inventoryAlerts = [], isError: isAlertsError } = useQuery({
    queryKey: ['inventory-alerts'],
    queryFn: async () => {
      return await inventoryService.getInventoryAlerts(false); // Get unresolved alerts
    },
    staleTime: 60000, // Cache for 1 minute
  });

  // Fetch low stock products with better error handling
  const { data: lowStockProducts = [], isError: isLowStockError } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      // Derive low stock products from products list (threshold 10)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock', 10)
        .order('stock', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000, // Cache for 1 minute
  });

  // Set up real-time subscription for products with better error handling
  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          // Invalidate the products query to refetch data
          queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          toast.success('New product added');
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
          // Invalidate the products query to refetch data
          queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
          toast.info('Product updated');
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
          // Invalidate the products query to refetch data
          queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
          toast.info('Product deleted');
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to products real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to products real-time updates:', err);
          toast.error('Failed to subscribe to real-time updates');
        } else if (status === 'CLOSED') {
          console.log('Closed subscription to products real-time updates');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
      // Broadcast product deletion to other pages
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting product:', error);
      toast.error(`Failed to delete product: ${error.message || 'Unknown error'}`);
    },
  });

  // Update stock mutation with better real-time handling
  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, quantityChange, type, reason }: { productId: string; quantityChange: number; type: 'in' | 'out' | 'adjustment'; reason?: string }) => {
      // Fetch current stock and apply delta locally because service expects absolute new stock
      const { data: prod, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const current = prod?.stock ?? 0;
      const newStock = current + quantityChange;
      
      if (newStock < 0) {
        throw new Error('Cannot reduce stock below zero');
      }
      
      return await inventoryService.updateProductStock(productId, newStock, reason);
    },
    onSuccess: (_, variables) => {
      // Invalidate all related queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
      
      // Broadcast stock update to other pages
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      
      toast.success(`Stock updated successfully`);
    },
    onError: (error: any) => {
      console.error('Error updating stock:', error);
      toast.error(`Failed to update stock: ${error.message || 'Unknown error'}`);
    },
  });

  // Resolve inventory alert mutation
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return await inventoryService.resolveInventoryAlert(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      toast.success('Alert resolved successfully');
    },
    onError: (error: any) => {
      console.error('Error resolving alert:', error);
      toast.error(`Failed to resolve alert: ${error.message || 'Unknown error'}`);
    },
  });

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleUpdateStock = (productId: string, quantityChange: number, type: 'in' | 'out' | 'adjustment', reason?: string) => {
    updateStockMutation.mutate({ productId, quantityChange, type, reason });
  };

  const handleResolveAlert = (alertId: string) => {
    if (window.confirm('Mark this alert as resolved?')) {
      resolveAlertMutation.mutate(alertId);
    }
  };

  // Add refresh function with better error handling
  const handleRefresh = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['low-stock-products'] })
      ]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };

  if (isError) {
    return (
      <Container>
        <ErrorState>
          <h2>Error Loading Products</h2>
          <p>{error?.message || 'An unknown error occurred'}</p>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
            Try Again
          </RefreshButton>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      {/* Show full page loader on initial load */}
      {isLoading && !products.length ? (
        <AdminProductsLoader />
      ) : (
        <>
      <Header>
        <TitleSection>
          <Title>Products Management</Title>
          {inventoryAlerts.length > 0 && (
            <AlertIndicator onClick={() => setShowInventoryAlerts(!showInventoryAlerts)}>
              <FiAlertTriangle />
              {inventoryAlerts.length} Alert{inventoryAlerts.length > 1 ? 's' : ''}
            </AlertIndicator>
          )}
        </TitleSection>
        <HeaderActions>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
            Refresh
          </RefreshButton>
          {lowStockProducts.length > 0 && (
            <LowStockIndicator>
              <FiTrendingUp />
              {lowStockProducts.length} Low Stock
            </LowStockIndicator>
          )}
          <AddButton to="/admin/products/new">
            <FiPlus />
            Add New Product
          </AddButton>
        </HeaderActions>
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

      {/* Inventory Alerts Section */}
      {showInventoryAlerts && inventoryAlerts && inventoryAlerts.length > 0 && (
        <AlertsSection>
          <AlertsHeader>
            <h3>Inventory Alerts</h3>
            <CloseAlertsButton onClick={() => setShowInventoryAlerts(false)}>
              <FiX />
            </CloseAlertsButton>
          </AlertsHeader>
          <AlertsList>
            {inventoryAlerts.map((alert: any) => (
              <AlertItem key={alert.id} $type={alert.alert_type}>
                <AlertIcon>
                  <FiPackage />
                </AlertIcon>
                <AlertContent>
                  <AlertTitle>{alert.product_name}</AlertTitle>
                  <AlertMessage>
                    {alert.alert_type === 'low_stock' && `${alert.current_stock} units remaining (threshold: ${alert.threshold})`}
                    {alert.alert_type === 'out_of_stock' && 'Product is out of stock'}
                    {alert.alert_type === 'overstock' && `${alert.current_stock} units in stock (overstock detected)`}
                  </AlertMessage>
                </AlertContent>
                <AlertActions>
                  <ResolveButton onClick={() => handleResolveAlert(alert.id)}>
                    Mark Resolved
                  </ResolveButton>
                </AlertActions>
              </AlertItem>
            ))}
          </AlertsList>
        </AlertsSection>
      )}

      <ProductsTableContainer className="table-container">
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
            ) : products.length > 0 ? (
              products.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <ProductImage loading="lazy" src={product.imageUrl || product.image_url} alt={product.name} />
                  </TableCell>
                  <TableCell>
                    <ProductName>{product.name}</ProductName>
                  </TableCell>
                  <TableCell>{product.categoryName || product.category}</TableCell>
                  <TableCell>
                    <Price>{formatCurrency(product.price)}</Price>
                  </TableCell>
                  <TableCell>
                    <StockInfo>
                      <Stock $low={product.stock < (product.low_stock_threshold || 10)}>
                        {product.stock} units
                      </Stock>
                      <StockActions>
                        <StockButton 
                          onClick={() => handleUpdateStock(product.id, 1, 'in', 'Manual stock increase')}
                          title="Add 1 unit"
                        >
                          +
                        </StockButton>
                        <StockButton 
                          onClick={() => handleUpdateStock(product.id, -1, 'out', 'Manual stock decrease')}
                          title="Remove 1 unit"
                          disabled={product.stock <= 0}
                        >
                          -
                        </StockButton>
                      </StockActions>
                    </StockInfo>
                  </TableCell>
                  <TableCell>
                    <ToggleChips>
                      <Chip
                        $active={product.active}
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('products')
                              .update({ active: !product.active })
                              .eq('id', product.id);
                            
                            if (error) throw error;
                            
                            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                            // Broadcast product update to other pages
                            window.dispatchEvent(new CustomEvent('productsUpdated'));
                            toast.success(`Product ${!product.active ? 'activated' : 'deactivated'} successfully`);
                          } catch (error: any) {
                            console.error('Error updating active status:', error);
                            toast.error(`Failed to update active status: ${error.message || 'Unknown error'}`);
                          }
                        }}
                      >Active</Chip>
                      <Chip
                        $active={product.featured}
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('products')
                              .update({ featured: !product.featured })
                              .eq('id', product.id);
                            
                            if (error) throw error;
                            
                            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                            // Broadcast product update to other pages
                            window.dispatchEvent(new CustomEvent('productsUpdated'));
                            toast.success(`Product ${!product.featured ? 'featured' : 'unfeatured'} successfully`);
                          } catch (error: any) {
                            console.error('Error updating featured status:', error);
                            toast.error(`Failed to update featured status: ${error.message || 'Unknown error'}`);
                          }
                        }}
                      >Featured</Chip>
                      <Chip
                        $active={!!product.discount}
                        onClick={async () => {
                          try {
                            const newVal = window.prompt('Set discount % (0-90):', String(product.discount || 0));
                            if (newVal === null) return;
                            const pct = Math.max(0, Math.min(90, Number(newVal) || 0));
                            
                            const { error } = await supabase
                              .from('products')
                              .update({ discount: pct })
                              .eq('id', product.id);
                            
                            if (error) throw error;
                            
                            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                            // Broadcast product update to other pages
                            window.dispatchEvent(new CustomEvent('productsUpdated'));
                            toast.success(`Discount set to ${pct}% successfully`);
                          } catch (error: any) {
                            console.error('Error updating discount:', error);
                            toast.error(`Failed to update discount: ${error.message || 'Unknown error'}`);
                          }
                        }}
                      >Discount</Chip>
                    </ToggleChips>
                    {product.stock <= (product.low_stock_threshold || 10) && product.stock > 0 && (
                      <LowStockBadge>Low Stock</LowStockBadge>
                    )}
                    {product.stock === 0 && (
                      <LowStockBadge style={{ background: '#E74C3C15', color: '#E74C3C' }}>
                        Out of Stock
                      </LowStockBadge>
                    )}
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
      </ProductsTableContainer>
        </>
      )}
    </Container>
  );
};

export default AdminProducts;

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
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
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
  white-space: nowrap;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
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
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
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
  
  @media (max-width: 480px) {
    input {
      padding: 0.75rem;
      font-size: 0.9rem;
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    flex-wrap: wrap;
  }
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
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
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
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const ProductsTableContainer = styled.div`
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  
  /* Force scrollbar to always show for testing */
  overflow-x: scroll;
  
  /* Custom scrollbar styling for WebKit browsers */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
  
  @media (max-width: 480px) {
    &::-webkit-scrollbar {
      height: 6px;
    }
  }
`;

const ProductsTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-width: 800px;
  
  @media (max-width: 768px) {
    min-width: 700px;
  }
  
  @media (max-width: 480px) {
    min-width: 600px;
  }
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
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
  color: #2D3436;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
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
  
  @media (max-width: 480px) {
    gap: 0.25rem;
  }
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
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    
    svg {
      width: 14px;
      height: 14px;
    }
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
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

// New styled components for inventory management
const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const AlertIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #FF6B6B;
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #FF5252;
    transform: translateY(-1px);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
`;

const LowStockIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #FF9800;
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
`;

const AlertsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const AlertsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    color: #2D3436;
  }
`;

const CloseAlertsButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8F9FA;
  border: 1px solid #E1E8ED;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #E1E8ED;
  }
  
  svg {
    width: 16px;
    height: 16px;
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

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AlertItem = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'low_stock': return '#FF9800';
      case 'out_of_stock': return '#E74C3C';
      case 'overstock': return '#9B59B6';
      default: return '#636E72';
    }
  }};
  background: ${props => {
    switch (props.$type) {
      case 'low_stock': return '#FFF3E0';
      case 'out_of_stock': return '#FFEBEE';
      case 'overstock': return '#F3E5F5';
      default: return '#F8F9FA';
    }
  }};
`;

const AlertIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #6C9A7F;
  color: white;
  border-radius: 8px;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const AlertMessage = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ResolveButton = styled.button`
  padding: 0.5rem 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
  }
`;

const StockInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StockActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const StockButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #5A8569;
  }
  
  &:disabled {
    background: #E1E8ED;
    color: #999;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  h2 {
    color: #2D3436;
    margin-bottom: 1rem;
  }

  p {
    color: #636E72;
    margin-bottom: 2rem;
    max-width: 500px;
  }
`;

const LowStockBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #FF980015;
  color: #FF9800;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.25rem;
`;

const ToggleChips = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const Chip = styled.button<{ $active?: boolean }>`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  border: 1px solid ${p => (p.$active ? '#6C9A7F' : '#E1E8ED')};
  background: ${p => (p.$active ? '#6C9A7F20' : 'white')};
  color: ${p => (p.$active ? '#2D3436' : '#636E72')};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
`;

// Add debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
