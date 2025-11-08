import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { ThemeProvider, DefaultTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { theme as globalTheme } from '../theme';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import toast from '../components/common/Toast';
import { productService, Product } from '../services/productService';
import AIChatbot from '../components/common/AIChatbot';
import { useAuth } from '../contexts/AuthContext';
import { handleAddToCart } from '../utils/cartHelpers';
import { useRealtime } from '../hooks/useRealtime';
import { supabase } from '../lib/supabase';
import { useMultipleLoadingStates } from '../hooks/useLoadingState';
import { HomePageLoader, ProductCardLoader } from '../components/common/GranularLoading';
import { useSettings } from '../contexts/SettingsContext';


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
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const { formatCurrency } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'popular'>('featured');
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);
  const dealsScrollRef = useRef<HTMLDivElement>(null);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [homeCategories, setHomeCategories] = useState<Array<{ name: string; count: number; image_url?: string }>>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // Real data states
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [dealsProducts, setDealsProducts] = useState<Product[]>([]);
  
  // Granular loading states for different sections
  const loadingStates = useMultipleLoadingStates();
  
  // Initialize loading states for different sections - only run once
  useEffect(() => {
    console.log('🔄 Initializing loading states');
    const keys = [
      'featured',
      'bestsellers',
      'popular',
      'deals',
      'categories',
      'promos',
      'features'
    ];
    
    // Initialize all loading states to true
    keys.forEach(key => {
      console.log('Setting loading state for', key, 'to true');
      loadingStates.setLoading(key, true);
    });
    console.log('✅ Loading states initialized');
  }, []); // Empty dependency array to run only once
  
  const [loading, setLoading] = useState(true);
  // Promo banner images from DB
  const [promoVegImage, setPromoVegImage] = useState<string | null>(null);
  const [promoRightImage, setPromoRightImage] = useState<string | null>(null);
  const [featureCards, setFeatureCards] = useState<Array<{ title: string; label: string; image_url: string; category: string }>>([]);
  // Track category images that failed to load so we can show emoji fallback
  const [brokenCategoryImages, setBrokenCategoryImages] = useState<Set<string>>(new Set());
  // Track product images that failed to load
  const [brokenProductImages, setBrokenProductImages] = useState<Set<string>>(new Set());
  // Track deal images that failed to load
  const [brokenDealImages, setBrokenDealImages] = useState<Set<string>>(new Set());

  // Create a function to clear product service cache
  const clearProductCache = useCallback(() => {
    productService.clearCache();
  }, []);

  // Clear cache when user authentication state changes
  useEffect(() => {
    clearProductCache();
  }, [isAuthenticated, user, clearProductCache]);



  // Load categories with images from products
  const loadCategories = async () => {
    try {
      loadingStates.setLoading('categories', true);
      console.log('🔄 Loading categories from database...');
      
      // First, try to get all products to understand what we're working with
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('category, active, image_url')
        .eq('active', true);
      
      if (productsError) {
        console.error('❌ Error fetching products for categories:', productsError);
      } else {
        console.log('📊 Found', allProducts?.length || 0, 'active products');
      }
      
      // Prefer explicit categories table (with optional image), else group products
      const { data: catRows, error: catErr } = await supabase
        .from('categories')
        .select('name, image_url')
        .order('name', { ascending: true });

      let processedCategories: string[] = [];
      let categoriesWithMeta: Array<{ name: string; count: number; image_url?: string }> = [];

      if (!catErr && catRows && catRows.length > 0) {
        console.log('📋 Found categories table with', catRows.length, 'categories');
        // Count products per category and get first image
        const counts = new Map<string, number>();
        const images = new Map<string, string>();
        
        allProducts?.forEach((p: any) => {
          counts.set(p.category, (counts.get(p.category) || 0) + 1);
          // Set image if not already set and product has image
          if (!images.has(p.category) && p.image_url) {
            images.set(p.category, p.image_url);
          }
        });

        // Filter out categories that don't have any products
        const categoriesWithProducts = (catRows as any[]).filter((cat: any) => 
          counts.get(cat.name) && counts.get(cat.name)! > 0
        );
        
        console.log('✅ Categories with products:', categoriesWithProducts.length);

        categoriesWithMeta = categoriesWithProducts.map((r: any) => ({
          name: r.name,
          image_url: r.image_url || images.get(r.name), // Use category image or first product image
          count: counts.get(r.name) || 0,
        }));
        processedCategories = categoriesWithMeta.map(c => c.name);
      } else {
        console.log('📋 No categories table or error, using product service to get categories');
        const categories = await productService.getCategories();
        console.log('📊 Raw categories from database (fallback):', categories);
        processedCategories = (categories || []).filter(Boolean);
        
        // Build counts and get first image for each category
        const counts = new Map<string, number>();
        const images = new Map<string, string>();
        
        allProducts?.forEach((p: any) => {
          counts.set(p.category, (counts.get(p.category) || 0) + 1);
          // Set image if not already set and product has image
          if (!images.has(p.category) && p.image_url) {
            images.set(p.category, p.image_url);
          }
        });
        
        // Filter out categories that don't have any products
        processedCategories = processedCategories.filter(cat => 
          counts.get(cat) && counts.get(cat)! > 0
        );
        
        categoriesWithMeta = processedCategories.map(name => ({ 
          name, 
          count: counts.get(name) || 0,
          image_url: images.get(name) // First product image for this category
        }));
      }
      
      // If still no categories, use fallback
      if (processedCategories.length === 0) {
        console.log('⚠️ No categories found, using fallback categories');
        const fallback = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Bakery', 'Beverages', 'Snacks'];
        processedCategories = fallback;
        categoriesWithMeta = fallback.map(n => ({ name: n, count: allProducts?.filter((p: any) => p.category === n).length || 0 }));
      }

      console.log('✅ Final categories loaded:', processedCategories.length, processedCategories);
      setProductCategories(processedCategories);
      setHomeCategories(categoriesWithMeta);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      const fallbackCategories = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Bakery', 'Beverages', 'Snacks'];
      setProductCategories(fallbackCategories);
      setHomeCategories(fallbackCategories.map(n => ({ name: n, count: 0 })));
    } finally {
      loadingStates.setLoading('categories', false);
    }
  };

  // Add an effect to log when productCategories changes
  useEffect(() => {
    console.log('Product categories updated:', productCategories);
    console.log('Product categories count:', productCategories.length);
  }, [productCategories]);

  // Load products and categories from database when auth is ready
  useEffect(() => {
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }
    console.log('Auth ready, initializing data...');
    const initializeData = async () => {
      try {
        await loadProducts();
        await loadCategories();
        await loadPromoImages();
        await loadFeatureCards();
      } catch (error: any) {
        console.error('❌ Error initializing data:', error);
        toast.error('Failed to load page data: ' + (error.message || 'Unknown error'));
        // Ensure loading states are reset even if there's an error
        setLoading(false);
        loadingStates.setLoading('featured', false);
        loadingStates.setLoading('bestsellers', false);
        loadingStates.setLoading('popular', false);
        loadingStates.setLoading('deals', false);
        loadingStates.setLoading('categories', false);
        loadingStates.setLoading('promos', false);
        loadingStates.setLoading('features', false);
      }
    };
    initializeData();
  }, [authLoading]); // Re-run when authLoading changes

  // Realtime updates for products to reflect admin CRUD immediately
  useRealtime({
    table: 'products',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: () => {
      loadProducts();
      loadCategories();
    },
    channelName: 'home-products-realtime'
  });

  // Realtime updates for categories
  useRealtime({
    table: 'categories',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: () => {
      loadCategories();
    },
    channelName: 'home-categories-realtime'
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading products from database...');
      
      // Force refresh the Supabase session to ensure we have the correct permissions
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      // Start all loading states
      loadingStates.setLoading('featured', true);
      loadingStates.setLoading('bestsellers', true);
      loadingStates.setLoading('popular', true);
      loadingStates.setLoading('deals', true);
      
      // Load all products without active filter to ensure we get all products
      console.log('Loading all products...');
      const allProducts = await productService.getAllProducts();
      console.log('All products loaded:', allProducts?.length || 0);
      
      // Check if we got any products
      if (!allProducts || allProducts.length === 0) {
        console.warn('⚠️ No products found in database');
      }
      
      // Load products in parallel for better performance
      console.log('Loading featured products...');
      const featured = await productService.getFeaturedProducts(6).catch(e => { 
        console.error('Featured error:', e); 
        return []; 
      });
      
      console.log('Loading bestsellers...');
      const bestsellers = await productService.getBestSellers(6).catch(e => { 
        console.error('Bestsellers error:', e); 
        return []; 
      });
      
      console.log('Loading popular products...');
      const popular = await productService.getPopularProducts(6).catch(e => { 
        console.error('Popular error:', e); 
        return []; 
      });
      
      console.log('Loading deals...');
      const deals = await productService.getDealsOfWeek(8).catch(e => { 
        console.error('Deals error:', e); 
        return []; 
      });
      
      console.log('Products loaded:', { 
        featured: featured?.length || 0, 
        bestsellers: bestsellers?.length || 0, 
        popular: popular?.length || 0, 
        deals: deals?.length || 0 
      });
      
      // Fallbacks when specific lists are empty – show most recent products
      const recent = (allProducts || []).slice(0, 6);
      console.log('Using fallback products:', recent.length);
      
      setFeaturedProducts(featured && featured.length ? featured : recent);
      setBestSellerProducts(bestsellers && bestsellers.length ? bestsellers : recent);
      setPopularProducts(popular && popular.length ? popular : recent);
      setDealsProducts(deals && deals.length ? deals : recent);
      
      // Set all loading states to false
      console.log('Setting loading states to false');
      loadingStates.setLoading('featured', false);
      loadingStates.setLoading('bestsellers', false);
      loadingStates.setLoading('popular', false);
      loadingStates.setLoading('deals', false);
      
      console.log('Products state updated');
    } catch (error) {
      console.error('❌ Error loading products:', error);
      toast.error('Failed to load products');
      
      // Try to fetch products without any filters as a fallback
      try {
        console.log('Trying fallback - loading all products without filters');
        const allProducts = await productService.getAllProducts();
        console.log('Fallback products count:', allProducts?.length || 0);
        const fallbackProducts = allProducts?.slice(0, 6) || [];
        setFeaturedProducts(fallbackProducts);
        setBestSellerProducts(fallbackProducts);
        setPopularProducts(fallbackProducts);
        setDealsProducts(fallbackProducts);
        console.log('Fallback products set');
      } catch (fallbackError) {
        console.error('❌ Fallback product loading also failed:', fallbackError);
        // Set empty arrays to ensure loading completes
        setFeaturedProducts([]);
        setBestSellerProducts([]);
        setPopularProducts([]);
        setDealsProducts([]);
        console.log('Set empty product arrays');
      } finally {
        // Set all loading states to false even in fallback
        console.log('Setting loading states to false in fallback');
        loadingStates.setLoading('featured', false);
        loadingStates.setLoading('bestsellers', false);
        loadingStates.setLoading('popular', false);
        loadingStates.setLoading('deals', false);
      }
    } finally {
      setLoading(false);
      console.log('✅ Home page loading complete');
    }
  };

  // Load promo banner images from live products
  const loadPromoImages = async () => {
    try {
      loadingStates.setLoading('promos', true);
      // First try banners table selections
      const { data: bannerRows } = await supabase.from('banners').select('slot,product_id');
      const bannerSel: Record<'left' | 'right', string | null> = { left: null, right: null };
      (bannerRows || []).forEach((b: { slot: 'left' | 'right'; product_id: string }) => {
        bannerSel[b.slot] = b.product_id || null;
      });

      if (bannerSel.left) {
        const { data: leftProd } = await supabase.from('products').select('image_url').eq('id', bannerSel.left).single();
        setPromoVegImage(leftProd?.image_url || null);
      }
      if (bannerSel.right) {
        const { data: rightProd } = await supabase.from('products').select('image_url').eq('id', bannerSel.right).single();
        setPromoRightImage(rightProd?.image_url || null);
      }

      if (bannerSel.left && bannerSel.right) return;

      // Fallbacks by category if a banner slot not set
      // Left card: Vegetables (without active filter)
      const { data: veg } = await supabase
        .from('products')
        .select('image_url')
        .eq('category', 'Vegetables')
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      setPromoVegImage(veg?.image_url || null);

      // Right card: use Fruits (or any latest product without active filter)
      const { data: right } = await supabase
        .from('products')
        .select('image_url')
        .eq('category', 'Fruits')
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (right?.image_url) {
        setPromoRightImage(right.image_url);
      } else {
        // Fallback: any product image (without active filter)
        const { data: anyProd } = await supabase
          .from('products')
          .select('image_url')
          .not('image_url', 'is', null)
          .neq('image_url', '')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        setPromoRightImage(anyProd?.image_url || null);
      }
    } catch (e) {
      console.error('Error loading promo images', e);
    } finally {
      loadingStates.setLoading('promos', false);
    }
  };

  // Load Feature Cards (after hero) from DB
  const loadFeatureCards = async () => {
    try {
      loadingStates.setLoading('features', true);
      // Three cards: Vegetables, Dairy, Meat (fallback to any category with image) without active filter
      const categories = ['Vegetables', 'Dairy', 'Meat'];
      const results: Array<{ title: string; label: string; image_url: string; category: string }> = [];
      for (const cat of categories) {
        const { data } = await supabase
          .from('products')
          .select('name,image_url,category')
          .eq('category', cat)
          .not('image_url', 'is', null)
          .neq('image_url', '')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (data?.image_url) {
          results.push({ title: cat.toUpperCase(), label: 'Fresh & Healthy', image_url: data.image_url, category: cat });
        }
      }
      // Fallbacks if any missing
      if (results.length < 3) {
        const { data: anyProds } = await supabase
          .from('products')
          .select('name,image_url,category')
          .not('image_url', 'is', null)
          .neq('image_url', '')
          .order('created_at', { ascending: false })
          .limit(3 - results.length);
        (anyProds || []).forEach((p: any) => results.push({ title: (p.category || 'Products').toUpperCase(), label: 'Fresh & Healthy', image_url: p.image_url, category: p.category || '' }));
      }
      setFeatureCards(results);
    } catch (e) {
      console.error('Error loading feature cards', e);
    } finally {
      loadingStates.setLoading('features', false);
    }
  };

  // Scroll functions for categories
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? categoriesScrollRef.current.scrollLeft - scrollAmount
        : categoriesScrollRef.current.scrollLeft + scrollAmount;
      
      console.log('Scrolling categories:', { direction, currentScroll: categoriesScrollRef.current.scrollLeft, newScrollLeft });
      
      categoriesScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    } else {
      console.log('Categories scroll ref not available');
    }
  };

  // Add to cart handler
  const handleAddToCartClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.discount !== undefined
        ? product.price / (1 - (product.discount || 0) / 100)
        : undefined,
      imageUrl: product.image_url,
      categoryName: product.category,
      stock: product.stock
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

  // Scroll function for products with proper implementation
  const scrollProducts = (direction: 'left' | 'right') => {
    if (productsScrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' 
        ? productsScrollRef.current.scrollLeft - scrollAmount
        : productsScrollRef.current.scrollLeft + scrollAmount;
      
      console.log('Scrolling products:', { direction, currentScroll: productsScrollRef.current.scrollLeft, newScrollLeft });
      
      productsScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    } else {
      console.log('Products scroll ref not available');
    }
  };

  // Scroll function for deals carousel
  const scrollDeals = (direction: 'left' | 'right') => {
    if (dealsScrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left'
        ? dealsScrollRef.current.scrollLeft - scrollAmount
        : dealsScrollRef.current.scrollLeft + scrollAmount;
      dealsScrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // Add event listener for category updates
  useEffect(() => {
    const handleCategoryUpdate = () => {
      console.log('🔄 Categories updated, refreshing homepage categories');
      clearProductCache();
      loadCategories();
      loadProducts();
    };

    const handleProductUpdate = () => {
      console.log('🔄 Products updated, refreshing homepage products');
      clearProductCache();
      loadProducts();
      loadPromoImages();
      loadFeatureCards();
    };

    window.addEventListener('categoriesUpdated', handleCategoryUpdate);
    window.addEventListener('productsUpdated', handleProductUpdate);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdate);
      window.removeEventListener('productsUpdated', handleProductUpdate);
    };
  }, [clearProductCache, loadCategories, loadProducts, loadPromoImages, loadFeatureCards]);

  return (
    <ThemeProvider theme={globalTheme as unknown as DefaultTheme}>
      <HomeContainer>
        {/* Show full page skeleton on initial load */}
        {loading ? (
          <HomePageLoader />
        ) : (
          <>
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
              <CategorySelectWrapper>
                <CategoryTrigger 
                  onClick={() => {
                    console.log('Toggle category dropdown');
                    setIsCategoryOpen(v => !v);
                  }}
                >
                  <span>{selectedCategory || 'All Categories'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
                </CategoryTrigger>
                {isCategoryOpen && (
                  <CategoryMenu>
                    <CategoryMenuItem 
                      onClick={(e) => { 
                        e.stopPropagation();
                        console.log('Selected: All Categories');
                        setSelectedCategory(''); 
                        setIsCategoryOpen(false); 
                      }}
                    >
                      All Categories
                    </CategoryMenuItem>
                    {productCategories.map((category) => (
                      <CategoryMenuItem 
                        key={category} 
                        onClick={(e) => { 
                          e.stopPropagation();
                          console.log('Selected category:', category);
                          setSelectedCategory(category); 
                          setIsCategoryOpen(false); 
                        }}
                        style={{ 
                          backgroundColor: selectedCategory === category ? '#f0f0f0' : 'white',
                          fontWeight: selectedCategory === category ? 'bold' : 'normal'
                        }}
                      >
                        {category}
                      </CategoryMenuItem>
                    ))}
                  </CategoryMenu>
                )}
              </CategorySelectWrapper>
              <button 
                onClick={() => {
                  console.log('Shop Now clicked, selected category:', selectedCategory);
                  // Navigate with category filter
                  if (selectedCategory) {
                    navigate(`/products?category=${encodeURIComponent(selectedCategory)}`);
                  } else {
                    navigate('/products');
                  }
                }}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#FFD700',
                  color: '#2D3436',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#FFC700';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#FFD700';
                  e.currentTarget.style.color = '#2D3436';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)';
                }}
              >
                Shop Now
              </button>
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
            {(featureCards.length ? featureCards : [
              { title: 'VEGETABLES', label: 'Fresh & Healthy', image_url: promoVegImage || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80', category: 'Vegetables' },
              { title: 'DAIRY', label: 'Organic & Natural', image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop&q=80', category: 'Dairy' },
              { title: 'MEAT', label: 'Farm Fresh Daily', image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&auto=format&fit=crop&q=80', category: 'Meat' },
            ]).map((card, idx) => (
              <FeatureCard key={idx} $bgColor={idx === 0 ? '#E8F5EC' : idx === 1 ? '#FFF4E6' : '#F0F7FF'}>
                <FeatureCardImage loading="lazy" src={card.image_url} alt={card.title} />
                <FeatureCardBadge>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={idx === 1 ? '#FF9800' : idx === 2 ? '#4CAF50' : '#6C9A7F'} strokeWidth="2">
                    {idx === 0 && (<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>)}
                    {idx === 1 && (<path d="M12 2v20M2 12h20"/>)}
                    {idx === 2 && (<path d="M20 6L9 17l-5-5"/>)}
                  </svg>
                </FeatureCardBadge>
                <FeatureCardContent>
                  <FeatureCardLabel>{card.label}</FeatureCardLabel>
                  <FeatureCardTitle>{card.title}</FeatureCardTitle>
                  <FeatureCardButton to={`/products?category=${encodeURIComponent(card.category)}`}>Shop Now →</FeatureCardButton>
                </FeatureCardContent>
              </FeatureCard>
            ))}
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
            {homeCategories.map((cat, idx) => {
              const key = (cat.name || '').toLowerCase();
              const emojiMap: Record<string, string> = {
                'vegetables': '🥬', 'greens': '🥬', 'produce': '🥬',
                'fruits': '🍓', 'fruit': '🍎',
                'dairy': '🥛', 'milk & dairy': '🥛', 'milk': '🥛', 'cheese': '🧀', 'yogurt': '🍶',
                'meat': '🍖', 'meat & fish': '🍖', 'poultry': '🍗', 'fish': '🐟', 'seafood': '🦐',
                'bakery': '🍞', 'bread': '🥖', 'pastries': '🧁',
                'beverages': '🥤', 'drinks': '🥤', 'juice': '🧃', 'coffee': '☕', 'tea': '🍵', 'water': '💧',
                'snacks': '🍿', 'chips': '🥔', 'cookies': '🍪', 'candy': '🍬',
                'organic': '🌿', 'fresh': '🌱',
                'frozen': '🍦', 'ice cream': '🍨',
                'grains': '🌾', 'rice': '🍚', 'cereals': '🥣',
                'household': '🧼', 'cleaning': '🧽', 'personal care': '🪥',
                'spices': '🧂', 'condiments': '🧂', 'oils': '🫒', 'canned goods': '🥫',
              };
              const icon = emojiMap[key] || '🛍️';
              
              // Always show an image for all categories, including bakery
              // Use specific fallback images based on category type
              let displayImage = '';
              if (cat.image_url) {
                displayImage = cat.image_url;
              } else if (key.includes('bakery') || key.includes('bread') || key.includes('pastries')) {
                displayImage = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop&q=80'; // Bakery image
              } else if (key.includes('vegetables') || key.includes('greens') || key.includes('produce')) {
                displayImage = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80'; // Vegetables image
              } else if (key.includes('fruits') || key.includes('fruit')) {
                displayImage = 'https://images.unsplash.com/photo-1597362925531-843dff563e2c?w=400&auto=format&fit=crop&q=80'; // Fruits image
              } else if (key.includes('dairy')) {
                displayImage = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop&q=80'; // Dairy image
              } else if (key.includes('meat')) {
                displayImage = 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&auto=format&fit=crop&q=80'; // Meat image
              } else {
                displayImage = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80'; // Default image
              }
              
              return (
                <CategoryBox
                  key={cat.name}
                  $bgColor={['#E8F5EC','#FFEAEA','#FFF4E6','#F0F7FF','#FFF0F5','#F5F0FF','#FFE5E5','#E5F5FF','#F0FFE5','#FFF5E5'][idx % 10]}
                  onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <CategoryThumb 
                    src={displayImage} 
                    alt={cat.name} 
                    loading="lazy"
                    onError={() => setBrokenCategoryImages(prev => {
                      const next = new Set(prev);
                      next.add(cat.name);
                      return next;
                    })}
                  />
                  <CategoryLabel>{cat.name} {cat.count ? `(${cat.count})` : ''}</CategoryLabel>
                </CategoryBox>
              );
            })}
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
                <ProductImage 
                  loading="lazy" 
                  src={product.image_url} 
                  alt={product.name} 
                  onError={() => setBrokenProductImages(prev => {
                    const next = new Set(prev);
                    next.add(product.id);
                    return next;
                  })}
                  style={brokenProductImages.has(product.id) ? { 
                    objectFit: 'contain',
                    backgroundColor: '#f0f0f0'
                  } : {}}
                />
                <ProductInfo>
                  <ProductCategory>{product.category}</ProductCategory>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>
                    <CurrentPrice>{formatCurrency(product.price)}</CurrentPrice>
                    {product.discount !== undefined && product.discount > 0 && (
                      <OldPrice>{formatCurrency(product.price / (1 - (product.discount || 0) / 100))}</OldPrice>
                    )}
                  </ProductPrice>
                  {product.rating && product.rating > 0 && (
                    <Rating>⭐⭐⭐⭐⭐ <span>({product.rating.toFixed(1)})</span></Rating>
                  )}
                  <AddToCartBtn onClick={(e) => handleAddToCartClick(e, product)}>
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
                <PromoButton to="/products?category=Vegetables">Shop Now →</PromoButton>
              </PromoContent>
              <PromoImage src={promoVegImage || 'https://images.unsplash.com/photo-1597362925531-843dff563e2c?w=400&auto=format&fit=crop&q=80'} alt="Vegetables" />
            </PromoBanner>

            <PromoBanner $bgColor="#2D3436">
              <PromoContent>
                <PromoLabel $light>Save Up to 30%</PromoLabel>
                <PromoTitle $light>All Tested Organic & Fresh Products</PromoTitle>
                <PromoButton to="/products?category=Fruits">Shop Now →</PromoButton>
              </PromoContent>
              <PromoImage src={promoRightImage || 'https://images.unsplash.com/photo-1610348725531-930a7eaecf80?w=400&auto=format&fit=crop&q=80'} alt="Organic" />
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
                  <NavArrow onClick={() => scrollDeals('left')}>
                    ←
                  </NavArrow>
                  <NavArrow onClick={() => scrollDeals('right')}>
                    →
                  </NavArrow>
                </SectionNav>
              </SectionHeader>

          <DealsGrid ref={dealsScrollRef}>
            {(dealsProducts.length ? dealsProducts : getDisplayedProducts()).map((p) => (
              <DealCard key={p.id} onClick={() => navigate(`/products/${p.id}`)}>
                <DealImage 
                  loading="lazy" 
                  src={p.image_url} 
                  alt={p.name} 
                  onError={() => setBrokenDealImages(prev => {
                    const next = new Set(prev);
                    next.add(p.id);
                    return next;
                  })}
                  style={brokenDealImages.has(p.id) ? { 
                    objectFit: 'contain',
                    backgroundColor: '#f0f0f0'
                  } : {}}
                />
                {(p.discount ?? 0) > 0 && <DealBadge>Sale {p.discount}%</DealBadge>}
                <DealInfo>
                  <DealName>{p.name}</DealName>
                  <DealPrice>
                    <DealCurrentPrice>{formatCurrency(p.price)}</DealCurrentPrice>
                    {(p.discount ?? 0) > 0 && (
                      <DealOldPrice>{formatCurrency(p.price / (1 - (p.discount || 0) / 100))}</DealOldPrice>
                    )}
                  </DealPrice>
                  {p.rating && p.rating > 0 && (
                    <DealRating>⭐⭐⭐⭐⭐ <span>({p.rating.toFixed(1)})</span></DealRating>
                  )}
                  <DealButton onClick={(e) => { e.stopPropagation(); navigate(`/products/${p.id}`); }}>Shop Now →</DealButton>
                </DealInfo>
              </DealCard>
            ))}
          </DealsGrid>
        </ContentContainer>
      </DealsSection>
      
      {/* AI Chatbot */}
      <AIChatbot />
          </>
        )}
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
`;const HeroWrapper = styled.div`
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

const CategorySelectWrapper = styled.div`
  position: relative;
  min-width: 300px;
`;

const CategoryTrigger = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255,255,255,0.25);
  border-radius: 10px;
  background: rgba(45,95,74,0.6);
  color: rgba(255,255,255,0.95);
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer;
`;

const CategoryMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow-y: auto;
  background: #ffffff;
  color: #2D3436;
  border: 1px solid #E1E8ED;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  z-index: 50;
`;

const CategoryMenuItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.9rem;
  border: none;
  background: white;
  cursor: pointer;
  &:hover { background: #F8F9FA; }
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
  padding: 1.5rem 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-width: 160px;
  flex-shrink: 0;
  height: 200px;
  width: 160px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

const CategoryIcon = styled.div`
  font-size: 3rem;
`;

const CategoryThumb = styled.img`
  width: 90%;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1rem;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar { display: none; }

  > div { min-width: 320px; flex-shrink: 0; }
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
