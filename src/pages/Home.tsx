import React, { useState, useRef, useEffect } from 'react';
import styled, { ThemeProvider, DefaultTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { theme as globalTheme } from '../theme';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import toast from '../components/common/Toast';
import { productService, Product } from '../services/productService';

// Styled Components
const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
`;

const DealCard = styled(ProductCard)`
  position: relative;
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'popular'>('featured');
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);
  
  // Real data states
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [featured, bestsellers, popular] = await Promise.all([
        productService.getFeaturedProducts(6),
        productService.getBestSellers(6),
        productService.getPopularProducts(6),
      ]);
      
      setFeaturedProducts(featured);
      setBestSellerProducts(bestsellers);
      setPopularProducts(popular);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Scroll functions for categories
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? categoriesScrollRef.current.scrollLeft - scrollAmount
        : categoriesScrollRef.current.scrollLeft + scrollAmount;
      
      categoriesScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Add to cart handler
  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.replace('$', '')),
      originalPrice: product.oldPrice ? parseFloat(product.oldPrice.replace('$', '')) : undefined,
      imageUrl: product.imageUrl,
      categoryName: product.category,
      stock: 100
    }, 1);
  };

  // Get products based on active tab
  const getDisplayedProducts = () => {
    switch (activeTab) {
      case 'featured':
        return featuredProducts;
      case 'bestsellers':
        return bestSellerProducts;
      case 'popular':
        return popularProducts;
      default:
        return featuredProducts;
    }
  };

  // Scroll function for products
  const scrollProducts = (direction: 'left' | 'right') => {
    if (productsScrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? productsScrollRef.current.scrollLeft - scrollAmount
        : productsScrollRef.current.scrollLeft + scrollAmount;
      
      productsScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <ThemeProvider theme={globalTheme as unknown as DefaultTheme}>
      <HomeContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroWrapper>
          {/* Left Content */}
          <LeftContent>
            <ServiceTag>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Food Deliver Service & Restaurant
            </ServiceTag>
            
            <HeroHeadingWrapper>
              <MainHeadingPrimary>Get fresh Grocery</MainHeadingPrimary>
              <MainHeadingSecondary>Enjoy healty life.</MainHeadingSecondary>
            </HeroHeadingWrapper>

            <SearchWrapper>
              <CategoryDropdown value={selectedCategory} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}>
                <option value="">Select Category</option>
                <option value="fresh-produce">Fresh Produce</option>
                <option value="dairy">Dairy & Eggs</option>
                <option value="meat">Meat & Seafood</option>
                <option value="bakery">Bakery</option>
              </CategoryDropdown>
              <ShopButton to="/products">Shop Now</ShopButton>
            </SearchWrapper>
            
            <SignUpLink>
              Not yet Member? <Link to="/register">Sign Up Now</Link>
            </SignUpLink>

            <CustomerSection>
              <AvatarGroup>
                <img src="https://i.pravatar.cc/40?img=1" alt="Customer" />
                <img src="https://i.pravatar.cc/40?img=2" alt="Customer" />
                <img src="https://i.pravatar.cc/40?img=3" alt="Customer" />
              </AvatarGroup>
              <CustomerInfo>
                <CustomerLabel>Our Happy Customer</CustomerLabel>
                <RatingText>
                  ⭐ 4.5 <span>(8.4k Reviews)</span>
                </RatingText>
              </CustomerInfo>
            </CustomerSection>

            <AppDownload>
              <AppLabel>Download App</AppLabel>
              <AppButtons>
                <PlayStoreButton href="https://play.google.com" target="_blank">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <StoreTextWrapper>
                    <StoreSmallText>GET IT ON</StoreSmallText>
                    <StoreBigText>Google Play</StoreBigText>
                  </StoreTextWrapper>
                </PlayStoreButton>
                <AppStoreButton href="https://apps.apple.com" target="_blank">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                  </svg>
                  <StoreTextWrapper>
                    <StoreSmallText>Download on the</StoreSmallText>
                    <StoreBigText>App Store</StoreBigText>
                  </StoreTextWrapper>
                </AppStoreButton>
              </AppButtons>
            </AppDownload>
          </LeftContent>

          {/* Right - Hero Image Area */}
          <RightImageArea>
            <CurvyBackground />
            <HeroImageWrapper>
              <MainHeroImage src="/hero-image.png" alt="Person with groceries" />
            </HeroImageWrapper>
          </RightImageArea>
        </HeroWrapper>
      </HeroSection>

      {/* Feature Cards Section */}
      <FeatureCardsSection>
        <ContentContainer>
          <FeatureCardsGrid>
            <FeatureCard $bgColor="#E8F5EC">
              <FeatureCardImage src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80" alt="Vegetables" />
              <FeatureCardBadge>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6C9A7F" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </FeatureCardBadge>
              <FeatureCardContent>
                <FeatureCardLabel>Fresh & Healthy</FeatureCardLabel>
                <FeatureCardTitle>VEGETABLES</FeatureCardTitle>
                <FeatureCardButton to="/products?category=vegetables">Shop Now →</FeatureCardButton>
              </FeatureCardContent>
            </FeatureCard>

            <FeatureCard $bgColor="#FFF4E6">
              <FeatureCardImage src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop&q=80" alt="Vegetables" />
              <FeatureCardBadge>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2">
                  <path d="M12 2v20M2 12h20"/>
                </svg>
              </FeatureCardBadge>
              <FeatureCardContent>
                <FeatureCardLabel>Organic & Natural</FeatureCardLabel>
                <FeatureCardTitle>VEGETABLES</FeatureCardTitle>
                <FeatureCardButton to="/products?category=vegetables">Shop Now →</FeatureCardButton>
              </FeatureCardContent>
            </FeatureCard>

            <FeatureCard $bgColor="#F0F7FF">
              <FeatureCardImage src="https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&auto=format&fit=crop&q=80" alt="Vegetables" />
              <FeatureCardBadge>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </FeatureCardBadge>
              <FeatureCardContent>
                <FeatureCardLabel>Farm Fresh Daily</FeatureCardLabel>
                <FeatureCardTitle>VEGETABLES</FeatureCardTitle>
                <FeatureCardButton to="/products?category=vegetables">Shop Now →</FeatureCardButton>
              </FeatureCardContent>
            </FeatureCard>
          </FeatureCardsGrid>
        </ContentContainer>
      </FeatureCardsSection>

      {/* Top Categories */}
      <CategoriesSection>
        <ContentContainer>
          <SectionHeader>
            <SectionTitle>Top Categories</SectionTitle>
            <SectionNav>
              <NavArrow onClick={() => scrollCategories('left')}>
                <FiChevronLeft />
              </NavArrow>
              <NavArrow onClick={() => scrollCategories('right')}>
                <FiChevronRight />
              </NavArrow>
            </SectionNav>
          </SectionHeader>

          <CategoriesGrid ref={categoriesScrollRef}>
            <CategoryBox $bgColor="#E8F5EC">
              <CategoryIcon>🥬</CategoryIcon>
              <CategoryLabel>Vegetables</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#FFEAEA">
              <CategoryIcon>☕</CategoryIcon>
              <CategoryLabel>Coffee & Drinks</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#FFF4E6">
              <CategoryIcon>🥛</CategoryIcon>
              <CategoryLabel>Milk & Dairy</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#F0F7FF">
              <CategoryIcon>🍖</CategoryIcon>
              <CategoryLabel>Meat & Fish</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#FFF0F5">
              <CategoryIcon>🍓</CategoryIcon>
              <CategoryLabel>Fresh Fruits</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#F5F0FF">
              <CategoryIcon>🧼</CategoryIcon>
              <CategoryLabel>Cleaning Essentials</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#FFE5E5">
              <CategoryIcon>🍞</CategoryIcon>
              <CategoryLabel>Bakery</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#E5F5FF">
              <CategoryIcon>🐟</CategoryIcon>
              <CategoryLabel>Seafood</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#F0FFE5">
              <CategoryIcon>🥤</CategoryIcon>
              <CategoryLabel>Beverages</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#FFF5E5">
              <CategoryIcon>🍿</CategoryIcon>
              <CategoryLabel>Snacks</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#FFE5F0">
              <CategoryIcon>🍦</CategoryIcon>
              <CategoryLabel>Frozen Foods</CategoryLabel>
            </CategoryBox>
            <CategoryBox $bgColor="#E5FFE5">
              <CategoryIcon>🌿</CategoryIcon>
              <CategoryLabel>Organic</CategoryLabel>
            </CategoryBox>
          </CategoriesGrid>
        </ContentContainer>
      </CategoriesSection>

      {/* Featured Products */}
      <FeaturedProductsSection>
        <ContentContainer>
          <SectionHeader>
            <div>
              <SectionTitle>Featured Products</SectionTitle>
              <ProductTabs>
                <ProductTab 
                  $active={activeTab === 'featured'} 
                  onClick={() => setActiveTab('featured')}
                >
                  Featured
                </ProductTab>
                <ProductTab 
                  $active={activeTab === 'bestsellers'} 
                  onClick={() => setActiveTab('bestsellers')}
                >
                  Best Sellers
                </ProductTab>
                <ProductTab 
                  $active={activeTab === 'popular'} 
                  onClick={() => setActiveTab('popular')}
                >
                  Popular
                </ProductTab>
              </ProductTabs>
            </div>
            <SectionNav>
              <NavArrow onClick={() => scrollProducts('left')}>
                <FiChevronLeft />
              </NavArrow>
              <NavArrow onClick={() => scrollProducts('right')}>
                <FiChevronRight />
              </NavArrow>
            </SectionNav>
          </SectionHeader>

          <ProductsGrid ref={productsScrollRef}>
            {getDisplayedProducts().map((product) => (
              <ProductCard key={product.id} onClick={() => navigate(`/products/${product.id}`)}>
                <ProductImage src={product.imageUrl} alt={product.name} />
                <ProductInfo>
                  <ProductCategory>{product.category}</ProductCategory>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>
                    <CurrentPrice>{product.price}</CurrentPrice>
                    {product.oldPrice && <OldPrice>{product.oldPrice}</OldPrice>}
                  </ProductPrice>
                  <Rating>
                    ⭐⭐⭐⭐⭐ <span>({product.rating})</span>
                  </Rating>
                  <AddToCartBtn onClick={(e) => handleAddToCart(e, product)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Add to Cart
                  </AddToCartBtn>
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductsGrid>
        </ContentContainer>
      </FeaturedProductsSection>

      {/* Promotional Banners */}
      <PromoBannersSection>
        <ContentContainer>
          <PromoBannersGrid>
            <PromoBanner $bgColor="#E8F5EC">
              <PromoContent>
                <PromoLabel>Fresh Everyday</PromoLabel>
                <PromoTitle>Fresh Vegetable</PromoTitle>
                <PromoButton to="/products?category=vegetables">Shop Now →</PromoButton>
              </PromoContent>
              <PromoImage src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&auto=format&fit=crop&q=80" alt="Vegetables" />
            </PromoBanner>

            <PromoBanner $bgColor="#2D3436">
              <PromoContent>
                <PromoLabel $light>Save Up to 30%</PromoLabel>
                <PromoTitle $light>All Tested Organic & Fresh Products</PromoTitle>
                <PromoButton to="/products">Shop Now →</PromoButton>
              </PromoContent>
              <PromoImage src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&auto=format&fit=crop&q=80" alt="Organic" />
            </PromoBanner>
          </PromoBannersGrid>
        </ContentContainer>
      </PromoBannersSection>

      {/* Deal of the Week */}
      <DealsSection>
        <ContentContainer>
          <SectionHeader>
            <SectionTitle>Deal Of The Week</SectionTitle>
            <SectionNav>
              <NavArrow>←</NavArrow>
              <NavArrow>→</NavArrow>
            </SectionNav>
          </SectionHeader>

          <DealsGrid>
            <DealCard>
              <DealImage src="https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&auto=format&fit=crop&q=80" alt="Deal" />
              <DealBadge>Sale 50%</DealBadge>
              <DealInfo>
                <DealName>Prepays</DealName>
                <DealPrice>
                  <DealCurrentPrice>$4.99</DealCurrentPrice>
                  <DealOldPrice>$9.99</DealOldPrice>
                </DealPrice>
                <DealRating>⭐⭐⭐⭐⭐ <span>(4.8)</span></DealRating>
                <DealButton>Shop Now →</DealButton>
              </DealInfo>
            </DealCard>

            <DealCard>
              <DealImage src="https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=300&auto=format&fit=crop&q=80" alt="Deal" />
              <DealBadge $bgColor="#FF9800">Best Sale</DealBadge>
              <DealInfo>
                <DealName>Green Peas</DealName>
                <DealPrice>
                  <DealCurrentPrice>$2.49</DealCurrentPrice>
                  <DealOldPrice>$4.49</DealOldPrice>
                </DealPrice>
                <DealRating>⭐⭐⭐⭐⭐ <span>(4.9)</span></DealRating>
                <DealButton>Shop Now →</DealButton>
              </DealInfo>
            </DealCard>

            <DealCard>
              <DealImage src="https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=300&auto=format&fit=crop&q=80" alt="Deal" />
              <DealBadge $bgColor="#6C9A7F">Hot</DealBadge>
              <DealInfo>
                <DealName>Tomato Sauce</DealName>
                <DealPrice>
                  <DealCurrentPrice>$6.99</DealCurrentPrice>
                  <DealOldPrice>$9.99</DealOldPrice>
                </DealPrice>
                <DealRating>⭐⭐⭐⭐⭐ <span>(5.0)</span></DealRating>
                <DealButton>Shop Now →</DealButton>
              </DealInfo>
            </DealCard>

            <DealCard>
              <DealImage src="https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&auto=format&fit=crop&q=80" alt="Deal" />
              <DealBadge $bgColor="#6C9A7F">Fresh</DealBadge>
              <DealInfo>
                <DealName>Tea Bag</DealName>
                <DealPrice>
                  <DealCurrentPrice>$7.99</DealCurrentPrice>
                  <DealOldPrice>$12.99</DealOldPrice>
                </DealPrice>
                <DealRating>⭐⭐⭐⭐⭐ <span>(4.7)</span></DealRating>
                <DealButton>Shop Now →</DealButton>
              </DealInfo>
            </DealCard>
          </DealsGrid>
        </ContentContainer>
      </DealsSection>
      </HomeContainer>
    </ThemeProvider>
  );
};

export default Home;

// Styled Components
const HomeContainer = styled.div`
  width: 100%;
  overflow-x: hidden;
`;

// Hero Section Styled Components - COMPLETELY REBUILT
const HeroSection = styled.section`
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background: linear-gradient(135deg, #2a5040 0%, #3d7a60 100%);
  position: relative;
  overflow: hidden;
  min-height: 75vh;
  
  /* Background glow effects like reference */
  &::before {
    content: '';
    position: absolute;
    top: 15%;
    right: 30%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255, 107, 107, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    right: 20%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(82, 196, 26, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }
  
  @media (min-width: 1024px) {
    min-height: 90vh;
    
    &::before {
      width: 500px;
      height: 500px;
      right: 25%;
    }
    
    &::after {
      width: 400px;
      height: 400px;
      right: 15%;
    }
  }
`;

const HeroWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  min-height: 70vh;
  position: relative;
  z-index: 1;
  
  @media (min-width: 640px) {
    min-height: 75vh;
  }

  @media (min-width: 768px) {
    min-height: 80vh;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 45% 55%;
    min-height: 85vh;
  }
  
  @media (min-width: 1280px) {
    min-height: 90vh;
  }
`;

const LeftContent = styled.div`
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  z-index: 10;
  
  @media (min-width: 640px) {
    padding: 2.5rem 2rem;
    gap: 1.2rem;
  }
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
    gap: 1.3rem;
  }
  
  @media (min-width: 1024px) {
    padding: 3.5rem 2rem 3.5rem 3rem;
    gap: 1.5rem;
  }
  
  @media (min-width: 1280px) {
    padding: 4rem 2rem 4rem 4rem;
  }
`;

const RightImageArea = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem 1rem 0;
  
  @media (min-width: 640px) {
    padding: 2rem 1.5rem 0;
  }
  
  @media (min-width: 768px) {
    padding: 2rem 2rem 0;
  }
  
  @media (min-width: 1024px) {
    padding: 2.5rem 2rem 0;
    align-items: flex-end;
    justify-content: center;
  }
`;

const CurvyBackground = styled.div`
  position: absolute;
  width: 450px;
  height: 450px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px);
  border-radius: 45% 55% 60% 40% / 50% 45% 55% 50%;
  z-index: 1;
  animation: morphShape 8s ease-in-out infinite;
  
  @keyframes morphShape {
    0%, 100% {
      border-radius: 45% 55% 60% 40% / 50% 45% 55% 50%;
    }
    25% {
      border-radius: 60% 40% 50% 50% / 45% 60% 40% 55%;
    }
    50% {
      border-radius: 50% 50% 45% 55% / 55% 50% 50% 45%;
    }
    75% {
      border-radius: 55% 45% 55% 45% / 50% 55% 45% 50%;
    }
  }
  
  @media (min-width: 768px) {
    width: 550px;
    height: 550px;
  }
  
  @media (min-width: 1024px) {
    width: 600px;
    height: 600px;
  }
`;

const ServiceTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  padding: 0.65rem 1.3rem;
  border-radius: 30px;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  max-width: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.15);

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.9;
  }
