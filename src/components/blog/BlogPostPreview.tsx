import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiHeart, FiMessageCircle } from 'react-icons/fi';

interface BlogPostPreviewProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category?: {
    name: string;
  };
  readingTime: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  publishedAt: string;
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({
  id,
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  readingTime,
  likesCount,
  commentsCount,
  viewsCount,
  publishedAt
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  console.log('BlogPostPreview: Rendering with slug:', slug);
  console.log('BlogPostPreview: Featured image URL:', featuredImage);

  const handleNavigate = () => {
    console.log('BlogPostPreview: Navigating to /blog/', slug);
    navigate(`/blog/${slug}`);
  };

  const handleImageError = () => {
    console.log('BlogPostPreview: Image failed to load for', slug);
    setImageError(true);
  };

  return (
    <ArticleCard onClick={handleNavigate}>
      <ArticleImage 
        src={imageError || !featuredImage ? '/placeholder-blog.jpg' : featuredImage} 
        alt={title} 
        onError={handleImageError}
      />
      <ArticleContent>
        {category && (
          <ArticleCategory>
            {category.name}
          </ArticleCategory>
        )}
        <ArticleTitle>{title}</ArticleTitle>
        <ArticleExcerpt>{excerpt}</ArticleExcerpt>
        <ArticleMeta>
          <MetaItem>
            <FiClock />
            <span>{readingTime} min read</span>
          </MetaItem>
          <MetaItem>
            <FiHeart />
            <span>{likesCount}</span>
          </MetaItem>
          <MetaItem>
            <FiMessageCircle />
            <span>{commentsCount}</span>
          </MetaItem>
        </ArticleMeta>
      </ArticleContent>
    </ArticleCard>
  );
};

export default BlogPostPreview;

// Styled Components
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