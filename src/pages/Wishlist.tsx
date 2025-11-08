import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { FiX, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      imageUrl: item.imageUrl,
      categoryName: item.categoryName,
      stock: item.stock,
    });
  };

  const handleAddAllToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        imageUrl: item.imageUrl,
        categoryName: item.categoryName,
        stock: item.stock,
      });
    });
  };

  const shareLink = `${window.location.origin}/wishlist`;

  return (
    <PageWrapper>
      <BreadcrumbSection>
        <ContentContainer>
          <PageTitle>Wishlist</PageTitle>
          <Breadcrumb>
            <BreadcrumbLink to="/">Home</BreadcrumbLink>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbCurrent>Wishlist</BreadcrumbCurrent>
          </Breadcrumb>
        </ContentContainer>
      </BreadcrumbSection>

      <ContentContainer>
        {wishlistItems.length === 0 ? (
          <EmptyState
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EmptyIcon>♥</EmptyIcon>
            <EmptyTitle>Your Wishlist is Empty</EmptyTitle>
            <EmptyText>Add items you love to your wishlist. Review them anytime and easily move them to cart.</EmptyText>
            <Link to="/products">
              <ShopNowButton>Continue Shopping</ShopNowButton>
            </Link>
          </EmptyState>
        ) : (
          <>
            <WishlistTable>
              <TableHeader>
                <HeaderCell $width="50%">Product</HeaderCell>
                <HeaderCell $width="15%">Price</HeaderCell>
                <HeaderCell $width="15%">Date Added</HeaderCell>
                <HeaderCell $width="12%">Stock Status</HeaderCell>
                <HeaderCell $width="8%"></HeaderCell>
              </TableHeader>

              <TableBody>
                {wishlistItems.map((item, index) => (
                  <TableRow
                    key={item.id}
                    as={motion.div}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCell>
                      <RemoveButton onClick={() => removeFromWishlist(item.id)}>
                        <FiX />
                      </RemoveButton>
                      <ProductImage src={item.imageUrl} alt={item.name} />
                      <ProductInfo>
                        <ProductName>{item.name}</ProductName>
                        <ProductWeight>{item.categoryName}</ProductWeight>
                      </ProductInfo>
                    </ProductCell>

                    <PriceCell>
                      <Price>${item.price.toFixed(2)}</Price>
                    </PriceCell>

                    <DateCell>
                      <DateText>{item.dateAdded}</DateText>
                    </DateCell>

                    <StockCell>
                      <StockBadge $inStock={item.stock > 0}>
                        {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </StockBadge>
                    </StockCell>

                    <ActionCell>
                      <AddToCartButton
                        onClick={() => handleAddToCart(item)}
                        disabled={item.stock === 0}
                      >
                        Add to Cart
                      </AddToCartButton>
                    </ActionCell>
                  </TableRow>
                ))}
              </TableBody>
            </WishlistTable>

            <ActionsBar>
              <ShareSection>
                <ShareLabel>Wishlist link:</ShareLabel>
                <ShareInput value={shareLink} readOnly />
                <CopyButton>Copy Link</CopyButton>
              </ShareSection>

              <ButtonGroup>
                <ClearWishlistButton onClick={clearWishlist}>
                  Clear Wishlist
                </ClearWishlistButton>
                <AddAllToCartButton onClick={handleAddAllToCart}>
                  <FiShoppingCart />
                  Add All to Cart
                </AddAllToCartButton>
              </ButtonGroup>
            </ActionsBar>
          </>
        )}
      </ContentContainer>
    </PageWrapper>
  );
};

export default Wishlist;

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
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: #636E72;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
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

const WishlistTable = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 50% 15% 15% 12% 8%;
  padding: 1.5rem 2rem;
  background: #FFC107;
  font-weight: 700;
  font-size: 0.875rem;
  color: #2D3436;
  
  @media (max-width: 1024px) {
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
  grid-template-columns: 50% 15% 15% 12% 8%;
  padding: 1.5rem 1rem;
  align-items: center;
  border-bottom: 1px solid #E1E8ED;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
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
  flex-shrink: 0;
  
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

const ProductWeight = styled.div`
  font-size: 0.875rem;
  color: #999;
`;

const PriceCell = styled.div``;

const Price = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
`;

const DateCell = styled.div``;

const DateText = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const StockCell = styled.div``;

const StockBadge = styled.span<{ $inStock: boolean }>`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => props.$inStock ? '#E8F5EC' : '#FFEBEE'};
  color: ${props => props.$inStock ? '#6C9A7F' : '#E74C3C'};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const ActionCell = styled.div``;

const AddToCartButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: #5A8569;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #E1E8ED;
    color: #999;
    cursor: not-allowed;
  }
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ShareSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ShareLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #2D3436;
  white-space: nowrap;
`;

const ShareInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #636E72;
  background: #F8F9FA;
  outline: none;
`;

const CopyButton = styled.button`
  padding: 0.75rem 1.5rem;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const ClearWishlistButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  color: #E74C3C;
  border: 2px solid #E74C3C;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #E74C3C;
    color: white;
  }
`;

const AddAllToCartButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;
