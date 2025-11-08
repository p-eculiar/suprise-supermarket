import React, { useState, useEffect, useRef, Suspense } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService, BlogPost, BlogComment } from '../services/blogService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FiClock, FiHeart, FiMessageCircle, FiUser, FiShare2, FiArrowLeft, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from '../components/common/Toast';
import DOMPurify from 'dompurify';
import { Avatar } from '../components/common/Avatar';

// Add interface for related posts
interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  reading_time: number;
  published_at: string;
  category_name: string;
}

// Like avatar with tooltip component
const LikeAvatarWithTooltip: React.FC<{ fullName: string; children: React.ReactNode }> = ({ 
  fullName, 
  children 
}) => {
  const [showName, setShowName] = useState(false);
  
  return (
    <LikeAvatar 
      onMouseEnter={() => setShowName(true)}
      onMouseLeave={() => setShowName(false)}
      onTouchStart={() => setShowName(true)}
      onTouchEnd={() => setShowName(false)}
    >
      {children}
      {showName && (
        <AvatarName>{fullName}</AvatarName>
      )}
    </LikeAvatar>
  );
};

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [imageError, setImageError] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const likeSoundRef = useRef<HTMLAudioElement>(null);

  // Play like sound effect
  const playLikeSound = () => {
    if (likeSoundRef.current) {
      likeSoundRef.current.currentTime = 0;
      likeSoundRef.current.play().catch(e => console.log('Audio play error:', e));
    }
  };

  // Fetch post by slug
  const { data: post, isLoading: postLoading, error: postError } = useQuery<BlogPost | null>({
    queryKey: ['blog-post', slug],
    queryFn: () => blogService.getPostBySlug(slug!),
    enabled: !!slug
  });

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading, refetch: refetchComments } = useQuery<BlogComment[]>({
    queryKey: ['blog-comments', post?.id],
    queryFn: () => {
      if (!post?.id) {
        return [];
      }
      return blogService.getComments(post.id);
    },
    enabled: !!(post?.id),
    // Add refetch options to ensure data is fresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  // Refetch comments when post ID changes
  useEffect(() => {
    if (post?.id) {
      refetchComments();
    }
  }, [post?.id, refetchComments]);

  // Fetch related posts
  const { data: relatedPosts = [], isLoading: relatedPostsLoading } = useQuery<RelatedPost[]>({
    queryKey: ['related-posts', post?.id],
    queryFn: () => blogService.getRelatedPosts(post!.id, 3),
    enabled: !!post?.id
  });

  // Fetch users who liked the post
  const { data: postLikes = [] } = useQuery<any[]>({
    queryKey: ['blog-post-likes', post?.id],
    queryFn: () => blogService.getPostLikes(post!.id),
    enabled: !!post?.id
  });

  // Check like status
  const { data: isLiked = false } = useQuery<boolean>({
    queryKey: ['blog-like-status', post?.id, user?.id],
    queryFn: () => blogService.getLikeStatus(post!.id, user!.id),
    enabled: !!post?.id && !!user?.id
  });

  // Set up real-time post subscription for likes, shares, and comments
  useEffect(() => {
    if (post?.id) {
      const channel = supabase
        .channel(`blog-post-${post.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'blog_posts',
            filter: `id=eq.${post.id}`,
          },
          (payload: any) => {
            // Update the post data with the new counts
            queryClient.setQueryData(['blog-post', slug], (oldData: any) => {
              if (oldData) {
                return {
                  ...oldData,
                  ...payload.new
                };
              }
              return oldData;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [post?.id, queryClient, slug]);

  // Set up real-time comment subscription
  useEffect(() => {
    if (post?.id) {
      const unsubscribe = blogService.setupCommentSubscription(post.id, (newComment) => {
        // Add the new comment to the cache
        queryClient.setQueryData(['blog-comments', post.id], (oldComments: BlogComment[] = []) => {
          // Check if comment already exists to prevent duplicates
          if (oldComments.some(comment => comment.id === newComment.id)) {
            return oldComments;
          }
          
          // If it's a reply, add it to the appropriate parent comment
          if (newComment.parent_id) {
            return oldComments.map(comment => 
              comment.id === newComment.parent_id 
                ? { ...comment, replies: [...(comment.replies || []), newComment] } 
                : comment
            );
          }
          
          // Otherwise, add it as a top-level comment
          return [...oldComments, newComment];
        });
        
        // Also refetch to ensure we have the latest data
        refetchComments();
      });

      return unsubscribe;
    }
  }, [post?.id, queryClient, refetchComments]);

  // Close likes popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const articleActions = document.querySelector('ArticleActions');
      if (showLikes && articleActions && !articleActions.contains(event.target as Node)) {
        setShowLikes(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLikes]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => blogService.toggleLike(post?.id!, user?.id!),
    onSuccess: (data) => {
      // The data is an array with one object containing liked and new_likes_count
      const result = data[0]; // Extract the first (and only) object from the array
      
      // Update the post data with the new like count
      queryClient.setQueryData(['blog-post', slug], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            likes_count: result.new_likes_count
          };
        }
        return oldData;
      });
      
      // Update the like status
      queryClient.setQueryData(['blog-like-status', post?.id, user?.id], result.liked);
      
      // Invalidate the post likes query
      queryClient.invalidateQueries({ queryKey: ['blog-post-likes', post?.id] });
      
      // Show toast feedback
      if (result.liked) {
        toast.success('Post liked!');
      } else {
        toast.success('Post unliked!');
      }
    },
    onError: (err) => {
      toast.error('Failed to update like status');
    }
  });

  const handleLike = () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    
    // Check current like status before showing animation
    const currentlyLiked = isLiked;
    
    // Show like animation only when liking (not unliking)
    if (!currentlyLiked) {
      setShowLikeAnimation(true);
      
      // Play like sound
      playLikeSound();
      
      // Hide animation after 1 second
      setTimeout(() => {
        setShowLikeAnimation(false);
      }, 1000);
    }
    
    likeMutation.mutate();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (comment.trim()) {
      commentMutation.mutate({ content: comment });
    }
  };

  const handleReplySubmit = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (replyContent.trim()) {
      commentMutation.mutate({ content: replyContent, parentId });
      setReplyingTo(null);
      setReplyContent('');
    }
  };

  const sharePost = async () => {
    if (!post?.id) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href
        });
        // Increment share count after successful share
        shareMutation.mutate();
      } catch (err) {
        console.log('Sharing failed', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
      // Increment share count for manual copy
      shareMutation.mutate();
    }
  };

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!post?.id || !user?.id) {
        throw new Error('Missing post ID or user ID');
      }
      return blogService.createComment(post?.id!, user?.id!, content, parentId);
    },
    onSuccess: (data) => {
      // Invalidate comments query to refetch the latest comments
      queryClient.invalidateQueries({ queryKey: ['blog-comments', post?.id] });
      
      // Add a small delay and then refetch comments to ensure real-time subscription works
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['blog-comments', post?.id] });
        refetchComments();
      }, 500);
      
      // Update the post data with the new comment count
      queryClient.setQueryData(['blog-post', slug], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            comments_count: oldData.comments_count + 1
          };
        }
        return oldData;
      });
      setComment('');
      setReplyingTo(null);
      setReplyContent('');
      toast.success('Comment added successfully');
    },
    onError: (error: any) => {
      console.error('Comment submission error:', error);
      const errorMessage = error.message || 'Failed to add comment. Please try again.';
      toast.error(errorMessage);
    }
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: () => blogService.incrementShareCount(post?.id!),
    onSuccess: (newShareCount) => {
      // Update the post data with the new share count
      queryClient.setQueryData(['blog-post', slug], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            shares_count: newShareCount
          };
        }
        return oldData;
      });
    }
  });

  if (postLoading) {
    return (
      <LoadingContainer>
        <div className="spinner"></div>
        <p>Loading article...</p>
      </LoadingContainer>
    );
  }

  if (postError || !post) {
    return (
      <ErrorContainer>
        <h2>Article not found</h2>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <BackButton onClick={() => navigate('/blog')}>
          <FiArrowLeft /> Back to Blog
        </BackButton>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      {/* Hidden audio element for like sound */}
      <audio ref={likeSoundRef}>
        <source src="/sounds/like-sound.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <Header>
        <BackButton onClick={() => navigate('/blog')}>
          <FiArrowLeft /> Back to Blog
        </BackButton>
        <CategoryTag>{post.category?.name}</CategoryTag>
        <Title>{post.title}</Title>
        <Meta>
          <MetaItem>
            <FiUser />
            <span>{post.author?.full_name || 'Suprise Supermarket Team'}</span>
          </MetaItem>
          <MetaItem>
            <FiClock />
            <span>{post.published_at && post.published_at !== '1970-01-01T00:00:00+00:00' ? new Date(post.published_at).toLocaleDateString() : 'Just now'} • {post.reading_time} min read</span>
          </MetaItem>
        </Meta>
      </Header>

      <FeaturedImage 
        src={imageError || !post.featured_image ? '/placeholder-blog.jpg' : post.featured_image} 
        alt={post.title} 
        onError={() => setImageError(true)}
      />

      <Content>
        <ArticleContent 
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify?.sanitize ? DOMPurify.sanitize(post.content) : post.content 
          }} 
        />

        <ArticleActions>
          {postLikes.length > 0 && (
            <LikesContainer>
              <LikesAvatars>
                {postLikes.slice(0, 5).map((like: any, index: number) => (
                  <LikeAvatarWithTooltip key={like.user_id} fullName={like.full_name}>
                    {like.avatar_url ? (
                      <img src={like.avatar_url} alt={like.full_name} />
                    ) : (
                      <Avatar 
                        name={like.full_name} 
                        size="sm" 
                      />
                    )}
                  </LikeAvatarWithTooltip>
                ))}
              </LikesAvatars>
            </LikesContainer>
          )}
          
          <ActionButtons>
            <ActionButton $active={isLiked} onClick={handleLike}>
              <FiHeart />
              <span>{post?.likes_count || 0} Likes</span>
            </ActionButton>
            
            {/* Like animation */}
            {showLikeAnimation && (
              <LikeAnimation>
                <motion.div
                  initial={{ scale: 0, y: 0 }}
                  animate={{ scale: 1, y: -50 }}
                  exit={{ scale: 0, y: -100, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  👍
                </motion.div>
              </LikeAnimation>
            )}
            <ActionButton>
              <FiMessageCircle />
              <span>{post?.comments_count || 0} Comments</span>
            </ActionButton>
            <ActionButton onClick={sharePost}>
              <FiShare2 />
              <span>{post?.shares_count || 0} Shares</span>
            </ActionButton>
          </ActionButtons>
          
          <AnimatePresence>
            {showLikes && (
              <LikesPopup
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <PopupHeader>
                  <FiHeart />
                  <h3>{post?.likes_count} Likes</h3>
                </PopupHeader>
                <LikesGrid>
                  {postLikes.map((like: any) => (
                    <LikeItem key={like.user_id}>
                      <Avatar 
                        src={like.avatar_url || undefined} 
                        name={like.full_name} 
                        size="md" 
                      />
                      <LikeUserInfo>
                        <span>{like.full_name}</span>
                        <span>Just now</span>
                      </LikeUserInfo>
                    </LikeItem>
                  ))}
                </LikesGrid>
              </LikesPopup>
            )}
          </AnimatePresence>
        </ArticleActions>

        <CommentsSection>
          <SectionTitle>Comments ({post?.comments_count || 0})</SectionTitle>
          
          {user ? (
            <CommentForm onSubmit={handleCommentSubmit}>
              <CommentInput
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <CommentSubmitButton type="submit" disabled={!comment.trim() || commentMutation.isPending}>
                <FiSend /> Post Comment
              </CommentSubmitButton>
            </CommentForm>
          ) : (
            <LoginPrompt>
              <p>Please <LoginLink onClick={() => navigate('/login')}>login</LoginLink> to comment</p>
            </LoginPrompt>
          )}

          <CommentsList>
            {commentsLoading ? (
              <LoadingComments>
                <div className="spinner"></div>
                <p>Loading comments...</p>
              </LoadingComments>
            ) : !comments || comments.length === 0 ? (
              <EmptyComments>
                <FiMessageCircle size={32} />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </EmptyComments>
            ) : (
              <>
                {comments.map((comment: BlogComment) => (
                  <CommentItem key={comment.id}>
                    <Avatar 
                      src={comment.user?.avatar_url || undefined} 
                      name={comment.user?.full_name || 'Anonymous'} 
                      size="md" 
                    />
                    <CommentContent>
                      <CommentHeader>
                        <CommentAuthor>{comment.user?.full_name || 'Anonymous'}</CommentAuthor>
                        <CommentDate>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </CommentDate>
                      </CommentHeader>
                      <CommentText>{comment.content}</CommentText>
                      <CommentActions>
                        <ReplyButton onClick={() => setReplyingTo(
                          replyingTo === comment.id ? null : comment.id
                        )}>
                          Reply
                        </ReplyButton>
                      </CommentActions>

                    {replyingTo === comment.id && (
                      <ReplyForm onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                        <ReplyInput
                          placeholder="Write your reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={2}
                        />
                        <ReplyActions>
                          <CancelButton onClick={() => setReplyingTo(null)}>
                            Cancel
                          </CancelButton>
                          <ReplySubmitButton type="submit" disabled={!replyContent.trim() || commentMutation.isPending}>
                            Post Reply
                          </ReplySubmitButton>
                        </ReplyActions>
                      </ReplyForm>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                      <Replies>
                        {comment.replies.map((reply: BlogComment) => (
                          <ReplyItem key={reply.id}>
                            <Avatar 
                              src={reply.user?.avatar_url || undefined} 
                              name={reply.user?.full_name || 'Anonymous'} 
                              size="sm" 
                            />
                            <ReplyContent>
                              <ReplyHeader>
                                <ReplyAuthor>{reply.user?.full_name || 'Anonymous'}</ReplyAuthor>
                                <ReplyDate>
                                  {new Date(reply.created_at).toLocaleDateString()}
                                </ReplyDate>
                              </ReplyHeader>
                              <ReplyText>{reply.content}</ReplyText>
                            </ReplyContent>
                          </ReplyItem>
                        ))}
                      </Replies>
                    )}
                  </CommentContent>
                </CommentItem>
              ))}
              </>
            )}
          </CommentsList>
        </CommentsSection>
      </Content>

      <Sidebar>
        <AuthorSection>
          <Avatar 
            src={post.author?.avatar_url || undefined} 
            name={post.author?.full_name || 'Anonymous'} 
            size="lg" 
          />
          <AuthorInfo>
            <AuthorName>{post.author?.full_name || 'Anonymous'}</AuthorName>
            <AuthorBio>
              {post.author?.full_name ? `${post.author.full_name} is a contributor to Suprise Supermarket Blog.` : 'A contributor to Suprise Supermarket Blog.'}
            </AuthorBio>
          </AuthorInfo>
        </AuthorSection>

        <RelatedSection>
          <SectionTitle>Related Articles</SectionTitle>
          {relatedPostsLoading ? (
            <LoadingRelated>
              <div className="spinner"></div>
              <p>Loading related articles...</p>
            </LoadingRelated>
          ) : relatedPosts.length > 0 ? (
            <RelatedList>
              {relatedPosts.map((relatedPost: RelatedPost) => (
                <RelatedItem 
                  key={relatedPost.id}
                  onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                >
                  <RelatedImage 
                    src={relatedPost.featured_image || '/placeholder-blog.jpg'} 
                    alt={relatedPost.title} 
                    onError={(e) => {
                      // Set a flag on the element to prevent infinite loop
                      const target = e.target as HTMLImageElement;
                      if (!target.dataset.errored) {
                        target.dataset.errored = 'true';
                        target.src = '/placeholder-blog.jpg';
                      }
                    }}
                  />
                  <RelatedContent>
                    <RelatedCategory>{relatedPost.category_name}</RelatedCategory>
                    <RelatedTitle>{relatedPost.title}</RelatedTitle>
                    <RelatedMeta>
                      <FiClock />
                      <span>{relatedPost.reading_time} min read</span>
                    </RelatedMeta>
                  </RelatedContent>
                </RelatedItem>
              ))}
            </RelatedList>
          ) : (
            <EmptyRelated>
              <p>No related articles found</p>
            </EmptyRelated>
          )}
        </RelatedSection>
      </Sidebar>
    </Container>
  );
};

export default BlogPostPage;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Header = styled.div`
  grid-column: 1 / -1;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #6C9A7F;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6C9A7F15;
  }
`;

const CategoryTag = styled.div`
  display: inline-block;
  background: #6C9A7F15;
  color: #6C9A7F;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 1rem 0;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Meta = styled.div`
  display: flex;
  gap: 1.5rem;
  color: #636E72;
  font-size: 0.95rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FeaturedImage = styled.img`
  grid-column: 1 / -1;
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    height: 250px;
  }
`;

const Content = styled.div`
  grid-column: 1;
`;

const ArticleContent = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  color: #2D3436;
  font-weight: 300;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
  
  // Custom scrollbar for blog content
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #6C9A7F;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #5A8470;
  }
  
  h2 {
    font-size: 1.75rem;
    margin: 2rem 0 1rem;
    color: #2D3436;
    font-weight: 600;
  }
  
  h3 {
    font-size: 1.5rem;
    margin: 1.5rem 0 1rem;
    color: #2D3436;
    font-weight: 500;
  }
  
  p {
    margin: 1rem 0;
    font-weight: 300;
  }
  
  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }
  
  li {
    margin: 0.5rem 0;
    font-weight: 300;
  }
  
  a {
    color: #6C9A7F;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 1rem 0;
  }
  
  blockquote {
    border-left: 4px solid #6C9A7F;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    background: #F8F9FA;
    font-style: italic;
    font-weight: 300;
  }
`;

const ArticleActions = styled.div`
  margin: 2rem 0;
  padding: 1.5rem 0;
  border-top: 1px solid #F0F0F0;
  border-bottom: 1px solid #F0F0F0;
  position: relative;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active ? '#6C9A7F' : 'white'};
  color: ${props => props.$active ? 'white' : '#636E72'};
  border: 1px solid ${props => props.$active ? '#6C9A7F' : '#E1E8ED'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active ? '#5A8470' : '#F8F9FA'};
    border-color: ${props => props.$active ? '#5A8470' : '#6C9A7F'};
    color: ${props => props.$active ? 'white' : '#6C9A7F'};
  }
`;

const LikesContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
`;

const LikesAvatars = styled.div`
  display: flex;
  margin-right: 0.5rem;
  align-items: center;
`;

const LikeAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  margin-left: -8px;
  flex-shrink: 0;
  position: relative;
  
  &:first-child {
    margin-left: 0;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  svg {
    color: #999;
  }
`;

const AvatarName = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 100;
  margin-top: 4px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px;
    border-style: solid;
    border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
  }
`;

const LikesCount = styled.span`
  font-size: 0.9rem;
  color: #636E72;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LikesPopup = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 1.5rem;
  min-width: 300px;
  z-index: 100;
  margin-top: 0.5rem;
`;

const PopupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #2D3436;
  
  svg {
    color: #E74C3C;
  }
`;

const LikesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const LikeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #F8F9FA;
  }
`;

const LikeUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  span:first-child {
    font-weight: 500;
    color: #2D3436;
  }
  
  span:last-child {
    font-size: 0.8rem;
    color: #636E72;
  }
`;

const CommentsSection = styled.div`
  margin: 3rem 0;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const CommentInput = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.2);
  }
