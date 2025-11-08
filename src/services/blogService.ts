import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';
import toast from '../components/common/Toast';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_id: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  meta_title: string;
  meta_description: string;
  keywords: string;
  reading_time: number;
  views_count: number;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  category?: BlogCategory;
  author?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'deleted';
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  replies?: BlogComment[];
}

class BlogService {
  // Fetch all blog categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Fetch all published blog posts
  async getPosts(categoryId?: string) {
    try {
      // Simpler query without joins to avoid the 400 error
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts from database:', error);
        throw error;
      }
      
      // If we have posts, fetch category and author information separately
      if (data && data.length > 0) {
        // Get unique category IDs
        const categoryIds: string[] = [];
        const categoryIdSet = new Set<string>();
        data.forEach(post => {
          if (post.category_id) {
            categoryIdSet.add(post.category_id);
          }
        });
        categoryIdSet.forEach(id => categoryIds.push(id));
        
        // Get unique author IDs
        const authorIds: string[] = [];
        const authorIdSet = new Set<string>();
        data.forEach(post => {
          if (post.author_id) {
            authorIdSet.add(post.author_id);
          }
        });
        authorIdSet.forEach(id => authorIds.push(id));
        
        // Fetch categories
        let categories: any[] = [];
        if (categoryIds.length > 0) {
          const { data: catData, error: catError } = await supabase
            .from('blog_categories')
            .select('id, name, slug')
            .in('id', categoryIds);
          
          if (!catError && catData) {
            categories = catData;
          }
        }
        
        // Fetch authors
        let authors: any[] = [];
        if (authorIds.length > 0) {
          const { data: authData, error: authError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', authorIds);
          
          if (!authError && authData) {
            authors = authData;
          }
        }
        
        // Attach category and author information to posts
        const postsWithDetails = data.map(post => {
          const category = categories.find(cat => cat.id === post.category_id);
          const author = authors.find(auth => auth.id === post.author_id);
          
          return {
            ...post,
            category: category ? { id: category.id, name: category.name, slug: category.slug } : undefined,
            author: author ? { id: author.id, full_name: author.full_name, avatar_url: author.avatar_url } : undefined
          };
        });
        
        return postsWithDetails;
      }
      
      // Ensure we return an empty array if data is null or undefined
      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Return empty array as fallback instead of throwing error
      return [];
    }
  }

