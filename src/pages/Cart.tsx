import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import { FiX, FiMinus, FiPlus, FiShoppingBag, FiAlertTriangle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { calculateShippingFee, isDeliveryAvailable, getCoordinatesForArea } from '../utils/shippingCalculator';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { settings, formatCurrency } = useSettings();
  const [couponCode, setCouponCode] = useState('');
  const [stockWarnings, setStockWarnings] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  // Fetch real-time stock data for cart items
  const { data: stockData } = useQuery({
    queryKey: ['cart-stock-validation', cartItems.map(item => item.id)],
    queryFn: async () => {
      if (cartItems.length === 0) return {};
      
      const productIds = cartItems.map(item => item.id);
      const { data, error } = await supabase
        .from('products')
        .select('id, stock, name, low_stock_threshold')
        .in('id', productIds);
      
      if (error) throw error;
      
      const stockMap: {[key: string]: any} = {};
      data?.forEach(product => {
        stockMap[product.id] = product;
      });
      
      return stockMap;
    },
    enabled: cartItems.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Check for stock issues and update warnings
  useEffect(() => {
    if (!stockData || cartItems.length === 0) {
      setStockWarnings({});
      return;
    }

    const warnings: {[key: string]: string} = {};
    
    cartItems.forEach(cartItem => {
      const productStock = stockData[cartItem.id];
      if (!productStock) return;
      
      if (productStock.stock === 0) {
        warnings[cartItem.id] = 'Out of stock - item will be removed';
      } else if (cartItem.quantity > productStock.stock) {
        warnings[cartItem.id] = `Only ${productStock.stock} available - quantity adjusted`;
      } else if (productStock.stock <= (productStock.low_stock_threshold || 10)) {
        warnings[cartItem.id] = `Low stock: ${productStock.stock} remaining`;
      }
    });
    
    setStockWarnings(warnings);
  }, [stockData, cartItems]);

  const subtotal = getCartTotal();
  // Shipping will be calculated in the checkout process based on location
  // For now, we'll show 0 and explain that it will be calculated during checkout
  const shipping = 0;
  // Tax removed as per requirement - using 0 for tax
  const tax = 0;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    // Navigate to checkout page
    navigate('/checkout');
  };

  return (
    <PageWrapper>
      <BreadcrumbSection>
        <ContentContainer>
          <PageTitle>Shopping Cart</PageTitle>
          <Breadcrumb>
            <BreadcrumbLink to="/">Home</BreadcrumbLink>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbCurrent>Cart</BreadcrumbCurrent>
          </Breadcrumb>
        </ContentContainer>
      </BreadcrumbSection>

      <ContentContainer>
        {cartItems.length === 0 ? (
          <EmptyState
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EmptyIcon>
              <FiShoppingBag />
            </EmptyIcon>
            <EmptyTitle>Your Cart is Empty</EmptyTitle>
            <EmptyText>Add items to your cart to continue shopping</EmptyText>
            <Link to="/products">
              <ShopNowButton>Continue Shopping</ShopNowButton>
            </Link>
          </EmptyState>
        ) : (
          <CartLayout>
            <CartMain>
              <CartTable>
                <TableHeader>
                  <HeaderCell $width="45%">Product</HeaderCell>
                  <HeaderCell $width="15%">Price</HeaderCell>
                  <HeaderCell $width="20%">Quantity</HeaderCell>
                  <HeaderCell $width="15%">Subtotal</HeaderCell>
                  <HeaderCell $width="5%"></HeaderCell>
                </TableHeader>

                <TableBody>
                  {cartItems.map((item, index) => (
                    <TableRow
                      key={item.id}
                      as={motion.div}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ProductCell>
                        <ProductImage src={item.imageUrl} alt={item.name} />
                        <ProductInfo>
                          <ProductName>{item.name}</ProductName>
                          <ProductCategory>{item.categoryName}</ProductCategory>
                          {stockWarnings[item.id] && (
                            <StockWarning>
                              <FiAlertTriangle />
                              {stockWarnings[item.id]}
                            </StockWarning>
                          )}
                        </ProductInfo>
                      </ProductCell>

                      <PriceCell>
                        <Price>{formatCurrency(item.price)}</Price>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <OriginalPrice>{formatCurrency(item.originalPrice)}</OriginalPrice>
                        )}
                      </PriceCell>

                      <QuantityCell>
                        <QuantityControl>
                          <QuantityButton
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <FiMinus />
                          </QuantityButton>
                          <QuantityDisplay>{item.quantity}</QuantityDisplay>
                          <QuantityButton
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={stockData ? item.quantity >= stockData[item.id]?.stock : item.quantity >= item.stock}
                          >
                            <FiPlus />
                          </QuantityButton>
                        </QuantityControl>
                        {stockData && stockData[item.id] && (
                          <StockInfo>
                            {stockData[item.id].stock} in stock
                          </StockInfo>
                        )}
                      </QuantityCell>

                      <SubtotalCell>
                        <Subtotal>{formatCurrency(item.price * item.quantity)}</Subtotal>
                      </SubtotalCell>

                      <RemoveCell>
                        <RemoveButton onClick={() => removeFromCart(item.id)}>
                          <FiX />
                        </RemoveButton>
                      </RemoveCell>
                    </TableRow>
                  ))}
                </TableBody>
              </CartTable>

              <CartActions>
                <ContinueShoppingLink to="/products">
                  ← Continue Shopping
                </ContinueShoppingLink>
                <ClearCartButton onClick={clearCart}>
                  Clear Cart
                </ClearCartButton>
              </CartActions>

              <CouponSection>
                <CouponTitle>Apply Coupon</CouponTitle>
                <CouponForm>
                  <CouponInput
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <ApplyCouponButton>Apply Coupon</ApplyCouponButton>
                </CouponForm>
              </CouponSection>
            </CartMain>

            <CartSidebar>
              <SummaryCard>
                <SummaryTitle>Cart Summary</SummaryTitle>
                
                <SummaryRow>
                  <SummaryLabel>Subtotal:</SummaryLabel>
                  <SummaryValue>{formatCurrency(subtotal)}</SummaryValue>
                </SummaryRow>

                <SummaryRow>
                  <SummaryLabel>Shipping:</SummaryLabel>
                  <SummaryValue>
                    <div style={{ fontSize: '0.875rem', color: '#636E72', fontWeight: 400, textAlign: 'right', fontStyle: 'italic' }}>
                      Enter delivery address in checkout to calculate
                    </div>
                  </SummaryValue>
                </SummaryRow>

                <Divider />

                <TotalRow>
                  <TotalLabel>Total:</TotalLabel>
                  <TotalValue>{formatCurrency(total)}</TotalValue>
                </TotalRow>

                <CheckoutButton onClick={handleCheckout}>
                  Proceed to Checkout
                </CheckoutButton>

                <PaymentMethods>
                  <PaymentLabel>We Accept:</PaymentLabel>
                  <PaymentIcons>
                    <PaymentIcon>💳</PaymentIcon>
                    <PaymentIcon>💰</PaymentIcon>
                    <PaymentIcon>📱</PaymentIcon>
                  </PaymentIcons>
                </PaymentMethods>
              </SummaryCard>

              <PromoCard>
                <PromoIcon></PromoIcon>
                <PromoTitle>Free Shipping</PromoTitle>
                <PromoText>On orders over {formatCurrency(settings.freeShippingThreshold)}</PromoText>
              </PromoCard>

              <PromoCard>
                <PromoIcon></PromoIcon>
                <PromoTitle>Secure Payment</PromoTitle>
                <PromoText>100% secure transaction</PromoText>
              </PromoCard>

              <PromoCard>
                <PromoIcon></PromoIcon>
                <PromoTitle>Location-Based Shipping</PromoTitle>
                <PromoText>Shipping fees are calculated based on the road distance from our supermarket at 6 Farm Road, Off Ada George, Port Harcourt to your delivery address</PromoText>
              </PromoCard>

            </CartSidebar>
          </CartLayout>
        )}
      </ContentContainer>
    </PageWrapper>
  );
};