`;

const CommentSubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: #5A8470;
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const LoginLink = styled.button`
  background: none;
  border: none;
  color: #6C9A7F;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
  
  // Custom scrollbar for comments
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #6C9A7F;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #5A8470;
  }
`;

const CommentItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const CommentAuthor = styled.div`
  font-weight: 500;
  color: #2D3436;
`;

const CommentDate = styled.div`
  font-size: 0.85rem;
  color: #999;
`;

const CommentText = styled.div`
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #2D3436;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ReplyButton = styled.button`
  background: none;
  border: none;
  color: #6C9A7F;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #6C9A7F15;
  }
`;

const ReplyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
`;

const ReplyInput = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E1E8ED;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.2);
  }
`;

const ReplyActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  background: #E1E8ED;
  color: #636E72;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #DFE6E9;
  }
`;

const ReplySubmitButton = styled.button`
  padding: 0.5rem 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: #5A8470;
  }
`;

const Replies = styled.div`
  margin-top: 1rem;
  padding-left: 2rem;
  border-left: 2px solid #F0F0F0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReplyItem = styled.div`
  display: flex;
  gap: 1rem;
`;

const ReplyAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F8F9FA;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
  
  svg {
    width: 16px;
    height: 16px;
    color: #999;
  }
`;

const ReplyContent = styled.div`
  flex: 1;
`;

const ReplyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
`;

const ReplyAuthor = styled.div`
  font-weight: 600;
  color: #2D3436;
  font-size: 0.9rem;
`;

const ReplyDate = styled.div`
  font-size: 0.8rem;
  color: #999;
`;

const ReplyText = styled.div`
  line-height: 1.5;
  color: #2D3436;
  font-size: 0.95rem;
`;

const Sidebar = styled.div`
  grid-column: 2;
  
  @media (max-width: 1024px) {
    grid-column: 1;
  }
`;

const AuthorSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  text-align: center;
`;

const AuthorInfo = styled.div`
  margin-bottom: 1rem;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const AuthorBio = styled.div`
  font-size: 0.9rem;
  color: #636E72;
  line-height: 1.5;
`;

const RelatedSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #636E72;
  
  h2 {
    margin: 0 0 1rem 0;
    color: #2D3436;
  }
  
  p {
    margin: 0 0 1.5rem 0;
    max-width: 400px;
  }
`;

const LoadingComments = styled.div`
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

const EmptyComments = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999;
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  p {
    margin: 0;
  }
`;

// Add new styled components for related posts
const RelatedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
  
  // Custom scrollbar for related articles
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #6C9A7F;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #5A8470;
  }
`;

const RelatedItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #E1E8ED;
    transform: translateY(-2px);
  }
`;

const RelatedImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
`;

const RelatedContent = styled.div`
  flex: 1;
`;

const RelatedCategory = styled.div`
  font-size: 0.75rem;
  color: #6C9A7F;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
`;

const RelatedTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 500;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
`;

const RelatedMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #999;
`;

const LoadingRelated = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: #636E72;
  
  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #E1E8ED;
    border-top: 3px solid #6C9A7F;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
`;

const EmptyRelated = styled.div`
  text-align: center;
  padding: 1rem;
  color: #999;
  font-style: italic;
`;

// Like animation component
const LikeAnimation = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
  font-size: 2rem;
`;

