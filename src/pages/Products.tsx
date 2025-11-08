import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService, Product } from '../services/productService';
import { FiShoppingCart, FiHeart, FiFilter } from 'react-icons/fi';
import { FaTruck, FaCreditCard, FaHeadset } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useSettings } from '../contexts/SettingsContext';
import toast from '../components/common/Toast';
import { supabase } from '../lib/supabase';
import { useRealtime } from '../hooks/useRealtime';
import { useAuth } from '../contexts/AuthContext';
import { ProductsPageLoader, ProductCardLoader } from '../components/common/GranularLoading';
import { useLoadingState } from '../hooks/useLoadingState';

const ratingFilters = [
  { stars: 5, count: 78 },
  { stars: 4, count: 105 },
  { stars: 3, count: 42 },
  { stars: 2, count: 18 },
  { stars: 1, count: 9 },
];

const brands = ['NestFood', 'Stouffer', 'Tyson', 'Farmfood', 'StoreBrand'];
const productTypes = ['All Products', 'Fruits Products', 'Fresh Vegetable'];

const ITEMS_PER_PAGE = 9; // Define items per page constant

const Products: React.FC = () => {
  const { formatCurrency } = useSettings();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    // Initialize from URL parameter if present
    const categoryParam = new URLSearchParams(window.location.search).get('category');
    return categoryParam ? [categoryParam] : [];
  });
  
  // Refs to track previous values and persist category selection
  const prevCategoryParam = useRef<string | null>(null);
  const componentMountRef = useRef<number>(Date.now());

  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(''); // Add search query state
  
  // State for filter toggle on small devices
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // State for products from database
  const [products, setProducts] = useState<Product[]>([]);
  const { isLoading, startLoading, stopLoading } = useLoadingState({ initialLoading: true });
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);
  // Track broken product images
  const [brokenProductImages, setBrokenProductImages] = useState<Set<string>>(new Set());

  // Debug authentication state changes
  useEffect(() => {
    console.log('🔐 AUTH STATE CHANGED - isAuthenticated:', isAuthenticated, 'user:', user);
  }, [isAuthenticated, user]);
  
  // Clear cache when user authentication state changes
  useEffect(() => {
    console.log('🧹 CLEARING CACHE DUE TO AUTH STATE CHANGE');
    productService.clearCache();
  }, [isAuthenticated, user]);

  // Clear cache when component mounts to ensure fresh data
  useEffect(() => {
    productService.clearCache();
  }, []);

  // Component mount/unmount tracking
  useEffect(() => {
    const mountId = componentMountRef.current;
    console.log('🚀 COMPONENT MOUNTED - ID:', mountId, 'Timestamp:', new Date().toISOString());
    
    return () => {
      console.log('💥 COMPONENT UNMOUNTING - ID:', mountId, 'Timestamp:', new Date().toISOString());
    };
  }, []);
  
  // Debug searchParams changes
  useEffect(() => {
    console.log('🔍 SEARCH PARAMS CHANGED:', Object.fromEntries(searchParams.entries()));
  }, [searchParams]);
  
  // Session refresh mechanism
  const refreshSessionIfNeeded = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session, refreshing user context');
        await refreshUser();
      }
    } catch (error) {
      console.error('Session refresh check failed:', error);
    }
  }, [refreshUser]);

  // Handle URL category parameter - robust version with proper persistence
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const mountId = componentMountRef.current;
    
    console.log('=== CATEGORY PARAM EFFECT DEBUG ===');
    console.log('Component mount ID:', mountId);
    console.log('Category param from URL:', categoryParam);
    console.log('Previous category param:', prevCategoryParam.current);
    console.log('Current selected categories:', selectedCategories);
    console.log('Timestamp:', new Date().toISOString());
    
    // Only update if the category parameter has actually changed
    if (categoryParam !== prevCategoryParam.current) {
      if (categoryParam) {
        console.log('🟢 Setting selected categories to:', [categoryParam]);
        setSelectedCategories([categoryParam]);
        // Reset pagination when category changes
        setCurrentPage(1);
      } else if (!categoryParam && selectedCategories.length > 0) {
        // Clear categories if no param but categories are selected
        console.log('🔴 Clearing selected categories');
        setSelectedCategories([]);
        setCurrentPage(1);
      }
      
      // Update the ref to track the current value
      console.log('Updating prevCategoryParam to:', categoryParam);
      prevCategoryParam.current = categoryParam;
    } else {
      console.log('🟡 Category param unchanged, skipping update');
    }
    
    console.log('=== END CATEGORY PARAM EFFECT DEBUG ===');
  }, [searchParams]); // Only depend on searchParams to avoid infinite loops
  
  // Handle URL search parameter
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    console.log('🔍 Search param useEffect - searchParam:', searchParam, 'categoryParam:', categoryParam, 'searchQuery:', searchQuery);
    
    // Only clear categories for search if there's actually a search parameter
    // and no category parameter
    if (searchParam && searchParam !== searchQuery && !categoryParam) {
      console.log('🔍 Clearing filters for search');
      // Clear other filters when searching
      setSelectedCategories([]);
      setSelectedRatings([]);
      setPriceRange([0, 150]);
      setSelectedBrands([]);
      setSelectedProductTypes([]);
      setAvailability('all');
      setSearchQuery(searchParam);
    } else if (!searchParam && searchQuery) {
      // Clear search query if no search param
      console.log('🔍 Clearing search query');
      setSearchQuery('');
    } else {
      console.log('🔍 Search param useEffect - no action needed');
    }
  }, [searchParams, searchQuery]);
  
  // Reload products when search query changes
  useEffect(() => {
    if (searchQuery) {
      loadProducts();
    }
  }, [searchQuery]);

  // Load products with session refresh
  const loadProducts = useCallback(async () => {
    startLoading();
    try {
      // Refresh session if needed
      await refreshSessionIfNeeded();
      
      // Load products
      await loadProductData();
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products. Please refresh the page.');
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, refreshSessionIfNeeded]);

  // Load categories from database (live)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🔄 Loading categories...');
        await loadCategoryData();
      } catch (error) {
        console.error('❌ Error loading categories:', error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  // Shared function to load category data
  const loadCategoryData = async () => {
    console.log('🔄 Loading category data...');
    
    // Always get categories from products first (source of truth)
    // Ensure we only count ACTIVE products in each category
    const { data: prodRows, error: prodErr } = await supabase
      .from('products')
      .select('category')
      .eq('active', true); // Only count active products
    
    if (prodErr) {
      console.error('❌ Error fetching products for categories:', prodErr);
      setCategories([]);
      return;
    }
    
    console.log('📊 Raw product categories data (active only):', prodRows?.length, 'rows');
    
    // Count products per category (including empty categories)
    const counts = new Map<string, number>();
    prodRows?.forEach(p => {
      // Include products with empty/null categories in the count
      const category = (p.category && p.category.trim()) ? p.category.trim() : 'Uncategorized';
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    
    console.log('📊 Product categories count (active only):', Object.fromEntries(counts));
    
    // Also get total count of all products (active and inactive) for comparison
    try {
      const { count: totalCount, error: totalError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (!totalError && totalCount) {
        console.log('📊 Total products in database (active + inactive):', totalCount);
      }
    } catch (totalCountError) {
      console.error('Error getting total product count:', totalCountError);
    }
    
    // Try to get category metadata from categories table
    const { data: catRows, error: catErr } = await supabase
      .from('categories')
      .select('name, image_url')
      .order('name', { ascending: true });

    let categoriesWithMeta: Array<{ id: string; name: string; count: number; image_url?: string }> = [];
    
    if (!catErr && catRows && catRows.length > 0) {
      console.log('📋 Categories table found with', catRows.length, 'rows');
      
      // Create a map of category metadata
      const catMeta = new Map();
      catRows.forEach(cat => {
        catMeta.set(cat.name, cat);
      });
      
      // Build final list: only categories that have products
      categoriesWithMeta = Array.from(counts.entries())
        .filter(([name, count]) => name !== 'Uncategorized' && count > 0) // Exclude uncategorized unless needed
        .map(([name, count], index) => ({
          id: `cat-${index}`,
          name,
          count,
          image_url: catMeta.get(name)?.image_url
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Add uncategorized category if it has products
      const uncategorizedCount = counts.get('Uncategorized');
      if (uncategorizedCount !== undefined && uncategorizedCount > 0) {
        categoriesWithMeta.push({
          id: `cat-uncategorized`,
          name: 'Uncategorized',
          count: uncategorizedCount
        });
      }
    } else {
      console.log('📋 No categories table or error:', catErr);
      
      // Use only product categories
      categoriesWithMeta = Array.from(counts.entries())
        .filter(([name, count]) => name !== 'Uncategorized' && count > 0) // Exclude uncategorized unless needed
        .map(([name, count], index) => ({
          id: `cat-${index}`,
          name,
          count
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Add uncategorized category if it has products
      const uncategorizedCount = counts.get('Uncategorized');
      if (uncategorizedCount !== undefined && uncategorizedCount > 0) {
        categoriesWithMeta.push({
          id: `cat-uncategorized`,
          name: 'Uncategorized',
          count: uncategorizedCount
        });
      }
    }
    
    console.log('✅ Final categories loaded (active products only):', categoriesWithMeta);
    setCategories(categoriesWithMeta);
  };

  // Realtime: refresh categories and products on changes
  useRealtime({
    table: 'categories',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: () => {
      console.log('🔄 Categories table changed, reloading...');
      // Add a small delay to prevent rapid reloading
      setTimeout(() => {
        loadCategoryData();
      }, 500);
    },
    channelName: 'products-page-categories'
  });

  useRealtime({
    table: 'products',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: () => {
      console.log('🔄 Products table changed, reloading...');
      // Add a small delay to prevent rapid reloading
      setTimeout(() => {
        // Reload both products and categories together to ensure consistency
        loadProducts();
        loadCategoryData();
      }, 500);
    },
    channelName: 'products-page-products'
  });

  // Debug useEffect to track when selectedCategories changes
  useEffect(() => {
    console.log('🔍 selectedCategories changed:', selectedCategories, 'Timestamp:', new Date().toISOString());
  }, [selectedCategories]);
  
  // Load products from database
  useEffect(() => {
    console.log('🔄 Products page - Starting to load products');
    console.log('🔍 Triggered by:', { selectedCategories, selectedRatings, priceRange, selectedBrands, selectedProductTypes, availability, sortBy, currentPage });
    
    loadProducts();
  }, [selectedCategories, selectedRatings, priceRange, selectedBrands, selectedProductTypes, availability, sortBy, currentPage]); // Removed searchParams to prevent conflicts

  // Shared function to load product data
  const loadProductData = async () => {
    try {
      console.log('🔄 Products page - Starting to load products');
      startLoading();
      
      // Log current authentication state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Products page - Current session:', session);
      
      // Continue loading products even if there's a session error
      if (sessionError) {
        console.warn('Session error (continuing anyway):', sessionError);
        toast.warning('Authentication issue - continuing as guest user');
      }
      
      // Get total count of all active products in the database
      let totalActiveProducts = 0;
      try {
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
        
        if (!error && count !== null) {
          totalActiveProducts = count;
          console.log('Total active products in database:', totalActiveProducts);
        }
      } catch (countError) {
        console.error('Error getting total active product count:', countError);
      }
      
      // Also get total count of all products for comparison
      try {
        const { count: totalCount, error: totalError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (!totalError && totalCount !== null) {
          console.log('Total products in database (active + inactive):', totalCount);
        }
      } catch (totalCountError) {
        console.error('Error getting total product count:', totalCountError);
      }
      
      // Build filters - ONLY include filters that are actually set
      const filters: any = {
        active: true // Always filter for active products
      };
      let hasExplicitFilters = false; // Track if user has applied explicit filters
      
      console.log('🔍 Building filters...');
      console.log('🔍 selectedCategories:', selectedCategories);
      
      // Handle search query
      const searchParam = searchParams.get('search');
      if (searchParam) {
        filters.search = searchParam;
        hasExplicitFilters = true;
        console.log('🔍 Added search filter:', searchParam);
      }
      
      if (selectedCategories.length > 0) {
        // Pass single category as string, multiple categories as array
        filters.category = selectedCategories.length === 1 ? selectedCategories[0] : selectedCategories;
        hasExplicitFilters = true;
        console.log('🔍 Added category filter:', filters.category);
      }
      
      // Apply rating filters
      if (selectedRatings.length > 0) {
        // For multiple ratings, we'll use the highest selected rating as minRating
        const minRating = Math.min(...selectedRatings);
        filters.minRating = minRating;
        hasExplicitFilters = true;
        console.log('🔍 Added rating filter:', minRating);
      }
      
      // Only apply price filters if they're not at their default values
      if (priceRange[0] > 0 || priceRange[1] < 150) {
        filters.minPrice = priceRange[0];
        filters.maxPrice = priceRange[1];
        hasExplicitFilters = true;
        console.log('🔍 Added price filter:', priceRange);
      }
      
      // Apply brand filters (would need to extract from product names/descriptions)
      if (selectedBrands.length > 0) {
        // This would require a brand field in the database or text search
        // For now, we'll do a simple text search
        if (selectedBrands.length > 0) {
          hasExplicitFilters = true;
          console.log('🔍 Added brand filter');
        }
      }
      
      // Apply availability filter
      if (availability !== 'all') {
        filters.inStock = availability === 'in-stock';
        hasExplicitFilters = true;
        console.log('🔍 Added availability filter:', availability);
      }
      
      console.log('🔍 Final filters object:', filters);
      console.log('🔍 Has explicit filters:', hasExplicitFilters);
      
      // Fetch products with active filter
      console.log('🔄 Fetching products with filters...');
      const allProducts = await productService.getAllProducts(filters);
      
      console.log('✅ Fetched products count:', allProducts?.length || 0);
      if (allProducts && allProducts.length > 0) {
        console.log('🔍 Sample product categories:', Array.from(new Set(allProducts.slice(0, 10).map(p => p.category))).join(', '));
      } else {
        console.warn('⚠️ No products found with current filters');
        // Show a more user-friendly message
        if (searchParam) {
          toast.info('No products found matching your search - try different keywords');
        } else {
          toast.info('No products found with current filters - showing all products');
          // Try loading all products without filters
          const allProductsFallback = await productService.getAllProducts({ active: true });
          console.log('Fallback - all active products count:', allProductsFallback?.length || 0);
          setProducts(allProductsFallback || []);
          setTotalCount(allProductsFallback?.length || 0);
          stopLoading();
          return;
        }
      }
      
      // Apply additional client-side filters (brands, product types)
      let filteredProducts = [...(allProducts || [])];
      
      // Apply brand filter (client-side text search)
      if (selectedBrands.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
          const productName = product.name.toLowerCase();
          return selectedBrands.some(brand => productName.includes(brand.toLowerCase()));
        });
      }
      
      // Apply product type filter (client-side text search)
      if (selectedProductTypes.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
          const productName = product.name.toLowerCase();
          const productCategory = product.category.toLowerCase();
          return selectedProductTypes.some(type => {
            if (type === 'All Products') return true;
            if (type === 'Fruits Products') return productCategory.includes('fruits');
            if (type === 'Fresh Vegetable') return productCategory.includes('vegetables');
            return productName.includes(type.toLowerCase());
          });
        });
      }
      
      // Apply sorting
      let sortedProducts = [...filteredProducts];
      if (sortBy === 'price-low') {
        sortedProducts.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        sortedProducts.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'name') {
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'rating') {
        sortedProducts.sort((a, b) => b.rating - a.rating);
      }
      
      // Apply pagination
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
      
      console.log('Setting products state with', paginatedProducts.length, 'items');
      setProducts(paginatedProducts);
      
      // Set total count based on whether filters are applied
      // If no explicit filters, show total active products
      // If filters are applied, show count of filtered results
      const displayCount = hasExplicitFilters ? sortedProducts.length : totalActiveProducts;
      setTotalCount(displayCount);
      
      console.log(`Pagination: Showing ${startIndex + 1}-${Math.min(endIndex, sortedProducts.length)} of ${displayCount} results`);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      toast.error('Failed to load products - please refresh the page');
      
      // Try fallback method - load all active products
      try {
        console.log('Trying fallback - loading all active products');
        const fallbackProducts = await productService.getAllProducts({ active: true });
        console.log('Fallback products count:', fallbackProducts?.length || 0);
        setProducts(fallbackProducts?.slice(0, ITEMS_PER_PAGE) || []);
        
        // Get total count for fallback
        let fallbackTotalCount = 0;
        try {
          const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('active', true);
          
          if (!error && count !== null) {
            fallbackTotalCount = count;
          }
        } catch (countError) {
          console.error('Error getting fallback total count:', countError);
        }
        
        setTotalCount(fallbackTotalCount);
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        // Set empty products and 0 count as last resort
        setProducts([]);
        setTotalCount(0);
        toast.error('Unable to load products - please check your internet connection');
      }
    } finally {
      stopLoading();
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.image_url,
      categoryName: product.category,
      stock: product.stock,
    });
  };

  const handleToggleWishlist = (product: any) => {
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.image_url,
      categoryName: product.category,
      stock: product.stock,
    });
  };

  // Pagination - calculated from API count
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedProducts = products;
  
  // Ensure current page doesn't exceed total pages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const toggleCategory = (categoryName: string) => {
    console.log('🔵 toggleCategory called with:', categoryName);
    console.log('🔵 Current selectedCategories:', selectedCategories);
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const toggleProductType = (type: string) => {
    setSelectedProductTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Add event listener for category and product updates
  useEffect(() => {
    const handleCategoryUpdate = () => {
      console.log('🔄 Categories updated, refreshing products page categories');
      productService.clearCache();
      loadCategoryData();
    };

    const handleProductUpdate = () => {
      console.log('🔄 Products updated, refreshing products page');
      productService.clearCache();
      loadProducts();
    };

    window.addEventListener('categoriesUpdated', handleCategoryUpdate);
    window.addEventListener('productsUpdated', handleProductUpdate);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdate);
      window.removeEventListener('productsUpdated', handleProductUpdate);
    };
  }, [loadProducts, loadCategoryData]);

  return (
    <PageWrapper>
      {/* Show full page skeleton on initial load */}
      {isLoading ? (
        <ProductsPageLoader />
      ) : (
        <>
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
              {/* Filter Toggle Button for Small Devices */}
              <FilterToggle onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                <FiFilter />
                Filters
              </FilterToggle>
              
              {/* Sidebar Filters */}
              <Sidebar $isOpen={isFiltersOpen}>
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
                        onChange={() => {
                          toggleCategory(category.name);
                          // Close filters on small devices after selection
                          if (window.innerWidth <= 768) {
                            setIsFiltersOpen(false);
                          }
                        }}
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
                      <span>{formatCurrency(priceRange[0]).replace(/\d+(\.\d+)?/g, '')}</span>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      />
                    </PriceInput>
                    <span>-</span>
                    <PriceInput>
                      <span>{formatCurrency(priceRange[1]).replace(/\d+(\.\d+)?/g, '')}</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => {
                          setPriceRange([priceRange[0], Number(e.target.value)]);
                          // Close filters on small devices after selection
                          if (window.innerWidth <= 768) {
                            setIsFiltersOpen(false);
                          }
                        }}
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
                        checked={selectedRatings.includes(filter.stars)}
                        onChange={() => {
                          toggleRating(filter.stars);
                          // Close filters on small devices after selection
                          if (window.innerWidth <= 768) {
                            setIsFiltersOpen(false);
                          }
                        }}
                      />
                      <label htmlFor={`rating-${filter.stars}`}>
                        <Stars>
                          {[...Array(5)].map((_,i) => (
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
                      <input 
                        type="checkbox" 
                        id={`brand-${brand}`} 
                        checked={selectedBrands.includes(brand)}
                        onChange={() => {
                          toggleBrand(brand);
                          // Close filters on small devices after selection
                          if (window.innerWidth <= 768) {
                            setIsFiltersOpen(false);
                          }
                        }}
                      />
                      <label htmlFor={`brand-${brand}`}>{brand}</label>
                    </FilterCheckbox>
                  ))}
                </FilterSection>

                {/* Product Type Filter */}
                <FilterSection>
                  <FilterSubtitle>Product Type</FilterSubtitle>
                  {productTypes.map((type) => (
                    <FilterCheckbox key={type}>
                      <input 
                        type="checkbox" 
                        id={`type-${type}`} 
                        checked={selectedProductTypes.includes(type)}
                        onChange={() => {
                          toggleProductType(type);
                          // Close filters on small devices after selection
                          if (window.innerWidth <= 768) {
                            setIsFiltersOpen(false);
                          }
                        }}
                      />
                      <label htmlFor={`type-${type}`}>{type}</label>
                    </FilterCheckbox>
                  ))}
                </FilterSection>

                {/* Availability Filter */}
                <FilterSection>
                  <FilterSubtitle>Availability</FilterSubtitle>
                  <FilterRadio>
                    <input 
                      type="radio" 
                      id="availability-all" 
                      name="availability"
                      checked={availability === 'all'}
                      onChange={() => {
                        setAvailability('all');
                        // Close filters on small devices after selection
                        if (window.innerWidth <= 768) {
                          setIsFiltersOpen(false);
                        }
                      }}
                    />
                    <label htmlFor="availability-all">All</label>
                  </FilterRadio>
                  <FilterRadio>
                    <input 
                      type="radio" 
                      id="availability-in-stock" 
                      name="availability"
                      checked={availability === 'in-stock'}
                      onChange={() => {
                        setAvailability('in-stock');
                        // Close filters on small devices after selection
                        if (window.innerWidth <= 768) {
                          setIsFiltersOpen(false);
                        }
                      }}
                    />
                    <label htmlFor="availability-in-stock">In Stock</label>
                  </FilterRadio>
                  <FilterRadio>
                    <input 
                      type="radio" 
                      id="availability-out-of-stock" 
                      name="availability"
                      checked={availability === 'out-of-stock'}
                      onChange={() => {
                        setAvailability('out-of-stock');
                        // Close filters on small devices after selection
                        if (window.innerWidth <= 768) {
                          setIsFiltersOpen(false);
                        }
                      }}
                    />
                    <label htmlFor="availability-out-of-stock">Out of Stock</label>
                  </FilterRadio>
                </FilterSection>
              </Sidebar>

              {/* Main Content */}
              <MainContent>
                {/* Header with Sort */}
                <ProductsHeader>
                  <ResultsText>
                    {isLoading ? 'Loading...' : `Showing ${((currentPage - 1) * ITEMS_PER_PAGE) + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of ${totalCount} results`}
                  </ResultsText>
                  <SortContainer>
                    <span>Sort by:</span>
                    <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="default">Default Sorting</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name</option>
                      <option value="rating">Rating</option>
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
                      <ProductImage 
                        loading="lazy" 
                        src={product.image_url || ''} 
                        alt={product.name}
                        onError={(e: any) => {
                          // Mark image as broken
                          setBrokenProductImages(prev => {
                            const next = new Set(prev);
                            next.add(product.id);
                            return next;
                          });
                          // Set a fallback image or style
                          e.currentTarget.style.objectFit = 'contain';
                          e.currentTarget.style.backgroundColor = '#f0f0f0';
                        }}
                        style={brokenProductImages.has(product.id) ? { 
                          objectFit: 'contain',
                          backgroundColor: '#f0f0f0'
                        } : {}}
                      />
                        <WishlistButton 
                          $active={isInWishlist(product.id)}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleToggleWishlist(product);
                          }}
                        >
                          <FiHeart />
                        </WishlistButton>
                      </ProductImageWrapper>
                      <ProductInfo>
                        <ProductCategory>{product.category}</ProductCategory>
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
                          <ProductPrice>{formatCurrency(product.price)}</ProductPrice>
                          {product.originalPrice > product.price && (
                            <OriginalPrice>{formatCurrency(product.originalPrice)}</OriginalPrice>
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
                  
                  {/* Show first page */}
                  {currentPage > 3 && (
                    <>
                      <PaginationButton onClick={() => setCurrentPage(1)}>
                        1
                      </PaginationButton>
                      {currentPage > 4 && <PaginationDots>...</PaginationDots>}
                    </>
                  )}
                  
                  {/* Show pages around current page */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else {
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(totalPages, start + 4);
                      pageNum = Math.max(start, end - 4) + i;
                    }
                    
                    return (
                      <PaginationButton
                        key={pageNum}
                        $active={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationButton>
                    );
                  })}
                  
                  {/* Show last page */}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <PaginationDots>...</PaginationDots>}
                      <PaginationButton onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                      </PaginationButton>
                    </>
                  )}
                  
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
              <ServicesGrid>
                <ServiceCard>
                  <ServiceIcon>
                    <FaTruck />
                  </ServiceIcon>
                  <ServiceContent>
                    <ServiceTitle>Free Shipping</ServiceTitle>
                    <ServiceText>Free shipping on all orders over {formatCurrency(50)}</ServiceText>
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
              </ServicesGrid>
            </ServicesSection>
          </ContentContainer>
        </>
      )}
    </PageWrapper>
  );
};

