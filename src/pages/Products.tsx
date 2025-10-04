import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { Card, CardMedia, CardContent, CardTitle, CardSubtitle, CardActions } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Checkbox } from '../components/common/Checkbox';
import { Input } from '../components/common/Input';
import { fetchProducts } from '../services/api';
import { Product, ProductCategory } from '../types';
import { FiShoppingCart, FiHeart, FiFilter, FiX, FiSearch } from 'react-icons/fi';

// Mock categories - replace with actual data from your API
const categories: ProductCategory[] = [
  { id: '1', name: 'Fresh Produce', slug: 'fresh-produce' },
  { id: '2', name: 'Dairy & Eggs', slug: 'dairy-eggs' },
  { id: '3', name: 'Meat & Seafood', slug: 'meat-seafood' },
  { id: '4', name: 'Bakery', slug: 'bakery' },
  { id: '5', name: 'Beverages', slug: 'beverages' },
  { id: '6', name: 'Snacks', slug: 'snacks' },
];

const Products: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery<Product[]>('products', fetchProducts);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        selectedCategories.includes(product.categoryId)
      );
    }

    // Filter by price range
    result = result.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    switch (sortBy) {
      case 'price-low':
        return result.sort((a, b) => a.price - b.price);
      case 'price-high':
        return result.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return result.sort((a, b) => b.name.localeCompare(a.name));
      case 'featured':
      default:
        return result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
  }, [products, searchQuery, selectedCategories, sortBy, priceRange]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = Number(e.target.value);
    setPriceRange((prev) => {
      const newRange = [...prev] as [number, number];
      newRange[index] = value;
      return newRange;
    });
  };

  if (isLoading) {
    return <LoadingSpinner>Loading products...</LoadingSpinner>;
  }

  if (error) {
    return <ErrorMessage>Error loading products. Please try again later.</ErrorMessage>;
  }

  return (
    <ProductsContainer>
      <PageHeader>
        <h1>Our Products</h1>
        <p>Discover our wide range of high-quality products at the best prices</p>
      </PageHeader>

      <ProductsLayout>
        {/* Mobile Filter Toggle */}
        <MobileFilterButton
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <FiFilter /> {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </MobileFilterButton>

        {/* Sidebar - Filters */}
        <FiltersContainer $isOpen={showMobileFilters}>
          <FilterHeader>
            <h3>Filters</h3>
            <CloseButton onClick={() => setShowMobileFilters(false)}>
              <FiX />
            </CloseButton>
          </FilterHeader>

          <FilterSection>
            <FilterTitle>Search</FilterTitle>
            <SearchContainer>
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<FiSearch />}
              />
            </SearchContainer>
          </FilterSection>

          <FilterSection>
            <FilterTitle>Categories</FilterTitle>
            <CategoryList>
              {categories.map((category) => (
                <CategoryItem key={category.id}>
                  <Checkbox
                    id={`category-${category.id}`}
                    label={category.name}
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                </CategoryItem>
              ))}
            </CategoryList>
          </FilterSection>

          <FilterSection>
            <FilterTitle>Price Range</FilterTitle>
            <PriceRangeContainer>
              <PriceInput>
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={(e) => handlePriceRangeChange(e, 0)}
                />
              </PriceInput>
              <PriceRangeDivider>to</PriceRangeDivider>
              <PriceInput>
                <span>$</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceRangeChange(e, 1)}
                />
              </PriceInput>
            </PriceRangeContainer>
            <PriceRangeSlider>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(e, 0)}
              />
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange(e, 1)}
              />
            </PriceRangeSlider>
          </FilterSection>

          <ClearFiltersButton
            variant="text"
            onClick={() => {
              setSelectedCategories([]);
              setPriceRange([0, 500]);
              setSearchQuery('');
            }}
          >
            Clear All Filters
          </ClearFiltersButton>
        </FiltersContainer>

        {/* Main Content */}
        <ProductsContent>
          <ProductsHeader>
            <ResultsCount>{filteredProducts.length} products found</ResultsCount>
            <SortContainer>
              <span>Sort by:</span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'featured', label: 'Featured' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'name-asc', label: 'Name: A to Z' },
                  { value: 'name-desc', label: 'Name: Z to A' },
                ]}
              />
            </SortContainer>
          </ProductsHeader>

          <ProductsGrid>
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                >
                  <ProductCard variant="elevated" hoverEffect="elevate">
                    <ProductBadge $type={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </ProductBadge>
                    {product.isOnSale && (
                      <SaleBadge>Sale</SaleBadge>
                    )}
                    <CardMedia $height="200px">
                      <img src={product.imageUrl} alt={product.name} />
                      <ProductActions>
                        <IconButton aria-label="Add to wishlist">
                          <FiHeart />
                        </IconButton>
                        <IconButton aria-label="Quick view">
                          <FiSearch />
                        </IconButton>
                      </ProductActions>
                    </CardMedia>
                    <CardContent>
                      <ProductCategoryName>{product.categoryName}</ProductCategoryName>
                      <CardTitle>{product.name}</CardTitle>
                      <CardSubtitle>{product.shortDescription}</CardSubtitle>
                      <ProductPrice>
                        {product.originalPrice > product.price ? (
                          <>
                            <CurrentPrice>${product.price.toFixed(2)}</CurrentPrice>
                            <OriginalPrice>${product.originalPrice.toFixed(2)}</OriginalPrice>
                          </>
                        ) : (
                          <CurrentPrice>${product.price.toFixed(2)}</CurrentPrice>
                        )}
                      </ProductPrice>
                      <Rating>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} $filled={i < Math.floor(product.rating)} />
                        ))}
                        <span>({product.reviewCount})</span>
                      </Rating>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="primary"
                        fullWidth
                        icon={<FiShoppingCart />}
                        disabled={product.stock === 0}
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </CardActions>
                  </ProductCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </ProductsGrid>

          {filteredProducts.length === 0 && (
            <NoResults>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange([0, 500]);
                  setSearchQuery('');
                }}
              >
                Clear All Filters
              </Button>
            </NoResults>
          )}
        </ProductsContent>
      </ProductsLayout>
    </ProductsContainer>
  );
};

