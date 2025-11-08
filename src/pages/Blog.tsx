import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { blogService, BlogPost, BlogCategory } from '../services/blogService';
import { useAuth } from '../contexts/AuthContext';
import { FiSearch, FiClock, FiHeart, FiMessageCircle, FiUser, FiTag } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from '../components/common/Toast';
import BlogPostPreview from '../components/blog/BlogPostPreview';

const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => blogService.getCategories()
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading, refetch } = useQuery({
    queryKey: ['blog-posts', selectedCategory],
    queryFn: () => blogService.getPosts(selectedCategory || undefined)
  });

  // Search posts
  const { data: searchResults = [], refetch: refetchSearch } = useQuery({
    queryKey: ['blog-search', searchQuery],
    queryFn: () => blogService.searchPosts(searchQuery),
    enabled: false
  });

  useEffect(() => {
    if (searchQuery) {
      refetchSearch();
    } else {
      refetch();
    }
  }, [searchQuery, refetch, refetchSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      refetchSearch();
    }
  };

  const displayedPosts = searchQuery ? searchResults : posts;

  return (
    <Container>
      <Header>
        <Title>Suprise Supermarket Blog</Title>
        <Subtitle>Discover tips, guides, and insights for smarter shopping</Subtitle>
      </Header>

      <SearchSection>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchButton type="submit">
            <FiSearch />
          </SearchButton>
        </SearchForm>
      </SearchSection>

      <MainContent>
        <Sidebar>
          <CategorySection>
            <SectionTitle>Categories</SectionTitle>
            <CategoryList>
              <CategoryItem
                $active={!selectedCategory}
                onClick={() => setSelectedCategory(null)}
              >
                <FiTag />
                <span>All Articles</span>
                <CategoryCount>{posts.length}</CategoryCount>
              </CategoryItem>
              {(() => {
                // Log detailed information about posts and categories
                
                // Create a map to count posts per category
                const categoryPostCount = new Map<string, number>();
                
                // Count posts for each category
                posts.forEach((post: BlogPost, index) => {
                  // Try to get category ID from different sources
                  let categoryId = null;
                  if (post.category_id) {
                    categoryId = post.category_id;
                  } else if (post.category && post.category.id) {
                    categoryId = post.category.id;
                  } else if (post.category?.name) {
                    // Try to find category ID by name
                    const matchingCategory = categories.find((cat: BlogCategory) => cat.name === (post.category?.name || ''));
                    if (matchingCategory) {
                      categoryId = matchingCategory.id;
                    }
                  }
                  
                  if (categoryId) {
                    const currentCount = categoryPostCount.get(categoryId) || 0;
                    categoryPostCount.set(categoryId, currentCount + 1);
                  }
                });
                
                console.log('Category post counts:', Array.from(categoryPostCount.entries()));
                
                // Create a set of category IDs that have posts
                const categoryIdsWithPosts = new Set(Array.from(categoryPostCount.keys()));
                
                // Log each category for debugging
                categories.forEach((category: BlogCategory, index) => {
                  const categoryId = category.id;
                  const hasPosts = categoryIdsWithPosts.has(categoryId);
                  const postCount = categoryPostCount.get(categoryId) || 0;
                });
                
                // Filter categories to only show those with posts
                const filteredCategories = categories.filter((category: BlogCategory) => {
                  const hasPosts = categoryIdsWithPosts.has(category.id);
                  return hasPosts;
                });
                
                return filteredCategories.map((category: BlogCategory) => (
                  <CategoryItem
                    key={category.id}
                    $active={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <FiTag />
                    <span>{category.name}</span>
                    <CategoryCount>
                      {posts.filter((post: BlogPost) => {
                        // Try to match post to category from different sources
                        let postCategoryId = post.category_id;
                        if (!postCategoryId && post.category) {
                          if (post.category.id) {
                            postCategoryId = post.category.id;
                          } else if (post.category?.name) {
                            // Try to find category ID by name
                            const matchingCategory = categories.find((cat: BlogCategory) => cat.name === (post.category?.name || ''));
                            if (matchingCategory) {
                              postCategoryId = matchingCategory.id;
                            }
                          }
                        }
                        return postCategoryId === category.id;
                      }).length}
                    </CategoryCount>
                  </CategoryItem>
                ));
              })()}
            </CategoryList>
          </CategorySection>

          <PopularSection>
            <SectionTitle>Popular This Week</SectionTitle>
            <PopularList>
              {posts.slice(0, 3).map((post: BlogPost) => (
                <PopularItem
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <PopularImage 
                    src={post.featured_image || '/placeholder-blog.jpg'} 
                    alt={post.title} 
                    onError={(e) => {
                      // Set a flag on the element to prevent infinite loop
                      const target = e.target as HTMLImageElement;
                      if (!target.dataset.errored) {
                        target.dataset.errored = 'true';
                        target.src = '/placeholder-blog.jpg';
                      }
                    }}
                  />
                  <PopularContent>
                    <PopularTitle>{post.title}</PopularTitle>
                    <PopularMeta>
                      <FiClock />
                      <span>{post.reading_time} min read</span>
                    </PopularMeta>
                  </PopularContent>
                </PopularItem>
              ))}
            </PopularList>
          </PopularSection>
        </Sidebar>

        <Content>
          <SectionHeader>
            <SectionTitle>
              {selectedCategory 
                ? categories.find((cat: BlogCategory) => cat.id === selectedCategory)?.name 
                : 'Latest Articles'}
            </SectionTitle>
            <ResultsCount>
              {displayedPosts.length} {displayedPosts.length === 1 ? 'article' : 'articles'} found
            </ResultsCount>
          </SectionHeader>

          {postsLoading || categoriesLoading ? (
            <LoadingContainer>
              <div className="spinner"></div>
              <p>Loading articles...</p>
            </LoadingContainer>
          ) : displayedPosts.length === 0 ? (
            <EmptyState>
              <FiMessageCircle size={48} />
              <h3>No articles found</h3>
              <p>Try adjusting your search or browse different categories</p>
            </EmptyState>
          ) : (
            <ArticlesGrid>
              {displayedPosts.map((post: BlogPost) => (
                <BlogPostPreview
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  featuredImage={post.featured_image}
                  category={post.category}
                  readingTime={post.reading_time}
                  likesCount={post.likes_count}
                  commentsCount={post.comments_count}
                  viewsCount={post.views_count}
                  publishedAt={post.published_at}
                />
              ))}
            </ArticlesGrid>
          )}
        </Content>
      </MainContent>
    </Container>
  );
};

