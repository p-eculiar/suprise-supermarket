import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { productService, Product } from '../services/productService';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { FaTruck, FaCreditCard, FaHeadset } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import toast from '../components/common/Toast';

// Mock categories
const categories = [
  { id: '1', name: 'Vegetables', slug: 'vegetables', count: 165 },
  { id: '2', name: 'Fresh Fruit', slug: 'fresh-fruit', count: 137 },
  { id: '3', name: 'Milk & Dairy', slug: 'milk-dairy', count: 34 },
  { id: '4', name: 'Meat & Fish', slug: 'meat-fish', count: 56 },
  { id: '5', name: 'Dry Fruits', slug: 'dry-fruits', count: 78 },
  { id: '6', name: 'Juice', slug: 'juice', count: 89 },
];

const ratingFilters = [
  { stars: 5, count: 78 },
  { stars: 4, count: 105 },
  { stars: 3, count: 42 },
  { stars: 2, count: 18 },
  { stars: 1, count: 9 },
];

const brands = ['NestFood', 'Stouffer', 'Tyson', 'Farmfood', 'StoreBrand'];
const productTypes = ['All Products', 'Fruits Products', 'Fresh Vegetable'];

// Mock product data
const mockProducts = [
  { id: '1', name: 'Fresh Oranges', categoryName: 'Fruits', price: 11.75, originalPrice: 13.50, rating: 5.0, reviewCount: 92, imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400', stock: 10, isSale: true, salePercentage: 25 },
  { id: '2', name: 'Vegetables', categoryName: 'Vegetables', price: 8.5, originalPrice: 10.00, rating: 5.0, reviewCount: 48, imageUrl: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400', stock: 15, isSale: true, salePercentage: 25 },
  { id: '3', name: 'Fresh Pomegranate', categoryName: 'Fruits', price: 12, originalPrice: 15, rating: 5.0, reviewCount: 65, imageUrl: 'https://images.unsplash.com/photo-1615485500834-bc10199bc6dd?w=400', stock: 8, isSale: true, salePercentage: 25 },
  { id: '4', name: 'Banana', categoryName: 'Fruits', price: 14, originalPrice: 16, rating: 5.0, reviewCount: 120, imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', stock: 20, isSale: true, salePercentage: 25 },
  { id: '5', name: 'Box of Chocolates', categoryName: 'Snacks', price: 24.60, originalPrice: 28.00, rating: 5.0, reviewCount: 89, imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', stock: 12, isSale: true, salePercentage: 25 },
  { id: '6', name: 'Fresh Cabbage', categoryName: 'Vegetables', price: 8, originalPrice: 10, rating: 4.5, reviewCount: 56, imageUrl: 'https://images.unsplash.com/photo-1594282319062-e709c8b0ed52?w=400', stock: 18, isSale: true, salePercentage: 25 },
  { id: '7', name: 'Fresh Pineapple', categoryName: 'Fruits', price: 15.00, originalPrice: 20.00, rating: 5.0, reviewCount: 73, imageUrl: 'https://images.unsplash.com/photo-1550828486-856334bc2f7e?w=400', stock: 7, isSale: true, salePercentage: 25 },
  { id: '8', name: 'Fruit Jam Jar', categoryName: 'Jams', price: 7.50, originalPrice: 10.50, rating: 5.0, reviewCount: 41, imageUrl: 'https://images.unsplash.com/photo-1598512861583-8c3696f34610?w=400', stock: 25, isSale: true, salePercentage: 25 },
  { id: '9', name: 'Fresh Green Apple', categoryName: 'Fruits', price: 20.00, originalPrice: 25.00, rating: 4.0, reviewCount: 98, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', stock: 14, isSale: true, salePercentage: 25 },
];

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 100]);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // State for products from database
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, [selectedCategories, priceRange, sortBy, currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Build filters
      const filters: any = {};
      if (selectedCategories.length > 0) {
        filters.category = selectedCategories[0]; // Use first selected category
      }
      if (priceRange) {
        filters.minPrice = priceRange[0];
        filters.maxPrice = priceRange[1];
      }
      
      // Fetch products
      const allProducts = await productService.getAllProducts(filters);
      
      // Apply sorting
      let sortedProducts = [...allProducts];
      if (sortBy === 'price-low') {
        sortedProducts.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        sortedProducts.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'name') {
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
      
      setProducts(paginatedProducts);
      setTotalCount(sortedProducts.length);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName,
      stock: product.stock,
    });
  };

  const handleToggleWishlist = (product: any) => {
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName,
      stock: product.stock,
    });
  };

  // Pagination - calculated from API count
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedProducts = products;

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <PageWrapper>
      {/* Breadcrumb & Page Header */}
      <BreadcrumbSection>
        <ContentContainer>
          <PageTitle>Shop</PageTitle>
          <Breadcrumb>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbCurrent>Shop</BreadcrumbCurrent>
          </Breadcrumb>
        </ContentContainer>
      </BreadcrumbSection>

      <ContentContainer>
        <ShopLayout>
          {/* Sidebar Filters */}
          <Sidebar>
            <FilterSection>
              <FilterTitle>Filter Options</FilterTitle>
            </FilterSection>

            {/* Category Filter */}
            <FilterSection>
              <FilterSubtitle>Category</FilterSubtitle>
              {categories.map((category) => (
                <FilterCheckbox key={category.id}>
                  <input
                    type="checkbox"
                    id={`cat-${category.id}`}
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => toggleCategory(category.name)}
                  />
                  <label htmlFor={`cat-${category.id}`}>
                    {category.name}
                    <span>({category.count})</span>
                  </label>
                </FilterCheckbox>
              ))}
            </FilterSection>

            {/* Price Range Filter */}
            <FilterSection>
              <FilterSubtitle>Price</FilterSubtitle>
              <PriceRangeInputs>
                <PriceInput>
                  <span>$</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  />
                </PriceInput>
                <span>-</span>
                <PriceInput>
                  <span>$</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  />
                </PriceInput>
              </PriceRangeInputs>
              <PriceSliderContainer>
                <PriceSlider
                  type="range"
                  min="0"
                  max="150"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                />
              </PriceSliderContainer>
            </FilterSection>

            {/* Rating Filter */}
            <FilterSection>
              <FilterSubtitle>Rating</FilterSubtitle>
              {ratingFilters.map((filter) => (
                <FilterCheckbox key={filter.stars}>
                  <input
                    type="checkbox"
                    id={`rating-${filter.stars}`}
                  />
                  <label htmlFor={`rating-${filter.stars}`}>
                    <Stars>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} $filled={i < filter.stars}>★</Star>
                      ))}
                    </Stars>
                    <span>({filter.count})</span>
                  </label>
                </FilterCheckbox>
              ))}
            </FilterSection>

            {/* Brand Filter */}
            <FilterSection>
              <FilterSubtitle>Brand</FilterSubtitle>
              {brands.map((brand) => (
                <FilterCheckbox key={brand}>
                  <input type="checkbox" id={`brand-${brand}`} />
                  <label htmlFor={`brand-${brand}`}>{brand}</label>
                </FilterCheckbox>
              ))}
            </FilterSection>

            {/* Product Type Filter */}
            <FilterSection>
              <FilterSubtitle>Product Type</FilterSubtitle>
              {productTypes.map((type) => (
                <FilterCheckbox key={type}>
                  <input type="checkbox" id={`type-${type}`} />
                  <label htmlFor={`type-${type}`}>{type}</label>
                </FilterCheckbox>
              ))}
            </FilterSection>

            {/* Availability Filter */}
            <FilterSection>
              <FilterSubtitle>Availability</FilterSubtitle>
              <FilterCheckbox>
                <input type="checkbox" id="in-stock" />
                <label htmlFor="in-stock">In Stock</label>
              </FilterCheckbox>
              <FilterCheckbox>
                <input type="checkbox" id="out-of-stock" />
                <label htmlFor="out-of-stock">Out of Stock</label>
              </FilterCheckbox>
            </FilterSection>
          </Sidebar>

          {/* Main Content */}
          <MainContent>
            {/* Header with Sort */}
            <ProductsHeader>
              <ResultsText>
                {loading ? 'Loading...' : `Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, totalCount)} of ${totalCount} results`}
              </ResultsText>
              <SortContainer>
                <span>Sort by:</span>
                <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Default Sorting</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </SortSelect>
              </SortContainer>
            </ProductsHeader>

            {/* Products Grid */}
            <ProductsGrid>
              {paginatedProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  {product.isSale && <SaleBadge>-{product.salePercentage}% OFF</SaleBadge>}
                  <ProductImageWrapper onClick={() => navigate(`/products/${product.id}`)}>
                    <ProductImage src={product.imageUrl} alt={product.name} />
                    <WishlistButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWishlist(product);
                      }}
                      $active={isInWishlist(product.id)}
                    >
                      <FiHeart />
                    </WishlistButton>
                  </ProductImageWrapper>
                  <ProductInfo>
                    <ProductCategory>{product.categoryName}</ProductCategory>
                    <ProductRating>
                      <Stars>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} $filled={i < Math.floor(product.rating)}>★</Star>
                        ))}
                      </Stars>
                      <RatingValue>{product.rating.toFixed(1)}</RatingValue>
                    </ProductRating>
                    <ProductName onClick={() => navigate(`/products/${product.id}`)}>{product.name}</ProductName>
                    <ProductPriceRow>
                      <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
                      {product.originalPrice > product.price && (
                        <OriginalPrice>${product.originalPrice.toFixed(2)}</OriginalPrice>
                      )}
                    </ProductPriceRow>
                    <AddToCartButton onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}>
                      <FiShoppingCart />
                      Add to Cart
                    </AddToCartButton>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>

            {/* Pagination */}
            <Pagination>
              <PaginationButton 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                «
              </PaginationButton>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationButton
                  key={i + 1}
                  $active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationButton>
              ))}
              <PaginationButton 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                »
              </PaginationButton>
            </Pagination>
          </MainContent>
        </ShopLayout>

        {/* Service Features */}
        <ServicesSection>
          <ServiceCard>
            <ServiceIcon>
              <FaTruck />
            </ServiceIcon>
            <ServiceContent>
              <ServiceTitle>Free Shipping</ServiceTitle>
              <ServiceText>Free shipping on all orders over $50</ServiceText>
            </ServiceContent>
          </ServiceCard>
          <ServiceCard>
            <ServiceIcon>
              <FaCreditCard />
            </ServiceIcon>
            <ServiceContent>
              <ServiceTitle>Flexible Payment</ServiceTitle>
              <ServiceText>Pay with multiple credit cards</ServiceText>
            </ServiceContent>
          </ServiceCard>
          <ServiceCard>
            <ServiceIcon>
              <FaHeadset />
            </ServiceIcon>
            <ServiceContent>
              <ServiceTitle>24/7 Support</ServiceTitle>
              <ServiceText>We support online 24 hours a day</ServiceText>
            </ServiceContent>
          </ServiceCard>
        </ServicesSection>
      </ContentContainer>
    </PageWrapper>
  );
};