export default Products;

// Styled Components
const ProductsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(4, 2)};
  max-width: 1440px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  
  h1 {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.primary.main};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
  
  p {
    color: ${({ theme }) => theme.colors.common.gray[600]};
    font-size: 1.1rem;
  }
`;

const ProductsLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${({ theme }) => theme.spacing(4)};
  position: relative;
  
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const FiltersContainer = styled.div<{ $isOpen: boolean }>`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  padding: ${({ theme }) => theme.spacing(3)};
  height: fit-content;
  box-shadow: ${({ theme }) => theme.shadows[1]};
  position: sticky;
  top: 100px;
  
  @media (max-width: 960px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    overflow-y: auto;
    transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    transition: transform 0.3s ease-in-out;
    max-width: 400px;
    width: 90%;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  
  h3 {
    font-size: 1.25rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.secondary.main};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.common.gray[600]};
  display: none;
  
  @media (max-width: 960px) {
    display: block;
  }
`;

const FilterSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const FilterTitle = styled.h4`
  font-size: 1rem;
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
  color: ${({ theme }) => theme.colors.common.gray[800]};
  font-weight: 600;
`;

const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CategoryItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const PriceRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const PriceInput = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.common.gray[300]};
  border-radius: 4px;
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  
  span {
    color: ${({ theme }) => theme.colors.common.gray[600]};
    margin-right: 4px;
  }
  
  input {
    border: none;
    width: 60px;
    outline: none;
    color: ${({ theme }) => theme.colors.common.gray[800]};
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    &[type=number] {
      -moz-appearance: textfield;
    }
  }
`;

const PriceRangeDivider = styled.span`
  color: ${({ theme }) => theme.colors.common.gray[500]};
`;

const PriceRangeSlider = styled.div`
  position: relative;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.common.gray[200]};
  border-radius: 2px;
  margin: ${({ theme }) => theme.spacing(3, 0)};
  
  input[type="range"] {
    position: absolute;
    width: 100%;
    height: 4px;
    background: none;
    pointer-events: none;
    -webkit-appearance: none;
    
    &::-webkit-slider-thumb {
      pointer-events: auto;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.primary.main};
      cursor: pointer;
      margin-top: -6px;
    }
    
    &::-moz-range-thumb {
      pointer-events: auto;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.primary.main};
      cursor: pointer;
      border: none;
    }
  }
`;

const ClearFiltersButton = styled(Button)`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const ProductsContent = styled.div`
  flex: 1;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

const ResultsCount = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.common.gray[600]};
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  
  span {
    color: ${({ theme }) => theme.colors.common.gray[700]};
    font-size: 0.9rem;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled(Card)`
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows[4]};
  }
`;

const ProductBadge = styled.span<{ $type: 'in-stock' | 'out-of-stock' }>`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: ${({ theme, $type }) => 
    $type === 'in-stock' ? theme.colors.success.main : theme.colors.error.main};
  color: white;
  font-size: 0.75rem;
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  border-radius: 12px;
  z-index: 1;
`;

const SaleBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: ${({ theme }) => theme.colors.error.main};
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  border-radius: 12px;
  z-index: 1;
`;

const ProductActions = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ProductCard}:hover & {
    opacity: 1;
  }
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.common.gray[700]};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
    transform: translateY(-2px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ProductCategoryName = styled.span`
  display: block;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductPrice = styled.div`
  margin: ${({ theme }) => theme.spacing(2, 0)};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const CurrentPrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.common.gray[500]};
  text-decoration: line-through;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: ${({ theme }) => theme.spacing(1)};
  
  span {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.common.gray[600]};
    margin-left: 4px;
  }
`;

const Star = styled.span<{ $filled: boolean }>`
  color: ${({ theme, $filled }) => 
    $filled ? theme.colors.warning.main : theme.colors.common.gray[300]};
  font-size: 1rem;
  line-height: 1;
  
  &::before {
    content: '★';
  }
`;

const NoResults = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${({ theme }) => theme.spacing(8, 2)};
  
  h3 {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.common.gray[800]};
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }
  
  p {
    color: ${({ theme }) => theme.colors.common.gray[600]};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }
`;

const MobileFilterButton = styled(Button)`
  display: none;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  
  @media (max-width: 960px) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.common.gray[600]};
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.error.light};
  color: ${({ theme }) => theme.colors.error.dark};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  text-align: center;
  margin: ${({ theme }) => theme.spacing(4)};
`;