export default Products;

// Styled Components
const PageWrapper = styled.div`
  background: #F8F9FA;
  min-height: 100vh;
  padding-bottom: 3rem;
  width: 100%;
  max-width: 100vw; // Prevent overflow
  overflow-x: hidden; // Hide any overflow
`;

const BreadcrumbSection = styled.div`
  background: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  overflow-x: hidden;
  
  @media (min-width: 768px) {
    padding: 0 2rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #2D3436;
  margin-bottom: 0.5rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  flex-wrap: wrap;
`;

const BreadcrumbLink = styled.a`
  color: #6C9A7F;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  
  &:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: #636E72;
  flex-shrink: 0;
`;

const BreadcrumbCurrent = styled.span`
  color: #636E72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const ShopLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const FilterToggle = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  width: 100%;
  
  &:hover {
    background: #5A8569;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 1024px) {
    display: flex;
  }
`;

interface SidebarProps {
  $isOpen?: boolean;
}

const Sidebar = styled.div<SidebarProps>`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  height: fit-content;
  position: sticky;
  top: 20px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 1024px) {
    position: relative;
    top: auto;
    margin-bottom: 2rem;
    
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #E1E8ED;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FilterTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FilterSubtitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FilterCheckbox = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  
  input {
    margin-right: 0.75rem;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  label {
    font-size: 0.875rem;
    color: #2D3436;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    span {
      color: #636E72;
      font-size: 0.75rem;
      flex-shrink: 0;
    }
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterRadio = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  
  input {
    margin-right: 0.75rem;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  label {
    font-size: 0.875rem;
    color: #2D3436;
    cursor: pointer;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ResultsText = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  flex-shrink: 0;
  
  span {
    font-size: 0.875rem;
    color: #2D3436;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SortSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #E1E8ED;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  color: #2D3436;
  cursor: pointer;
  width: auto;
  min-width: 150px;
  flex-shrink: 0;
  
  &:focus {
    outline: none;
    border-color: #6C9A7F;
  }
  
  option {
    background: white;
    color: #2D3436;
  }
  
  @media (max-width: 768px) {
    min-width: 120px;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SaleBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: #6C9A7F;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
  width: auto;
  max-width: 100%;
  overflow-x: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PriceRangeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

const PriceInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  
  span {
    font-size: 0.875rem;
    color: #636E72;
    flex-shrink: 0;
  }
  
  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #E1E8ED;
    border-radius: 6px;
    font-size: 0.875rem;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    
    &:focus {
      outline: none;
      border-color: #6C9A7F;
    }
  }
`;

