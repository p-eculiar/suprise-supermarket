import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch, FiHeart, FiShoppingCart, FiPackage, FiDollarSign, FiTrendingUp, FiUser, FiBell, FiStar } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../services/api';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from '../../components/common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../hooks/useRealtime';
import { useWishlist } from '../../contexts/WishlistContext';
import { useSettings } from '../../contexts/SettingsContext';

const UserDashboard: React.FC = () => {
  const { cartItems, getCartTotal, addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [categories, setCategories] = useState<Array<{ 
    name: string; 
    icon: string;
    image_url?: string;
    count?: number;
  }>>([]);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { formatCurrency } = useSettings();

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('🔄 Fetching categories...');
        // First try to get categories from the categories table with image URLs
        const { data: catRows, error: catErr } = await supabase
          .from('categories')
          .select('name, image_url')
          .order('name', { ascending: true });

        // Also get product counts for each category
        const { data: productCounts, error: countErr } = await supabase
          .from('products')
          .select('category')
          .eq('active', true);

        console.log('📊 Categories table result:', catRows, catErr);
        console.log('📊 Product counts result:', productCounts, countErr);
        
        if (!catErr && catRows && catRows.length > 0) {
          // Create icon mapping
          const iconMap: Record<string, string> = {
            'vegetables': '🥬',
            'fruits': '🍎',
            'dairy': '🥛',
            'meat': '🍖',
            'bakery': '🍞',
            'beverages': '🥤',
            'snacks': '🍿',
            'frozen': '❄️',
            'organic': '🌿',
            'pantry': '🥫',
            'seafood': '🐟',
            'personal care': '🧴',
            'cleaning': '🧼',
            'pet supplies': '🐾',
            'health foods': '💪',
            'international foods': '🌍',
            'condiments': '🧂',
            'canned goods': '🥫'
          };

          // Create a map of product counts by category
          const countMap: Record<string, number> = {};
          if (!countErr && productCounts) {
            productCounts.forEach((p: any) => {
              if (p.category) {
                countMap[p.category] = (countMap[p.category] || 0) + 1;
              }
            });
          }

          const categoriesWithDetails = catRows.map((cat: any) => ({
            name: cat.name,
            icon: iconMap[cat.name.toLowerCase()] || '🛍️',
            image_url: cat.image_url,
            count: countMap[cat.name] || 0
          }));
          
          console.log('✅ Categories from categories table:', categoriesWithDetails);
          setCategories(categoriesWithDetails);
          return;
        }

        console.log('🔄 Falling back to products table for categories');
        // Fallback: get categories from products
        const { data: prodRows, error: prodErr } = await supabase
          .from('products')
          .select('category, image_url')
          .eq('active', true);

        console.log('📊 Products table result:', prodRows?.slice(0, 5), prodErr);

        if (!prodErr && prodRows) {
          // Create a map of categories with their counts and sample images
          const categoryMap = new Map<string, { count: number; image_url?: string }>();
          prodRows.forEach((p: any) => {
            if (p.category) {
              const existing = categoryMap.get(p.category) || { count: 0 };
              categoryMap.set(p.category, {
                count: existing.count + 1,
                image_url: existing.image_url || p.image_url
              });
            }
          });

          const iconMap: Record<string, string> = {
            'vegetables': '🥬',
            'fruits': '🍎',
            'dairy': '🥛',
            'meat': '🍖',
            'bakery': '🍞',
            'beverages': '🥤',
            'snacks': '🍿',
            'frozen': '❄️',
            'organic': '🌿',
            'pantry': '🥫',
            'seafood': '🐟',
            'personal care': '🧴',
            'cleaning': '🧼',
            'pet supplies': '🐾',
            'health foods': '💪',
            'international foods': '🌍',
            'condiments': '🧂',
            'canned goods': '🥫'
          };

          const categoriesWithDetails = Array.from(categoryMap.entries()).map(([name, data]) => ({
            name: name,
            icon: iconMap[name ? name.toLowerCase() : ''] || '🛍️',
            image_url: data.image_url,
            count: data.count
          })).filter(cat => cat.name); // Filter out null/undefined categories
          
          console.log('✅ Final categories from products table:', categoriesWithDetails);
          setCategories(categoriesWithDetails);
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        // Fallback to default categories
        const defaultCategories = [
          { name: 'Vegetables', icon: '🥬', count: 0 },
          { name: 'Fruits', icon: '🍎', count: 0 },
          { name: 'Dairy', icon: '🥛', count: 0 },
          { name: 'Meat', icon: '🍖', count: 0 },
          { name: 'Bakery', icon: '🍞', count: 0 },
          { name: 'Beverages', icon: '🥤', count: 0 },
          { name: 'Snacks', icon: '🍿', count: 0 },
        ];
        console.log('⚠️ Using default categories:', defaultCategories);
        setCategories(defaultCategories);
      }
    };

    fetchCategories();
  }, []);

  // Log categories when they change
  useEffect(() => {
    console.log('🔄 Categories state updated:', categories);
  }, [categories]);

  // Fetch user orders for invoice section
  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        if (!user) return;
        setLoadingOrders(true);
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setUserOrders(data || []);
      } catch (error) {
        console.error('Error fetching user orders:', error);
        toast.error('Failed to load order history');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  // Realtime updates for the current user's orders
  useRealtime({
    table: 'orders',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    filter: user ? { column: 'user_id', value: user.id } : undefined,
    onEvent: () => {
      // Re-fetch recent orders on change
      (async () => {
        if (!user) return;
        const { data } = await supabase
          .from('orders')
          .select(`*, order_items (*)`)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setUserOrders(data || []);
      })();
    },
    channelName: 'user-orders-realtime'
  });

  // Realtime updates for featured products
  useRealtime({
    table: 'products',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: () => {
      // Invalidate the featured products query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
    channelName: 'user-dashboard-featured-products'
  });

  const { data: productsResponse, isLoading, isError } = useQuery<{ data: Product[], count: number }, Error>({
    queryKey: ['featuredProducts'],
    queryFn: () => fetchProducts({ isFeatured: true, limit: 6 })
  });

  const products = productsResponse?.data;

  const subtotal = getCartTotal();
  // Tax removed as per requirement - using 0 for tax
  const tax = 0;
  const total = subtotal + tax;
  
  // Calculate order total for invoice
  const getOrderTotal = (order: any) => {
    return order.order_items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
  };
  
  // Check if a product is in the wishlist
  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  };
  
  // Toggle wishlist status for a product
  const toggleWishlist = async (product: Product) => {
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      toast.removedFromWishlist(product.name);
    } else {
      await addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryName: (product as any).category || 'Uncategorized',
        stock: 999 // Assuming sufficient stock
      });
      toast.addedToWishlist(product.name);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Check if the search query matches a category
      const matchedCategory = categories.find(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchedCategory) {
        // If it matches a category, navigate to products filtered by that category
        navigate(`/products?category=${encodeURIComponent(matchedCategory.name)}`);
      } else {
        // Otherwise, perform a general search
        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      }
    } else {
      // If no search query, go to all products
      navigate('/products');
    }
  };

  return (
    <DashboardContainer>
      {/* Welcome Section */}
      <WelcomeSection>
        <WelcomeContent>
          <WelcomeText>
            <Greeting>Hello, {user?.email?.split('@')[0] || 'Customer'}!</Greeting>
            <WelcomeMessage>Welcome back to your dashboard</WelcomeMessage>
          </WelcomeText>
          <StatsContainer>
            <StatCard>
              <StatIcon bg="#6C9A7F">
                <FiShoppingCart />
              </StatIcon>
              <StatInfo>
                <StatValue>{cartItems.length}</StatValue>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon bg="#5A8470">
                <FiPackage />
              </StatIcon>
              <StatInfo>
                <StatValue>{userOrders.length}</StatValue>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon bg="#4A6D5D">
                <FiDollarSign />
              </StatIcon>
              <StatInfo>
                <StatValue>{formatCurrency(total)}</StatValue>
              </StatInfo>
            </StatCard>
          </StatsContainer>
        </WelcomeContent>
      </WelcomeSection>

      {/* Search and Actions */}
      <ActionSection>
        <SearchForm onSubmit={handleSearch}>
          <SearchContainer>
            <FiSearch />
            <SearchInput 
              type="text" 
              placeholder="Search for products, categories, or brands..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          <SearchButton type="submit">Search</SearchButton>
        </SearchForm>
        
        <QuickActions>
          <ActionButton onClick={() => navigate('/products')}>
            <FiTrendingUp />
            <span>Browse Products</span>
          </ActionButton>
          <ActionButton onClick={() => navigate('/wishlist')}>
            <FiHeart />
            <span>Wishlist</span>
          </ActionButton>
          <ActionButton onClick={() => navigate('/dashboard/history')}>
            <FiPackage />
            <span>Order History</span>
          </ActionButton>
          <ActionButton onClick={() => navigate('/dashboard/payment')}>
            <FiDollarSign />
            <span>Payments</span>
          </ActionButton>
        </QuickActions>
      </ActionSection>

      {/* Main Content Grid */}
      <ContentGrid>
        {/* Left Column - Categories and Products */}
        <MainContent>
          {/* Categories Section */}
          <Section>
            <SectionHeader>
              <SectionTitle>Shop by Category</SectionTitle>
              <ViewAllButton onClick={() => navigate('/products')}>View All</ViewAllButton>
            </SectionHeader>
            <CategoriesGrid>
              {categories.map((category) => (
                <CategoryCard 
                  key={category.name} 
                  onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
                >
                  <CategoryImage>
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} />
                    ) : (
                      <ImagePlaceholder>
                        <span style={{ fontSize: '3rem' }}>{category.icon}</span>
                      </ImagePlaceholder>
                    )}
                  </CategoryImage>
                  
                  <CategoryContent>
                    <CategoryName>{category.name}</CategoryName>
                    {category.count !== undefined && (
                      <ProductCount>{category.count} products</ProductCount>
                    )}
                  </CategoryContent>
                  
                  <CategoryActions>
                    <CategoryActionButton>
                      Shop Now
                    </CategoryActionButton>
                  </CategoryActions>
                </CategoryCard>
              ))}
            </CategoriesGrid>
          </Section>

          {/* Featured Products Section */}
          <Section>
            <SectionHeader>
              <SectionTitle>Featured Products</SectionTitle>
              <ViewAllButton onClick={() => navigate('/products?featured=true')}>View All</ViewAllButton>
            </SectionHeader>
            <ProductsGrid>
              {isLoading && <LoadingMessage>Loading products...</LoadingMessage>}
              {isError && <ErrorMessage>Error fetching products.</ErrorMessage>}
              {products && products.map((product) => (
                <ProductCard key={product.id} onClick={() => navigate(`/products/${product.id}`)}>
                  <ProductImageContainer>
                    <ProductImage src={product.imageUrl} alt={product.name} />
                    <WishlistButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      $active={isInWishlist(product.id)}
                    >
                      <FiHeart />
                    </WishlistButton>
                  </ProductImageContainer>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductMeta>
                      <Price>{formatCurrency(product.price)}</Price>
                      <Rating>
                        <FiStar />
                        <span>4.8</span>
                      </Rating>
                    </ProductMeta>
                    <AddToCartButton onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        categoryName: (product as any).category || 'Uncategorized',
                        stock: 999 // Assuming sufficient stock
                      });
                      toast.success(`${product.name} added to cart!`);
                    }}>
                      Add to Cart
                    </AddToCartButton>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>
          </Section>
        </MainContent>

        {/* Right Column - Recent Orders and Quick Actions */}
        <SidebarContent>
          {/* Recent Orders */}
          <Section>
            <SectionHeader>
              <SectionTitle>Recent Orders</SectionTitle>
              <ViewAllButton onClick={() => navigate('/dashboard/history')}>View All</ViewAllButton>
            </SectionHeader>
            <OrderList>
              {loadingOrders ? (
                <LoadingMessage>Loading order history...</LoadingMessage>
              ) : userOrders.length > 0 ? (
                userOrders.map(order => (
                  <OrderItem key={order.id}>
                    <OrderInfo>
                      <OrderNumber>#{order.id.slice(0, 8)}</OrderNumber>
                      <OrderDate>{new Date(order.created_at).toLocaleDateString()}</OrderDate>
                    </OrderInfo>
                    <OrderAmount>{formatCurrency(getOrderTotal(order))}</OrderAmount>
                    <OrderStatus status={order.status}>{order.status}</OrderStatus>
                  </OrderItem>
                ))
              ) : (
                <EmptyMessage>No recent orders</EmptyMessage>
              )}
            </OrderList>
          </Section>

          {/* Quick Actions */}
          <Section>
            <SectionHeader>
              <SectionTitle>Quick Actions</SectionTitle>
            </SectionHeader>
            <ActionGrid>
              <ActionCard onClick={() => navigate('/cart')}>
                <ActionIcon bg="#6C9A7F">
                  <FiShoppingCart />
                </ActionIcon>
                <ActionLabel>View Cart</ActionLabel>
              </ActionCard>
              <ActionCard onClick={() => navigate('/dashboard/messages')}>
                <ActionIcon bg="#5A8470">
                  <FiBell />
                </ActionIcon>
                <ActionLabel>Messages</ActionLabel>
              </ActionCard>
              <ActionCard onClick={() => navigate('/dashboard/customization')}>
                <ActionIcon bg="#4A6D5D">
                  <FiUser />
                </ActionIcon>
                <ActionLabel>Profile</ActionLabel>
              </ActionCard>
              <ActionCard onClick={() => navigate('/dashboard/feedback')}>
                <ActionIcon bg="#3A574A">
                  <FiStar />
                </ActionIcon>
                <ActionLabel>Feedback</ActionLabel>
              </ActionCard>
            </ActionGrid>
          </Section>

          {/* Cart Summary */}
          {cartItems.length > 0 && (
            <Section>
              <SectionHeader>
                <SectionTitle>Your Cart</SectionTitle>
                <ViewAllButton onClick={() => navigate('/cart')}>View Cart</ViewAllButton>
              </SectionHeader>
              <CartSummary>
                <SummaryRow>
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </SummaryRow>
                <SummaryRow total>
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </SummaryRow>
                <CheckoutButton onClick={() => navigate('/checkout')}>
                  Proceed to Checkout
                </CheckoutButton>
              </CartSummary>
            </Section>
          )}
        </SidebarContent>
      </ContentGrid>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background-color: #f5f7fa;
  min-height: 100vh;
  
  @media (max-width: 1024px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const WelcomeSection = styled.section`
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 8px 32px rgba(108, 154, 127, 0.2);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const WelcomeContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const WelcomeText = styled.div`
  flex: 1;
`;

const Greeting = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const WelcomeMessage = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 500px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div<{ bg: string }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const ActionSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 0 1.25rem;
  flex: 1;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  
  svg {
    color: #6c757d;
    margin-right: 0.75rem;
    font-size: 1.2rem;
  }
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 1rem;
  padding: 1.25rem 0;
  color: #2d3436;
  
  &::placeholder {
    color: #6c757d;
  }
  
  @media (max-width: 768px) {
    padding: 1rem 0;
    font-size: 0.95rem;
  }
`;

const SearchButton = styled.button`
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 1.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  
  &:hover {
    background: #5A8470;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(108, 154, 127, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  color: #2d3436;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6C9A7F;
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(108, 154, 127, 0.2);
  }
  
  svg {
    font-size: 1.2rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 0.9rem;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.section`
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3436;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #6C9A7F;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #6C9A7F10;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  
  @media (max-width: 768px) {
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
  cursor: pointer;

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
  height: 160px;
  overflow: hidden;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
  
  @media (max-width: 480px) {
    height: 140px;
    
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
  padding: 0 1.25rem 1.25rem 1.25rem;
  
  @media (max-width: 480px) {
    padding: 0 1rem 1rem 1rem;
  }
`;

const CategoryActionButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.75rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.25rem;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }
`;

const ProductImageContainer = styled.div`
  position: relative;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  
  @media (max-width: 768px) {
    height: 160px;
  }
`;

const WishlistButton = styled.button<{ $active?: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$active ? '#6C9A7F' : 'rgba(255, 255, 255, 0.9)'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  svg {
    color: ${props => props.$active ? 'white' : '#6c757d'};
    font-size: 1rem;
    fill: ${props => props.$active ? 'white' : 'none'};
  }
  
  &:hover {
    background: #6C9A7F;
    svg {
      color: white;
      fill: white;
    }
  }
`;

const ProductInfo = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ProductName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #2d3436;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
`;

const ProductMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const Price = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #6C9A7F;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f39c12;
  font-size: 0.9rem;
  font-weight: 600;
  
  svg {
    fill: #f39c12;
  }
`;

const AddToCartButton = styled.button`
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: auto;
  
  &:hover {
    background: #5A8470;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    transform: translateX(5px);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #2d3436;
`;

const OrderDate = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
`;

const OrderAmount = styled.div`
  font-weight: 700;
  color: #6C9A7F;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const OrderStatus = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-weight: 600;
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'failed': return '#e74c3c';
      default: return '#6c757d';
    }
  }};
  
  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
`;

const ActionCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6C9A7F;
    color: white;
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(108, 154, 127, 0.2);
  }
`;

const ActionIcon = styled.div<{ bg: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
`;

const ActionLabel = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
`;

const CartSummary = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
`;

const SummaryRow = styled.div<{
  total?: boolean
}>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-weight: ${({ total }) => (total ? '700' : '500')};
  color: ${({ total }) => (total ? '#2d3436' : '#6c757d')};
  font-size: ${({ total }) => (total ? '1.1rem' : '1rem')};
  
  &:last-child {
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 768px) {
    font-size: ${({ total }) => (total ? '1rem' : '0.9rem')};
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 1.1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8470;
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(108, 154, 127, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1rem;
  }
`;

const LoadingMessage = styled.p`
  text-align: center;
  color: #6c757d;
  padding: 2rem;
`;

const ErrorMessage = styled.p`
  text-align: center;
  color: #e74c3c;
  padding: 2rem;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #6c757d;
  padding: 2rem;
  font-style: italic;
`;

export default UserDashboard;