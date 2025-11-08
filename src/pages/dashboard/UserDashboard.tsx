import React from 'react';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../services/api';
import { Product } from '../../types';

// Mock Data
const categories = [
  { name: 'Donuts', icon: '🍩' },
  { name: 'Burger', icon: '🍔' },
  { name: 'Ice', icon: '🍦' },
  { name: 'Potato', icon: '🍟' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Hot dog', icon: '🌭' },
  { name: 'Chicken', icon: '🍗' },
];



// Styled Components
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
`;

const MainContent = styled.div``;

const InvoiceSidebar = styled.aside`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  flex: 1;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  svg {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-right: 0.5rem;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 1rem;
`;

const FilterButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
`;

const Tab = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
`;

const CategoryCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  }
`;

const CategoryIcon = styled.div`
  font-size: 2rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Price = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const WishlistButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

const OrderButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

const UserDashboard: React.FC = () => {
  const { cartItems, getCartTotal, addToCart } = useCart();

  const { data: productsResponse, isLoading, isError } = useQuery<{ data: Product[], count: number }, Error>({
    queryKey: ['featuredProducts'],
    queryFn: () => fetchProducts({ isFeatured: true, limit: 6 })
  });

  const products = productsResponse?.data;

  const subtotal = getCartTotal();
  // Using a fixed 6% tax for demonstration
  const tax = subtotal * 0.06;
  const total = subtotal + tax;
  return (
    <DashboardGrid>
      <MainContent>
        <Header>
          <SearchContainer>
            <FiSearch />
            <SearchInput type="text" placeholder="Search food" />
          </SearchContainer>
          <FilterButton>Filter</FilterButton>
        </Header>
        <Section>
          <SectionHeader>
            <SectionTitle>Explore Categories</SectionTitle>
          </SectionHeader>
          <CategoriesGrid>
            {categories.map((category) => (
              <CategoryCard key={category.name}>
                <CategoryIcon>{category.icon}</CategoryIcon>
                <span>{category.name}</span>
              </CategoryCard>
            ))}
          </CategoriesGrid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Popular</SectionTitle>
            <Tab>Recent</Tab>
          </SectionHeader>
          <ProductsGrid>
            {isLoading && <p>Loading products...</p>}
            {isError && <p>Error fetching products.</p>}
            {products && products.map((product) => (
              <ProductCard key={product.id}>
                <ProductImage src={product.imageUrl} alt={product.name} />
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <Price>${product.price.toFixed(2)}</Price>
                  <Actions>
                    <WishlistButton>Wishlist</WishlistButton>
                    <OrderButton onClick={() => addToCart(product)}>Order Now</OrderButton>
                  </Actions>
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductsGrid>
        </Section>
      </MainContent>
      <InvoiceSidebar>
        <InvoiceHeader>
          <SectionTitle>Invoice</SectionTitle>
        </InvoiceHeader>
        <InvoiceItems>
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <InvoiceItem key={item.id}>
                <ItemImage src={item.imageUrl} alt={item.name} />
                <ItemInfo>
                  <ItemName>{item.name} (x{item.quantity})</ItemName>
                  <ItemPrice>${item.price.toFixed(2)}</ItemPrice>
                </ItemInfo>
              </InvoiceItem>
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}
        </InvoiceItems>
        {cartItems.length > 0 && (
          <PaymentSummary>
            <SummaryRow>
              <span>Sub Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Tax (6%)</span>
              <span>${tax.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow total>
              <span>Total Payment</span>
              <span>${total.toFixed(2)}</span>
            </SummaryRow>
          </PaymentSummary>
        )}
        <PaymentMethods>
          <SectionTitle>Payment Method</SectionTitle>
          <MethodsGrid>
            <PaymentMethodCard><img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" alt="Paypal" /></PaymentMethodCard>
            <PaymentMethodCard><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" /></PaymentMethodCard>
            <PaymentMethodCard><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1200px-MasterCard_Logo.svg.png" alt="Mastercard" /></PaymentMethodCard>
          </MethodsGrid>
        </PaymentMethods>
        <PlaceOrderButton>Place An Order Now</PlaceOrderButton>
      </InvoiceSidebar>
    </DashboardGrid>
  );
};

const InvoiceHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const InvoiceItems = styled.div`
  margin-bottom: 1.5rem;
`;

const InvoiceItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const ItemImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-right: 1rem;
`;

const ItemInfo = styled.div``;

const ItemName = styled.div`
  font-weight: 500;
`;

const ItemPrice = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const PaymentSummary = styled.div`
  margin-bottom: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 1.5rem;
`;

const SummaryRow = styled.div<{
  total?: boolean
}>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: ${({ total }) => (total ? '700' : '500')};
  color: ${({ total, theme }) => (total ? theme.colors.text.primary : theme.colors.text.secondary)};
`;

const PaymentMethods = styled.div`
  margin-bottom: 1.5rem;
`;

const MethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const PaymentMethodCard = styled.div`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  img {
    max-width: 100%;
    height: 25px;
    object-fit: contain;
  }
`;

const PlaceOrderButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
`;

export default UserDashboard;