`;

const HeroHeadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const MainHeadingPrimary = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2.3rem, 6vw, 3.6rem);
  font-weight: 700;
  line-height: 1.15;
  color: white;
  margin: 0;
  letter-spacing: -0.5px;
  white-space: nowrap;
  
  @media (min-width: 1024px) {
    font-size: clamp(3.2rem, 5vw, 4rem);
  }
`;

const MainHeadingSecondary = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.8rem, 5vw, 2.4rem);
  font-weight: 100;
  line-height: 1.25;
  color: white;
  margin: 0;
  letter-spacing: -0.2px;
  
  @media (min-width: 1024px) {
    font-size: clamp(2rem, 3.5vw, 2.6rem);
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
`;

const CategoryDropdown = styled.select`
  flex: 1;
  min-width: 150px;
  padding: 0.75rem 0.8rem 0.75rem 2.5rem;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  background: rgba(45, 95, 74, 0.6);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.85rem;
  font-weight: 500;
  
  @media (min-width: 640px) {
    min-width: 170px;
    padding: 0.8rem 0.9rem 0.8rem 2.7rem;
    font-size: 0.875rem;
  }
  
  @media (min-width: 1024px) {
    min-width: 180px;
    padding: 0.85rem 1rem 0.85rem 2.8rem;
    font-size: 0.9rem;
  }
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 0.75rem center;
  background-size: 18px;

  &:hover {
    background-color: rgba(45, 95, 74, 0.8);
    border-color: rgba(255, 255, 255, 0.4);
  }

  option {
    background: #2d5f4a;
    color: white;
    padding: 0.5rem;
  }
`;

const ShopButton = styled(Link)`
  padding: 0.75rem 2rem;
  background: #FFD700;
  color: #2D3436;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
  
  @media (min-width: 640px) {
    padding: 0.8rem 2.2rem;
    font-size: 0.9rem;
  }
  
  @media (min-width: 1024px) {
    padding: 0.9rem 2.5rem;
    font-size: 0.95rem;
  }
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);

  &:hover {
    background: #FFC700;
    color:#ffffff;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  }
`;

const SignUpLink = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin-bottom: 2rem;

  a {
    color: #FFD700;
    font-weight: 600;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const CustomerSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 15px;
  max-width: fit-content;
`;

const AvatarGroup = styled.div`
  display: flex;
  align-items: center;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid white;
    margin-left: -10px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CustomerLabel = styled.div`
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const RatingText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #52C41A;
  font-size: 0.85rem;
  font-weight: 600;
  
  span {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
  }
`;

const AppDownload = styled.div`
  margin-top: 0;
`;

const AppLabel = styled.div`
  color: white;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
`;

const AppButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const PlayStoreButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.2rem;
  background: rgba(45, 95, 74, 0.8);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(45, 95, 74, 1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
  
  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
`;

const AppStoreButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1.2rem;
  background: rgba(45, 95, 74, 0.8);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(45, 95, 74, 1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
  
  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
`;

const StoreTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
`;

const StoreSmallText = styled.span`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const StoreBigText = styled.span`
  font-size: 0.95rem;
  color: white;
  font-weight: 600;
`;

// Hero Image Components
const HeroImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const MainHeroImage = styled.img`
  width: 100%;
  max-width: 350px;
  height: auto;
  object-fit: contain;
  object-position: bottom center;
  position: relative;
  z-index: 5;
  
  @media (min-width: 480px) {
    max-width: 400px;
  }
  
  @media (min-width: 640px) {
    max-width: 450px;
  }
  
  @media (min-width: 768px) {
    max-width: 500px;
  }
  
  @media (min-width: 1024px) {
    width: 100%;
    max-width: none;
    height: 70vh;
    object-fit: cover;
    object-position: center bottom;
  }

  @media (min-width: 1280px) {
    height: 80vh;
  }
`;

interface BadgeProps {
  $top?: string;
  $bottom?: string;
  $left?: string;
  $right?: string;
  $bg?: string;
  $size?: string;
}

const Badge = styled.div<BadgeProps>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.8rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 10;
  animation: float 3s ease-in-out infinite;
  backdrop-filter: blur(5px);
  
  ${props => props.$top && `top: ${props.$top};`}
  ${props => props.$bottom && `bottom: ${props.$bottom};`}
  ${props => props.$left && `left: ${props.$left};`}
  ${props => props.$right && `right: ${props.$right};`}
  ${props => props.$bg && `background: ${props.$bg};`}
  ${props => props.$size && `width: ${props.$size}; height: ${props.$size};`}
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-12px);
    }
  }
`;

// Content Container
const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

// Feature Cards Section
const FeatureCardsSection = styled.section`
  padding: 3rem 0;
  background: #F8F9FA;
`;

const FeatureCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div<{ $bgColor: string }>`
  background: ${props => props.$bgColor};
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureCardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
`;

const FeatureCardBadge = styled.div`
  position: absolute;
  top: 2.5rem;
  right: 2.5rem;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const FeatureCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FeatureCardLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  font-weight: 500;
`;

const FeatureCardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const FeatureCardButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  width: fit-content;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
    transform: translateX(5px);
  }
`;

// Categories Section
const CategoriesSection = styled.section`
  padding: 4rem 0;
  background: white;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const SectionNav = styled.div`
  display: flex;
  gap: 0.5rem;
`;
const NavArrow = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #DDD;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 20px;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: #6C9A7F;
    color: white;
    border-color: #6C9A7F;
    transform: scale(1.1);
  }