export default Cart;

// Styled Components
const PageWrapper = styled.div`
  background: #F8F9FA;
  min-height: 100vh;
  padding-bottom: 3rem;
`;

const BreadcrumbSection = styled.div`
  background: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const BreadcrumbLink = styled(Link)`
  color: #6C9A7F;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: #636E72;
`;

const BreadcrumbCurrent = styled.span`
  color: #636E72;
`;

const EmptyState = styled.div`
  background: white;
  padding: 5rem 2rem;
  border-radius: 12px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  color: #E1E8ED;
  margin-bottom: 1rem;
  
  svg {
    width: 5rem;
    height: 5rem;
  }
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: #636E72;
  margin-bottom: 2rem;
`;

const ShopNowButton = styled.button`
  padding: 0.875rem 2rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
  }
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CartMain = styled.div``;

const CartTable = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 45% 15% 20% 15% 5%;
  padding: 1.5rem 2rem;
  background: #6C9A7F;
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const HeaderCell = styled.div<{ $width?: string }>`
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableBody = styled.div`
  padding: 1rem;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 45% 15% 20% 15% 5%;
  padding: 1.5rem 1rem;
  align-items: center;
  border-bottom: 1px solid #E1E8ED;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: #F8F9FA;
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProductName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #2D3436;
`;

const ProductCategory = styled.div`
  font-size: 0.875rem;
  color: #999;
