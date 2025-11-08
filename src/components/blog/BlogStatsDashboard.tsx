import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';

interface BlogStatistics {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  archived_posts: number;
  average_reading_time: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  total_comments: number;
}

const BlogStatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<BlogStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogStatistics();
  }, []);

  const fetchBlogStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_statistics')
        .select('*')
        .single();

      if (error) throw error;
      
      setStats(data);
    } catch (error) {
      console.error('Error fetching blog statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <div className="spinner"></div>
        <p>Loading blog statistics...</p>
      </LoadingContainer>
    );
  }

  if (!stats) {
    return (
      <ErrorContainer>
        <p>Unable to load blog statistics</p>
      </ErrorContainer>
    );
  }

  return (
    <DashboardContainer>
      <SectionTitle>Blog Statistics</SectionTitle>
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.total_posts}</StatValue>
          <StatLabel>Total Posts</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{stats.published_posts}</StatValue>
          <StatLabel>Published</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{stats.draft_posts}</StatValue>
          <StatLabel>Drafts</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{stats.archived_posts}</StatValue>
          <StatLabel>Archived</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{Math.round(stats.average_reading_time)} min</StatValue>
          <StatLabel>Avg. Reading Time</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{stats.total_views}</StatValue>
          <StatLabel>Total Views</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{stats.total_likes}</StatValue>
          <StatLabel>Total Likes</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{stats.total_shares}</StatValue>
          <StatLabel>Total Shares</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{stats.total_comments}</StatValue>
          <StatLabel>Total Comments</StatLabel>
        </StatCard>
      </StatsGrid>
    </DashboardContainer>
  );
};

export default BlogStatsDashboard;

// Styled Components
const DashboardContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: #F8F9FA;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #6C9A7F;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #636E72;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #636E72;
  
  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #E1E8ED;
    border-top: 3px solid #6C9A7F;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
`;

const ErrorContainer = styled.div`
  background: #F8F9FA;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #636E72;
`;