`;

const CategoriesGrid = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1rem;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const CategoryBox = styled.div<{ $bgColor: string }>`
  background: ${props => props.$bgColor};
  padding: 2rem 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-width: 150px;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

const CategoryIcon = styled.div`
  font-size: 3rem;
`;

const CategoryLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #2D3436;
  text-align: center;
`;

// Featured Products Section
const FeaturedProductsSection = styled.section`
  padding: 4rem 0;
  background: #F8F9FA;
`;

const ProductTabs = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
`;
const ProductTab = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  color: ${props => props.$active ? '#6C9A7F' : '#636E72'};
  font-size: 1rem;
  font-weight: ${props => props.$active ? '600' : '500'};
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${props => props.$active ? '#6C9A7F' : 'transparent'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    color: #6C9A7F;
  }
`;
const ProductsGrid = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1rem;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  /* Make product cards have minimum width */
  > div {
    min-width: 320px;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
    
    > div {
      min-width: 280px;
    }
  }
`;


const ProductImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductCategory = styled.div`
  font-size: 0.75rem;
  color: #636E72;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0 0 0.75rem 0;
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const CurrentPrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #6C9A7F;
`;

const OldPrice = styled.span`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
`;

const Rating = styled.div`
  font-size: 0.875rem;
  color: #FFC107;
  margin-bottom: 1rem;
  
  span {
    color: #636E72;
    margin-left: 0.25rem;
  }
`;

