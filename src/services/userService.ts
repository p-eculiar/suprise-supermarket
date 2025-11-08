import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  email_notifications?: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: any; // Will be joined with product details
}

class UserService {
  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: 'customer' | 'admin' | 'vendor'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update user role error:', error);
      return false;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data as UserProfile[];
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string, limit?: number) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user orders:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Get user orders error:', error);
      return [];
    }
  }

  /**
   * Get user's wishlist
   */
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist:', error);
        return [];
      }

      return data as WishlistItem[];
    } catch (error) {
      console.error('Get wishlist error:', error);
      return [];
    }
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .insert([
          {
            user_id: userId,
            product_id: productId,
          },
        ]);

      if (error) {
        console.error('Error adding to wishlist:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return false;
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return false;
    }
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    wishlistCount: number;
    pendingOrders: number;
  }> {
    try {
      const [orders, wishlist] = await Promise.all([
        this.getUserOrders(userId),
        this.getWishlist(userId),
      ]);

      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      const pendingOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'processing'
      ).length;

      return {
        totalOrders: orders.length,
        totalSpent,
        wishlistCount: wishlist.length,
        pendingOrders,
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        wishlistCount: 0,
        pendingOrders: 0,
      };
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await this.updateProfile(userId, { avatar_url: data.publicUrl });

      return data.publicUrl;
    } catch (error) {
      console.error('Upload avatar error:', error);
      return null;
    }
  }
}

export const userService = new UserService();