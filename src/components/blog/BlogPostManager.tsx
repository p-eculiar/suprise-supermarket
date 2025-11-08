import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService, BlogPost, BlogCategory } from '../../services/blogService';
import { FiEdit, FiTrash2, FiPlus, FiEye, FiClock, FiHeart, FiMessageCircle } from 'react-icons/fi';
import toast from '../common/Toast';

interface BlogPostManagerProps {
  onEditPost: (post: BlogPost) => void;
}

const BlogPostManager: React.FC<BlogPostManagerProps> = ({ onEditPost }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading, refetch } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: () => blogService.getPosts()
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => blogService.getCategories()
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: (postId: string) => blogService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Post deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete post');
    }
  });

  const handleDeletePost = (postId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the post "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(postId);
    }
  };

  const filteredPosts = selectedCategory
    ? posts.filter((post: BlogPost) => post.category_id === selectedCategory)
    : posts;

  return (
    <Container>
      <Header>
        <Title>Blog Post Manager</Title>
        <Actions>
          <CategoryFilter>
            <select 
              value={selectedCategory || ''} 
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map((category: BlogCategory) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </CategoryFilter>
          <CreateButton onClick={() => onEditPost({} as BlogPost)}>
            <FiPlus /> Create New Post
          </CreateButton>
        </Actions>
      </Header>

      {postsLoading ? (
        <LoadingContainer>
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </LoadingContainer>
      ) : filteredPosts.length === 0 ? (
        <EmptyState>
          <FiEdit size={48} />
          <h3>No posts found</h3>
          <p>Create your first blog post to get started</p>
          <CreateButton onClick={() => onEditPost({} as BlogPost)}>
            <FiPlus /> Create New Post
          </CreateButton>
        </EmptyState>
      ) : (
        <PostsTable>
          <thead>
            <tr>
              <TableHeader>Title</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Views</TableHeader>
              <TableHeader>Likes</TableHeader>
              <TableHeader>Comments</TableHeader>
              <TableHeader>Published</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post: BlogPost) => (
              <TableRow key={post.id}>
                <TableCell>
                  <PostTitle>{post.title}</PostTitle>
                  <PostExcerpt>{post.excerpt}</PostExcerpt>
                </TableCell>
                <TableCell>
                  <CategoryTag>
                    {post.category?.name || 'Uncategorized'}
                  </CategoryTag>
                </TableCell>
                <TableCell>
                  <StatusBadge status={post.status}>
                    {post.status}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <StatItem>
                    <FiEye />
                    <span>{post.views_count}</span>
                  </StatItem>
                </TableCell>
                <TableCell>
                  <StatItem>
                    <FiHeart />
                    <span>{post.likes_count}</span>
                  </StatItem>
                </TableCell>
                <TableCell>
                  <StatItem>
                    <FiMessageCircle />
                    <span>{post.comments_count}</span>
                  </StatItem>
                </TableCell>
                <TableCell>
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}
                </TableCell>
                <TableCell>
                  <ActionButtons>
                    <ActionButton onClick={() => onEditPost(post)}>
                      <FiEdit />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleDeletePost(post.id, post.title)}
                      disabled={deleteMutation.isPending}
                    >
                      <FiTrash2 />
                    </ActionButton>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </PostsTable>
      )}
    </Container>
  );
};

export default BlogPostManager;

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CategoryFilter = styled.div`
  select {
    padding: 0.5rem 1rem;
    border: 1px solid #E1E8ED;
    border-radius: 6px;
    font-size: 0.9rem;
    background: white;
    color: #2D3436;
    
    &:focus {
      outline: none;
      border-color: #6C9A7F;
    }
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8470;
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
    margin: 0 0 1.5rem 0;
    max-width: 400px;
  }
`;

const PostsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: #2D3436;
  border-bottom: 2px solid #F0F0F0;
  white-space: nowrap;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #F0F0F0;
  
  &:hover {
    background: #F8F9FA;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: top;
  
  &:first-child {
    min-width: 250px;
  }
`;

const PostTitle = styled.div`
  font-weight: 500;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const PostExcerpt = styled.div`
  font-size: 0.85rem;
  color: #636E72;
  font-weight: 300;
`;

const CategoryTag = styled.div`
  display: inline-block;
  background: #6C9A7F15;
  color: #6C9A7F;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'published': return '#00B894';
      case 'draft': return '#FDCB6E';
      case 'archived': return '#636E72';
      default: return '#E1E8ED';
    }
  }};
  color: white;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #636E72;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  background: #F8F9FA;
  border: 1px solid #E1E8ED;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #E1E8ED;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;