`;

const StockWarning = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #FF9800;
  margin-top: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #FFF3E0;
  border-radius: 4px;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const StockInfo = styled.div`
  font-size: 0.75rem;
  color: #636E72;
  margin-top: 0.25rem;
  text-align: center;
`;

const PriceCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Price = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #6C9A7F;
`;

const OriginalPrice = styled.div`
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
`;

const QuantityCell = styled.div``;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #F8F9FA;
  border: 1px solid #E1E8ED;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #636E72;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #6C9A7F;
    border-color: #6C9A7F;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const QuantityDisplay = styled.div`
  width: 40px;
  text-align: center;
  font-weight: 600;
  color: #2D3436;
`;

const SubtotalCell = styled.div``;

const Subtotal = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
`;

const RemoveCell = styled.div`
  text-align: right;
`;

const RemoveButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F8F9FA;
  border: 1px solid #E1E8ED;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #636E72;
  transition: all 0.3s ease;
  
  &:hover {
    background: #FF6B6B;
    border-color: #FF6B6B;
    color: white;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const CartActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const ContinueShoppingLink = styled(Link)`
  color: #6C9A7F;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ClearCartButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  color: #E74C3C;
  border: 2px solid #E74C3C;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #E74C3C;
    color: white;
  }
`;

const CouponSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
`;

const CouponTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 1rem;
`;

const CouponForm = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CouponInput = styled.input`
  flex: 1;
  padding: 0.875rem 1rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  
  &:focus {
    border-color: #6C9A7F;
  }
`;

const ApplyCouponButton = styled.button`
  padding: 0.875rem 2rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #5A8569;
  }
`;

const CartSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SummaryCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  position: sticky;
  top: 100px;
`;

const SummaryTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const SummaryValue = styled.div<{ $free?: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.$free ? '#6C9A7F' : '#2D3436'};
`;

const ShippingNote = styled.div`
  font-size: 0.75rem;
  color: #6C9A7F;
  background: #E8F5EC;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
`;

const Divider = styled.div`
  height: 1px;
  background: #E1E8ED;
  margin: 1.5rem 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const TotalLabel = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
`;

const TotalValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #6C9A7F;
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
`;

const PaymentMethods = styled.div`
  text-align: center;
`;

const PaymentLabel = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.5rem;
`;

const PaymentIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

const PaymentIcon = styled.div`
  font-size: 1.5rem;
`;

const PromoCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
`;

const PromoIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const PromoTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const PromoText = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;