const AddToCartBtn = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
  }
`;

// Promo Banners Section
const PromoBannersSection = styled.section`
  padding: 4rem 0;
  background: white;
`;

const PromoBannersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PromoBanner = styled.div<{ $bgColor: string }>`
  background: ${props => props.$bgColor};
  border-radius: 16px;
  padding: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  overflow: hidden;
  position: relative;
`;

const PromoContent = styled.div`
  flex: 1;
  z-index: 2;
`;

const PromoLabel = styled.div<{ $light?: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.$light ? 'rgba(255,255,255,0.8)' : '#636E72'};
  margin-bottom: 0.5rem;
`;

const PromoTitle = styled.h3<{ $light?: boolean }>`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${props => props.$light ? 'white' : '#2D3436'};
  margin: 0 0 1.5rem 0;
  line-height: 1.3;
`;

const PromoButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
    transform: translateX(5px);
  }
`;

const PromoImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  
  @media (max-width: 640px) {
    width: 150px;
    height: 150px;
  }
`;

// Deals Section
const DealsSection = styled.section`
  padding: 4rem 0;
  background: #F8F9FA;
`;

const DealsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DealImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const DealBadge = styled.div<{ $bgColor?: string }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  background: ${props => props.$bgColor || '#FF6B6B'};
  color: white;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const DealInfo = styled.div`
  padding: 1.5rem;
`;

const DealName = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0 0 0.75rem 0;
`;

const DealPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const DealCurrentPrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #6C9A7F;
`;

const DealOldPrice = styled.span`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
`;

const DealRating = styled.div`
  font-size: 0.875rem;
  color: #FFC107;
  margin-bottom: 1rem;
  
  span {
    color: #636E72;
    margin-left: 0.25rem;
  }
`;

const DealButton = styled.button`
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
  }
`;
