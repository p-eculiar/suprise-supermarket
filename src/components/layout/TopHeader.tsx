import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { useRealtime } from '../../hooks/useRealtime';
import { useSettings } from '../../contexts/SettingsContext';

interface Category {
  id?: string;
  name: string;
  image_url?: string;
}

export const TopHeader: React.FC = () => {
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const dropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // First try to get categories from the categories table
        const { data: catRows, error: catErr } = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true });

        // Also get product counts for each category
        const { data: productCounts, error: countErr } = await supabase
          .from('products')
          .select('category')
          .eq('active', true);

        if (!catErr && catRows && catRows.length > 0) {
          // Create a map of product counts by category
          const countMap: Record<string, number> = {};
          if (!countErr && productCounts) {
            productCounts.forEach((p: any) => {
              if (p.category) {
                countMap[p.category] = (countMap[p.category] || 0) + 1;
              }
            });
          }

          // Filter out categories that don't have any products
          const categoriesWithProducts = catRows.filter((cat: any) => 
            countMap[cat.name] && countMap[cat.name] > 0
          );

          setCategories(categoriesWithProducts.map((cat: any) => ({ name: cat.name })));
          return;
        }

        // Fallback: get categories from products
        const { data: prodRows, error: prodErr } = await supabase
          .from('products')
          .select('category')
          .eq('active', true);

        if (!prodErr && prodRows) {
          const uniqueCategories = Array.from(new Set(prodRows.map((p: any) => p.category)))
            .filter(Boolean)
            .map((name: string) => ({ name }));
          setCategories(uniqueCategories as Category[]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories
        setCategories([
          { name: 'Vegetables' },
          { name: 'Fruits' },
          { name: 'Dairy' },
          { name: 'Meat' },
          { name: 'Bakery' },
          { name: 'Beverages' }
        ]);
      }
    };

    fetchCategories();
    
    // Cleanup function to clear timeout on unmount
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    if (e.target.value) {
      navigate(`/products?category=${encodeURIComponent(e.target.value)}`);
    }
  };

  return (
    <TopHeaderContainer>
      <TopHeaderInner>
        {/* Left Section - Search and Category Filter */}
        <SearchAndFilterSection>
          <CategoryFilter>
            <CategorySelectButton
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              onMouseEnter={() => {
                if (dropdownTimeoutRef.current) {
                  clearTimeout(dropdownTimeoutRef.current);
                }
                setIsCategoryDropdownOpen(true);
              }}
              onMouseLeave={() => {
                if (dropdownTimeoutRef.current) {
                  clearTimeout(dropdownTimeoutRef.current);
                }
                dropdownTimeoutRef.current = setTimeout(() => {
                  setIsCategoryDropdownOpen(false);
                }, 300);
              }}
            >
              {selectedCategory || "All Categories"}
              <DownArrow />
            </CategorySelectButton>
            {isCategoryDropdownOpen && (
              <CategoryDropdown 
                onMouseEnter={() => {
                  if (dropdownTimeoutRef.current) {
                    clearTimeout(dropdownTimeoutRef.current);
                  }
                }}
                onMouseLeave={() => {
                  if (dropdownTimeoutRef.current) {
                    clearTimeout(dropdownTimeoutRef.current);
                  }
                  dropdownTimeoutRef.current = setTimeout(() => {
                    setIsCategoryDropdownOpen(false);
                  }, 300);
                }}
              >
                <CategoryOption 
                  onClick={() => {
                    setSelectedCategory('');
                    setIsCategoryDropdownOpen(false);
                    navigate(`/products`);
                  }}
                >
                  All Categories
                </CategoryOption>
                {categories.map((category: Category) => (
                  <CategoryOption 
                    key={category.name}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      navigate(`/products?category=${encodeURIComponent(category.name)}`);
                      setIsCategoryDropdownOpen(false);
                    }}
                  >
                    {category.name}
                  </CategoryOption>
                ))}
              </CategoryDropdown>
            )}
          </CategoryFilter>

          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <SearchButton type="submit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </SearchButton>
          </SearchForm>
        </SearchAndFilterSection>

        {/* Right Section - Contact Info */}
        <RightSection>
          <ContactInfo>
            <ContactItem as="a" href="tel:+2348084888899">
              <IconWrapper>
                <FaPhoneAlt />
              </IconWrapper>
              <ContactText>(+234) 8084888899</ContactText>
            </ContactItem>
            <ContactItem as="a" href={`mailto:${settings.supportEmail}`}>
              <IconWrapper>
                <FaEnvelope />
              </IconWrapper>
              <ContactText>{settings.supportEmail}</ContactText>
            </ContactItem>
          </ContactInfo>
        </RightSection>
      </TopHeaderInner>
    </TopHeaderContainer>
  );
};

const TopHeaderContainer = styled.div`
  background: linear-gradient(135deg, #2c5f47 0%, #3a7a5f 50%, #2c5f47 100%);
  padding: 0.75rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1150; /* Increased to be above Header (appBar is 1100) */
`;

const TopHeaderInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  
  @media (max-width: 992px) {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    display: none; /* Hide contact info on very small devices */
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:active {
    opacity: 0.7;
  }
`;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const ContactText = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
  
  a &:hover {
    color: white;
    text-decoration: underline;
  }
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const SearchAndFilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  max-width: 650px;
  margin: 0 1rem;
  
  @media (max-width: 992px) {
    order: 3;
    width: 100%;
    max-width: 100%;
    margin: 0;
  }
`;

const SearchForm = styled.form`
  position: relative;
  flex: 1;
  display: flex;

`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    background: white;
  }
  
  &::placeholder {
    color: #666;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #2c5f47;
  }
`;

const CategorySelectButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  background: #FFD700; /* Shop now button color from Hero section */
  color: #2D3436; /* Dark text color for contrast */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  
  &:hover {
    background: #FFC700; /* Slightly darker on hover */
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }
  
  @media (max-width: 992px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
`;

const DownArrow = styled.div`
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #2D3436;
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
  
  ${/* sc-selector */CategorySelectButton}:hover & {
    border-top-color: #ffffff;
  }
`;

const CategoryFilter = styled.div`
  position: relative;
`;

const CategoryDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 220px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1200; /* Higher z-index to appear above header (appBar is 1100) */
  max-height: 300px;
  overflow-y: auto;
`;

const CategoryOption = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: #333;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  user-select: none;
  
  &:hover, &:focus {
    background: #f5f5f5;
    outline: none;
  }
  
  &.selected {
    background: #2c5f47;
    color: white;
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  &:active {
    background: #e0e0e0;
  }
  
  /* Add consistent styling for both hover and active states */
  &:hover, &:active, &:focus {
    background: #f0f0f0;
    color: #2c5f47;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const ServicesLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const ServiceLink = styled(Link)`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
  padding: 0.25rem 0;
  
  &:hover {
    color: white;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: white;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;



export default TopHeader;