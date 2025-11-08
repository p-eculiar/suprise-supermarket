import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { blogService } from '../../services/blogService';

const TestReadingTime: React.FC = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['test-posts'],
    queryFn: () => blogService.getPosts()
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <h2>Reading Time Test</h2>
      {posts.map((post: any) => (
        <PostItem key={post.id}>
          <h3>{post.title}</h3>
          <p>Reading Time: {post.reading_time} min read</p>
          <p>Excerpt: {post.excerpt}</p>
        </PostItem>
      ))}
    </Container>
  );
};

export default TestReadingTime;

const Container = styled.div`
  padding: 2rem;
`;

const PostItem = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;