  // Fetch a single blog post by slug
  async getPostBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      
      // Increment view count
      if (data) {
        await supabase
          .from('blog_posts')
          .update({ views_count: data.views_count + 1 })
          .eq('id', data.id);
          
        // If the post has a category_id, fetch category information
        if (data.category_id) {
          const { data: category, error: categoryError } = await supabase
            .from('blog_categories')
            .select('name, slug')
            .eq('id', data.category_id)
            .single();
            
          if (!categoryError && category) {
            return {
              ...data,
              category: {
                name: category.name,
                slug: category.slug
              }
            };
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  // Search blog posts
  async searchPosts(query: string) {
    try {
      // Simpler query without joins to avoid the 400 error
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error searching posts from database:', error);
        throw error;
      }
      
      // If we have posts, fetch category and author information separately
      if (data && data.length > 0) {
        // Get unique category IDs
        const categoryIds: string[] = [];
        const categoryIdSet = new Set<string>();
        data.forEach(post => {
          if (post.category_id) {
            categoryIdSet.add(post.category_id);
          }
        });
        categoryIdSet.forEach(id => categoryIds.push(id));
        
        // Get unique author IDs
        const authorIds: string[] = [];
        const authorIdSet = new Set<string>();
        data.forEach(post => {
          if (post.author_id) {
            authorIdSet.add(post.author_id);
          }
        });
        authorIdSet.forEach(id => authorIds.push(id));
        
        // Fetch categories
        let categories: any[] = [];
        if (categoryIds.length > 0) {
          const { data: catData, error: catError } = await supabase
            .from('blog_categories')
            .select('id, name, slug')
            .in('id', categoryIds);
          
          if (!catError && catData) {
            categories = catData;
          }
        }
        
        // Fetch authors
        let authors: any[] = [];
        if (authorIds.length > 0) {
          const { data: authData, error: authError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', authorIds);
          
          if (!authError && authData) {
            authors = authData;
          }
        }
        
        // Attach category and author information to posts
        const postsWithDetails = data.map(post => {
          const category = categories.find(cat => cat.id === post.category_id);
          const author = authors.find(auth => auth.id === post.author_id);
          
          return {
            ...post,
            category: category ? { id: category.id, name: category.name, slug: category.slug } : undefined,
            author: author ? { id: author.id, full_name: author.full_name, avatar_url: author.avatar_url } : undefined
          };
        });
        
        return postsWithDetails;
      }
      
      // Ensure we return an empty array if data is null or undefined
      return data || [];
    } catch (error) {
      console.error('Error searching posts:', error);
      // Return empty array as fallback instead of throwing error
      return [];
    }
  }

  // Create a new comment
  async createComment(postId: string, userId: string, content: string, parentId?: string) {
    try {
      const { data: comment, error } = await supabase
        .from('blog_comments')
        .insert([
          {
            post_id: postId,
            user_id: userId,
            content,
            parent_id: parentId || null,
            status: 'approved' // For simplicity, we'll auto-approve for now
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Send notification to post author and admins
      await this.sendCommentNotification(postId, comment.id, userId, content);
      
      toast.success('Comment added successfully');
      return comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
      throw error;
    }
  }

  // Send notification when a comment is created
  private async sendCommentNotification(postId: string, commentId: string, userId: string, content: string) {
    try {
      // Get the post details
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .select('title, author_id')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      // Get the commenter's name
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Create notification for post author
      if (post.author_id && post.author_id !== userId) {
        await notificationService.createNotification({
          user_id: post.author_id,
          title: 'New Comment on Your Post',
          message: `${user.full_name} commented on your post "${post.title}": "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          type: 'system',
          read: false,
          data: { postId, commentId }
        });
      }

      // Create notification for admins
      await notificationService.createAdminNotification(
        'New Blog Comment',
        `${user.full_name} commented on "${post.title}": "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        'system',
        { postId, commentId, userId }
      );
    } catch (error) {
      console.error('Error sending comment notification:', error);
    }
  }

  // Fetch comments for a post
  async getComments(postId: string) {
    try {
      // Simpler query without join to avoid the 400 error
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // If we have comments, fetch user information separately
      if (data && data.length > 0) {
        // Get unique user IDs
        const userIdSet = new Set(data.map(comment => comment.user_id).filter(Boolean));
        const userIds: string[] = Array.from(userIdSet) as string[];
        
        if (userIds.length > 0) {
          const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);
          
          if (!userError && users) {
            // Attach user information to comments
            const commentsWithUsers = data.map(comment => {
              const user = users.find(u => u.id === comment.user_id);
              return {
                ...comment,
                user: user ? { 
                  id: user.id, 
                  full_name: user.full_name, 
                  avatar_url: user.avatar_url 
                } : undefined
              };
            });
            
            // Structure comments with replies
            const topLevelComments = commentsWithUsers.filter(comment => !comment.parent_id);
            const replies = commentsWithUsers.filter(comment => comment.parent_id);
            
            // Attach replies to their parent comments
            const commentsWithReplies = topLevelComments.map(comment => ({
              ...comment,
              replies: replies.filter(reply => reply.parent_id === comment.id)
            }));
            
            return commentsWithReplies;
          }
        }
      }
      
      // Structure comments with replies
      const topLevelComments = (data || []).filter(comment => !comment.parent_id);
      const replies = (data || []).filter(comment => comment.parent_id);
      
      // Attach replies to their parent comments
      const commentsWithReplies = topLevelComments.map(comment => ({
        ...comment,
        replies: replies.filter(reply => reply.parent_id === comment.id)
      }));
      
      return commentsWithReplies;
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Return empty array as fallback instead of throwing error
      return [];
    }
  }

  // Set up real-time comment subscription
  setupCommentSubscription(postId: string, onComment: (comment: BlogComment) => void) {
    const channel = supabase
      .channel(`blog-comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blog_comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const newComment = payload.new as BlogComment;
          // Fetch user details for the new comment
          this.fetchCommentWithUser(newComment.id).then(commentWithUser => {
            if (commentWithUser) {
              onComment(commentWithUser);
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Fetch a single comment with user details
  private async fetchCommentWithUser(commentId: string) {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('id', commentId)
        .single();

      if (error) throw error;
      
      // If we have a comment, fetch user information separately
      if (data) {
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', data.user_id)
          .single();
        
        if (!userError && user) {
          return {
            ...data,
            user: {
              id: user.id,
              full_name: user.full_name,
              avatar_url: user.avatar_url
            }
          };
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching comment with user:', error);
      return null;
    }
  }

  // Like/unlike a post
  async toggleLike(postId: string, userId: string) {
    try {
      // Call the Supabase function to toggle like
      const { data, error } = await supabase
        .rpc('toggle_blog_post_like', {
          p_post_id: postId,
          p_user_id: userId
        });

      if (error) throw error;
      
      // Return the result from the function
      return data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Get like status for a post
  async getLikeStatus(postId: string, userId: string) {
    try {
      // Call the Supabase function to get like status
      const { data, error } = await supabase
        .rpc('get_blog_post_like_status', {
          p_post_id: postId,
          p_user_id: userId
        });

      if (error) throw error;
      
      // Return the result from the function
      return data || false;
    } catch (error) {
      console.error('Error getting like status:', error);
      return false;
    }
  }

  // Increment share count for a post
  async incrementShareCount(postId: string) {
    try {
      // Call the Supabase function to increment share count
      const { data, error } = await supabase
        .rpc('increment_blog_post_shares', {
          p_post_id: postId
        });

      if (error) throw error;
      
      // Return the new share count
      return data || 0;
    } catch (error) {
      console.error('Error incrementing share count:', error);
      throw error;
    }
  }

  // Delete a blog post
  async deletePost(postId: string) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Get related posts
  async getRelatedPosts(postId: string, limit: number = 3) {
    try {
      // Call the Supabase function to get related posts
      const { data, error } = await supabase
        .rpc('get_related_blog_posts', {
          p_post_id: postId,
          limit_count: limit
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching related posts:', error);
      return [];
    }
  }

  // Get users who liked a post
  async getPostLikes(postId: string) {
    try {
      // Call the Supabase function to get users who liked the post
      const { data, error } = await supabase
        .rpc('get_blog_post_likes', {
          p_post_id: postId
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching post likes:', error);
      return [];
    }
  }
}

export const blogService = new BlogService();