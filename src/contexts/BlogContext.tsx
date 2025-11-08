import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from '../components/common/Toast';

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface BlogPost {
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

interface BlogComment {
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

interface BlogContextType {
  categories: BlogCategory[];
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchPosts: (categoryId?: string) => Promise<void>;
  fetchPostBySlug: (slug: string) => Promise<BlogPost | null>;
  createComment: (postId: string, content: string, parentId?: string) => Promise<boolean>;
  fetchComments: (postId: string) => Promise<BlogComment[]>;
  likePost: (postId: string) => Promise<boolean>;
  searchPosts: (query: string) => Promise<BlogPost[]>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper method to process image URLs
  const processImageUrl = (imageUrl: string): string => {
    // If it's already a full URL, return as is
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      return imageUrl;
    }
    
    // If it's a placeholder image, use a real placeholder service
    if (imageUrl && imageUrl.startsWith('/placeholder-blog')) {
      // Extract the number from the placeholder name to create a unique image
      const match = imageUrl.match(/placeholder-blog-(\d+)/);
      if (match && match[1]) {
        const id = match[1];
        return `https://picsum.photos/seed/blog${id}/800/400`;
      }
      // Default placeholder
      return 'https://picsum.photos/seed/blog/800/400';
    }
    
    // If it's a relative path, make it absolute
    if (imageUrl && imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // Default fallback
    return 'https://picsum.photos/seed/blog/800/400';
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
      toast.error('Failed to load blog categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async (categoryId?: string) => {
    try {
      setLoading(true);
      // Simpler query structure to avoid the 400 error
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Process the data to ensure proper image URLs
      const processedData = (data || []).map(post => ({
        ...post,
        featured_image: processImageUrl(post.featured_image)
      }));
      
      // If we have data, let's fetch category information separately
      if (processedData && processedData.length > 0) {
        // Get unique category IDs
        const categoryIds: string[] = [];
        processedData.forEach(post => {
          if (post.category_id && !categoryIds.includes(post.category_id)) {
            categoryIds.push(post.category_id);
          }
        });
        
        if (categoryIds.length > 0) {
          const { data: categories, error: categoryError } = await supabase
            .from('blog_categories')
            .select('id, name, slug')
            .in('id', categoryIds);
          
          if (!categoryError && categories) {
            // Attach category information to posts
            const postsWithCategories = processedData.map(post => {
              const category = categories.find(cat => cat.id === post.category_id);
              return {
                ...post,
                category: category ? { name: category.name, slug: category.slug } : undefined
              };
            });
            setPosts(postsWithCategories);
            return;
          }
        }
      }
      
      setPosts(processedData);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPostBySlug = useCallback(async (slug: string): Promise<BlogPost | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      
      // Process the data to ensure proper image URLs
      let processedData = data;
      if (data) {
        processedData = {
          ...data,
          featured_image: processImageUrl(data.featured_image)
        };
        
        // Increment view count
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
              ...processedData,
              category: {
                name: category.name,
                slug: category.slug
              }
            };
          }
        }
      }
      
      return processedData || null;
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to fetch post');
      toast.error('Failed to load blog post');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createComment = useCallback(async (postId: string, content: string, parentId?: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please login to comment');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content,
            parent_id: parentId || null,
            status: 'approved' // For simplicity, we'll auto-approve for now
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Comment added successfully');
      return true;
    } catch (err) {
      console.error('Error creating comment:', err);
      toast.error('Failed to add comment');
      return false;
    }
  }, [user]);

  const fetchComments = useCallback(async (postId: string): Promise<BlogComment[]> => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Structure comments with replies
      const topLevelComments = (data || []).filter(comment => !comment.parent_id);
      const replies = (data || []).filter(comment => comment.parent_id);
      
      // Attach replies to their parent comments
      const commentsWithReplies = topLevelComments.map(comment => ({
        ...comment,
        replies: replies.filter(reply => reply.parent_id === comment.id)
      }));
      
      return commentsWithReplies;
    } catch (err) {
      console.error('Error fetching comments:', err);
      toast.error('Failed to load comments');
      return [];
    }
  }, []);

  const likePost = useCallback(async (postId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please login to like posts');
      return false;
    }

    try {
      // Check if user already liked this post
      const { data: existingLike, error: fetchError } = await supabase
        .from('blog_post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('blog_post_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;

        // Decrement like count
        await supabase
          .from('blog_posts')
          .update({ likes_count: supabase.rpc('blog_posts.likes_count - 1') })
          .eq('id', postId);

        toast.success('Post unliked');
        return true;
      } else {
        // Like
        const { error: insertError } = await supabase
          .from('blog_post_likes')
          .insert([{ post_id: postId, user_id: user.id }]);

        if (insertError) throw insertError;

        // Increment like count
        await supabase
          .from('blog_posts')
          .update({ likes_count: supabase.rpc('blog_posts.likes_count + 1') })
          .eq('id', postId);

        toast.success('Post liked');
        return true;
      }
    } catch (err) {
      console.error('Error liking post:', err);
      toast.error('Failed to like post');
      return false;
    }
  }, [user]);

  const searchPosts = useCallback(async (query: string): Promise<BlogPost[]> => {
    try {
      setLoading(true);
      // Simpler query structure to avoid the 400 error
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false });

      if (error) throw error;
      
      // Process the data to ensure proper image URLs
      const processedData = (data || []).map(post => ({
        ...post,
        featured_image: processImageUrl(post.featured_image)
      }));
      
      // If we have data, let's fetch category information separately
      if (processedData && processedData.length > 0) {
        // Get unique category IDs
        const categoryIds: string[] = [];
        processedData.forEach(post => {
          if (post.category_id && !categoryIds.includes(post.category_id)) {
            categoryIds.push(post.category_id);
          }
        });
        
        if (categoryIds.length > 0) {
          const { data: categories, error: categoryError } = await supabase
            .from('blog_categories')
            .select('id, name, slug')
            .in('id', categoryIds);
          
          if (!categoryError && categories) {
            // Attach category information to posts
            const postsWithCategories = processedData.map(post => {
              const category = categories.find(cat => cat.id === post.category_id);
              return {
                ...post,
                category: category ? { name: category.name, slug: category.slug } : undefined
              };
            });
            return postsWithCategories;
          }
        }
      }
      
      return processedData;
    } catch (err) {
      console.error('Error searching posts:', err);
      toast.error('Failed to search posts');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <BlogContext.Provider
      value={{
        categories,
        posts,
        loading,
        error,
        fetchCategories,
        fetchPosts,
        fetchPostBySlug,
        createComment,
        fetchComments,
        likePost,
        searchPosts
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};