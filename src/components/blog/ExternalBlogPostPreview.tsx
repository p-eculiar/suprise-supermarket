import React from 'react';
import styled from 'styled-components';
import { FiClock, FiUser } from 'react-icons/fi';
import { NewsArticle } from '../../services/newsService';
import { newsService } from '../../services/newsService';
import { useNavigate } from 'react-router-dom';

interface ExternalBlogPostPreviewProps {
  article: NewsArticle;
  onClick?: () => void;
}

const ExternalBlogPostPreview: React.FC<ExternalBlogPostPreviewProps> = ({ 
  article, 
  onClick 
}) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Get the relevant page URL for this article
    const relevantPage = newsService.getRelevantPageUrl(article);
    
    // If there's a custom onClick handler, use it
    if (onClick) {
      onClick();
    } else {
      // Otherwise navigate to the relevant page
      navigate(relevantPage);
    }
  };

  return (
    <ArticleCard onClick={handleCardClick}>
      <ArticleImage 
        src={article.urlToImage || '/placeholder-blog.jpg'} 
        alt={article.title}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (!target.dataset.errored) {
            target.dataset.errored = 'true';
            target.src = '/placeholder-blog.jpg';
          }
        }}
      />
      <ArticleContent>
        <ArticleTitle>{article.title}</ArticleTitle>
        <ArticleExcerpt>{article.description}</ArticleExcerpt>
        <ArticleMeta>
          <MetaItem>
            <FiUser />
            <span>{article.author || 'Anonymous'}</span>
          </MetaItem>
          <MetaItem>
            <FiClock />
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </MetaItem>
        </ArticleMeta>
      </ArticleContent>
    </ArticleCard>
  );
};

export default ExternalBlogPostPreview;

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