export default Products;

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

const BreadcrumbLink = styled.a`
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

const ShopLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  height: fit-content;
  position: sticky;
  top: 100px;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #E1E8ED;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FilterTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 1rem;
`;

const FilterSubtitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterCheckbox = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin-right: 0.75rem;
    cursor: pointer;
    accent-color: #6C9A7F;
  }
  
  label {
    font-size: 0.875rem;
    color: #636E72;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    
    span {
      color: #999;
      font-size: 0.8rem;
    }
  }
`;

const PriceRangeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const PriceInput = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #E1E8ED;
  border-radius: 6px;
  padding: 0.5rem;
  flex: 1;
  
  span {
    margin-right: 0.25rem;
    color: #636E72;
  }
  
  input {
    border: none;
    width: 100%;
    outline: none;
    font-size: 0.875rem;
    color: #2D3436;
  }
`;

const PriceSliderContainer = styled.div`
  padding: 0.5rem 0;
`;

const PriceSlider = styled.input`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #E1E8ED;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6C9A7F;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6C9A7F;
    cursor: pointer;
    border: none;
  }
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span<{ $filled: boolean }>`
  color: ${props => props.$filled ? '#FFB946' : '#E1E8ED'};
  font-size: 0.875rem;
`;

const MainContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E1E8ED;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ResultsText = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  span {
    font-size: 0.875rem;
    color: #636E72;
  }
`;

const SortSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #E1E8ED;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #2D3436;
  background: white;
  cursor: pointer;
  outline: none;
  
  &:focus {
    border-color: #6C9A7F;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const SaleBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: #6C9A7F;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
`;

const ProductImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 250px;
  cursor: pointer;
  background: #F8F9FA;
  overflow: hidden;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const WishlistButton = styled.button<{ $active?: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$active ? '#6C9A7F' : 'white'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.$active ? 'white' : '#636E72'};
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
`;

const ProductCategory = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.5rem;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const RatingValue = styled.span`
  font-size: 0.75rem;
  color: #636E72;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  color: #2D3436;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #6C9A7F;
  }
`;

const ProductPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ProductPrice = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #6C9A7F;
`;

const OriginalPrice = styled.div`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
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
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
`;

const PaginationButton = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  border: 1px solid ${props => props.$active ? '#6C9A7F' : '#E1E8ED'};
  background: ${props => props.$active ? '#6C9A7F' : 'white'};
  color: ${props => props.$active ? 'white' : '#636E72'};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #6C9A7F;
    color: white;
    border-color: #6C9A7F;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ServicesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #E1E8ED;
`;

const ServiceIcon = styled.div`
  width: 60px;
  height: 60px;
  background: #E8F5EC;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 30px;
    height: 30px;
    color: #6C9A7F;
  }
`;

const ServiceContent = styled.div``;

const ServiceTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const ServiceText = styled.p`
  font-size: 0.875rem;
  color: #636E72;
  margin: 0;
`;
