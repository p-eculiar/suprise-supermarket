import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiHeart, FiShare2, FiMessageCircle, FiArrowLeft, FiClock, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { newsService, NewsArticle } from '../services/newsService';
import { supabase } from '../lib/supabase';
import { toast } from '../components/common/Toast';

const ExternalBlogPostPage: React.FC = () => {
  const { index } = useParams<{ index: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const articles = await newsService.getTopHeadlines();
        const articleIndex = parseInt(index || '0', 10);
        
        if (articles && articles.length > articleIndex) {
          const fetchedArticle = articles[articleIndex];
          setArticle(fetchedArticle);
          // For external articles, we'll use default counts since they don't have these properties
          setLikesCount(0);
          setCommentsCount(0);
          setSharesCount(0);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [index]);

  useEffect(() => {
    // Check if user has liked this article
    const checkIfLiked = async () => {
      if (user && article) {
        const { data, error } = await supabase
          .from('blog_likes')
          .select('*')
          .eq('user_id', user.id)
          .eq('external_article_url', article.url)
          .single();

        if (!error && data) {
          setIsLiked(true);
        }
      }
    };

    checkIfLiked();
  }, [user, article]);

  const handleLike = async () => {
    if (!user) {
      toast.info('Please log in to like articles');
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('external_article_url', article?.url);

        if (!error) {
          setIsLiked(false);
          setLikesCount(prev => prev - 1);
        }
      } else {
        // Like
        const { error } = await supabase
          .from('blog_likes')
          .insert({
            user_id: user.id,
            external_article_url: article?.url,
            title: article?.title
          });

        if (!error) {
          setIsLiked(true);
          setLikesCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error liking article:', err);
      toast.error('Failed to like article');
    }
  };

  const handleShare = async () => {
    try {
      // Increment share count in database
      const { error } = await supabase.rpc('increment_shares_count', {
        article_url: article?.url
      });

      if (!error) {
        setSharesCount(prev => prev + 1);
        toast.success('Article shared successfully!');
      }
    } catch (err) {
      console.error('Error sharing article:', err);
      toast.error('Failed to share article');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please log in to comment');
      return;
    }

    if (!comment.trim()) return;

    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          user_id: user.id,
          external_article_url: article?.url,
          content: comment,
          title: article?.title
        });

      if (!error) {
        setComment('');
        setCommentsCount(prev => prev + 1);
        toast.success('Comment added successfully!');
        // Refresh comments
        fetchComments();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment');
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          user:users(full_name, avatar_url)
        `)
        .eq('external_article_url', article?.url)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => {
    if (article) {
      fetchComments();
    }
  }, [article]);

  if (loading) {
    return (
      <LoadingContainer>
        <div className="spinner" />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <h2>{error}</h2>
        <button onClick={() => navigate('/blog')}>Back to Blog</button>
      </ErrorContainer>
    );
  }

  if (!article) {
    return (
      <ErrorContainer>
        <h2>Article not found</h2>
        <button onClick={() => navigate('/blog')}>Back to Blog</button>
      </ErrorContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/blog')}>
          <FiArrowLeft /> Back to Blog
        </BackButton>
      </Header>

      <ArticleHeader>
        <CategoryTag>{article.source?.name || 'News'}</CategoryTag>
        <Title>{article.title}</Title>
        <MetaInfo>
          <MetaItem>
            <FiUser />
            <span>{article.author || 'Suprise Supermarket Team'}</span>
          </MetaItem>
          <MetaItem>
            <FiClock />
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </MetaItem>
          <MetaItem>
            <FiClock />
            <span>5 min read</span>
          </MetaItem>
        </MetaInfo>
      </ArticleHeader>

      {article.urlToImage && (
        <FeaturedImage src={article.urlToImage} alt={article.title} />
      )}

      <Content>
        <ArticleContent>
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p>{article.description}</p>
          )}
        </ArticleContent>

        <InteractionBar>
          <InteractionButton onClick={handleLike} active={isLiked}>
            <FiHeart /> {likesCount}
          </InteractionButton>
          <InteractionButton onClick={handleShare}>
            <FiShare2 /> {sharesCount}
          </InteractionButton>
          <InteractionButton>
            <FiMessageCircle /> {commentsCount}
          </InteractionButton>
        </InteractionBar>

        <CommentsSection>
          <h3>Comments ({commentsCount})</h3>
          {user ? (
            <CommentForm onSubmit={handleCommentSubmit}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <button type="submit">Post Comment</button>
            </CommentForm>
          ) : (
            <p>Please <a href="/login">log in</a> to comment</p>
          )}

          <CommentsList>
            {comments.map((comment) => (
              <Comment key={comment.id}>
                <CommentAvatar>
                  {comment.user?.avatar_url ? (
                    <img src={comment.user.avatar_url} alt={comment.user.full_name} />
                  ) : (
                    <div className="placeholder">
                      {comment.user?.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </CommentAvatar>
                <CommentContent>
                  <CommentAuthor>
                    {comment.user?.full_name || 'Anonymous User'}
                  </CommentAuthor>
                  <CommentText>{comment.content}</CommentText>
                  <CommentDate>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </CommentDate>
                </CommentContent>
              </Comment>
            ))}
          </CommentsList>
        </CommentsSection>
      </Content>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #FFFFFF;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #6C9A7F;
  cursor: pointer;
  font-size: 16px;
  padding: 8px 0;

  &:hover {
    text-decoration: underline;
  }
`;

const ArticleHeader = styled.div`
  margin-bottom: 30px;
`;

const CategoryTag = styled.span`
  display: inline-block;
  background: #6C9A7F;
  color: #FFFFFF;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.3;
  color: #2D3436;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #636E72;
  font-size: 14px;
`;

const FeaturedImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 30px;
`;

const Content = styled.div`
  margin-bottom: 40px;
`;

const ArticleContent = styled.div`
  font-size: 18px;
  line-height: 1.7;
  color: #2D3436;

  p {
    margin-bottom: 20px;
  }

  h2 {
    margin: 30px 0 20px;
    font-size: 1.8rem;
  }

  h3 {
    margin: 25px 0 15px;
    font-size: 1.5rem;
  }

  ul, ol {
    margin: 20px 0;
    padding-left: 30px;
  }

  li {
    margin-bottom: 10px;
  }

  a {
    color: #6C9A7F;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  blockquote {
    border-left: 4px solid #6C9A7F;
    padding-left: 20px;
    margin: 20px 0;
    font-style: italic;
    color: #636E72;
  }
`;

const InteractionBar = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid #DFE6E9;
  border-bottom: 1px solid #DFE6E9;
  margin: 30px 0;
`;

const InteractionButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${({ active }) => active ? '#6C9A7F' : '#636E72'};
  cursor: pointer;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #F1F2F6;
  }
`;

const CommentsSection = styled.div`
  margin-top: 40px;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;

  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #DFE6E9;
    border-radius: 6px;
    resize: vertical;
    font-family: inherit;
    font-size: 16px;

    &:focus {
      outline: none;
      border-color: #6C9A7F;
    }
  }

  button {
    align-self: flex-start;
    background: #6C9A7F;
    color: #FFFFFF;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
      opacity: 0.9;
    }
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Comment = styled.div`
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #DFE6E9;

  &:last-child {
    border-bottom: none;
  }
`;

const CommentAvatar = styled.div`
  flex-shrink: 0;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #6C9A7F;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentAuthor = styled.div`
  font-weight: 600;
  margin-bottom: 5px;
  color: #2D3436;
`;

const CommentText = styled.div`
  margin-bottom: 8px;
  color: #2D3436;
  line-height: 1.5;
`;

const CommentDate = styled.div`
  font-size: 12px;
  color: #636E72;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #6C9A7F20;
    border-radius: 50%;
    border-top-color: #6C9A7F;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 20px;

  h2 {
    margin-bottom: 20px;
    color: #2D3436;
  }

  button {
    background: #6C9A7F;
    color: #FFFFFF;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
      opacity: 0.9;
    }
  }
`;

export default ExternalBlogPostPage;