const PriceSliderContainer = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  margin-top: 0.5rem;
`;

const PriceSlider = styled.input`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  height: 6px;
  border-radius: 3px;
  background: #E1E8ED;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6C9A7F;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6C9A7F;
    cursor: pointer;
    border: none;
  }
`;

const Stars = styled.div`
  display: flex;
  gap: 0.125rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

const Star = styled.span<{ $filled: boolean }>`
  color: ${props => props.$filled ? '#FFD700' : '#E1E8ED'};
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const RatingValue = styled.span`
  font-size: 0.75rem;
  color: #636E72;
  flex-shrink: 0;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 Aspect Ratio (instead of 1:1) */
  overflow: hidden;
  cursor: pointer;
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  display: block;
  
  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  padding: 1rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

const ProductName = styled.h3`
  font-size: 0.9rem;
  color: #2D3436;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: #6C9A7F;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const ProductCategory = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

const ProductPriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  flex-wrap: wrap;
`;

const ProductPrice = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #6C9A7F;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const OriginalPrice = styled.div`
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
  flex-shrink: 0;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 0.6rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-1px);
  }
  
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
`;

const WishlistButton = styled.button<{ $active?: boolean }>`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$active ? '#6C9A7F' : 'white'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 2;
  
  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.$active ? 'white' : '#636E72'};
    fill: ${props => props.$active ? 'white' : 'none'};
    flex-shrink: 0;
  }
  
  &:hover {
    background: #6C9A7F;
    
    svg {
      color: white;
      fill: white;
    }
  }
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  padding: 0.5rem 0;
  flex-wrap: wrap;
  
  /* Hide scrollbar but keep functionality */
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 480px) {
    gap: 0.25rem;
  }
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
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: #6C9A7F;
    color: white;
    border-color: #6C9A7F;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }
`;

const PaginationDots = styled.span`
  padding: 0.5rem;
  color: #636E72;
  font-size: 0.875rem;
  width: auto;
  flex-shrink: 0;
`;

const ServicesSection = styled.div`
  background: #f8f9fa;
  padding: 2.5rem 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding: 1.5rem 0;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ServiceCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  padding: 1.5rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 1024px) {
    flex-direction: row;
    text-align: left;
    gap: 1rem;
    padding: 1rem;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
    padding: 1rem;
  }
`;

const ServiceIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #6C9A7F;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
  
  @media (max-width: 1024px) {
    width: 40px;
    height: 40px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
    
    svg {
      width: 19px;
      height: 19px;
    }
  }
`;

const ServiceContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 1024px) {
    align-items: flex-start;
    text-align: left;
  }
  
  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
  }
`;

const ServiceTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ServiceText = styled.p`
  font-size: 0.8rem;
  color: #636E72;
  margin: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  line-height: 1.4;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;