export default BlogPage;

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #636E72;
  max-width: 700px;
  margin: 0 auto;
  font-weight: 400;
`;

const SearchSection = styled.div`
  max-width: 600px;
  margin: 0 auto 3rem;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #E1E8ED;
  border-radius: 50px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.2);
  }
`;

const SearchButton = styled.button`
  padding: 1rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #5A8470;
    transform: translateY(-2px);
  }
`;

const MainContent = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 300px;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const Content = styled.div`
  flex: 1;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0;
`;

const ResultsCount = styled.div`
  font-size: 1rem;
  color: #636E72;
`;

const CategorySection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CategoryItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.$active ? '#6C9A7F' : '#636E72'};
  background: ${props => props.$active ? '#6C9A7F15' : 'transparent'};
  font-weight: ${props => props.$active ? 500 : 300};
  
  &:hover {
    background: #F8F9FA;
  }
  
  svg {
    flex-shrink: 0;
  }
`;

const CategoryCount = styled.span`
  margin-left: auto;
  background: #E1E8ED;
  color: #636E72;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const PopularSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const PopularList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PopularItem = styled.div`
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const PopularImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
`;

const PopularContent = styled.div`
  flex: 1;
`;

const PopularTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 500;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
`;

const PopularMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #999;
`;

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ArticleCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const ArticleImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ArticleContent = styled.div`
  padding: 1.5rem;
`;

const ArticleCategory = styled.div`
  display: inline-block;
  background: #6C9A7F15;
  color: #6C9A7F;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ArticleTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0 0 1rem 0;
  line-height: 1.4;
`;

const ArticleExcerpt = styled.p`
  font-size: 0.95rem;
  color: #636E72;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
  font-weight: 300;
`;

const ArticleMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #F0F0F0;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #999;
  
  svg {
    flex-shrink: 0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #636E72;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #E1E8ED;
    border-top: 4px solid #6C9A7F;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #636E72;
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #2D3436;
  }
  
  p {
    margin: 0;
    max-width: 400px;
  }
`;