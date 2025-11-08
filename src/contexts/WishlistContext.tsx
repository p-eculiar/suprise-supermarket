import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from '../components/common/Toast';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useRealtime } from '../hooks/useRealtime';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryName: string;
  stock: number;
  dateAdded: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'dateAdded'>) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const loadWishlist = useCallback(async () => {
    try {
      if (!user) {
        setWishlistItems([]);
        return;
      }
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          user_id,
          product:products (id, name, price, image_url, category, stock)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: WishlistItem[] = (data || []).map((row: any) => ({
        id: row.product.id,
        name: row.product.name,
        price: row.product.price,
        imageUrl: row.product.image_url,
        categoryName: row.product.category,
        stock: row.product.stock,
        dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }));
      setWishlistItems(mapped);
    } catch (e) {
      console.warn('Wishlist table not found or fetch failed, falling back to empty list.', e);
      setWishlistItems([]);
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  useRealtime({
    table: 'wishlist',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    filter: user ? { column: 'user_id', value: user.id } : undefined,
    onEvent: () => loadWishlist(),
    channelName: 'wishlist-realtime'
  });
  // Also listen to products so wishlist item details (name/price/stock) stay fresh
  useRealtime({
    table: 'products',
    events: ['UPDATE', 'DELETE'],
    onEvent: () => loadWishlist(),
    channelName: 'wishlist-products-realtime'
  });

  const addToWishlist = async (item: Omit<WishlistItem, 'dateAdded'>) => {
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }

    // Optimistic update
    setWishlistItems(prev => {
      if (prev.some(i => i.id === item.id)) {
        toast.info(`${item.name} is already in your wishlist`);
        return prev;
      }
      return [...prev, { ...item, dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }];
    });

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert([{ user_id: user.id, product_id: item.id }]);
      if (error) throw error;
      toast.addedToWishlist(item.name);
    } catch (e) {
      console.error('Failed to add to wishlist:', e);
      toast.error('Failed to add to wishlist');
      // reload to revert optimistic if failed
      await loadWishlist();
    }
  };

  const removeFromWishlist = async (id: string) => {
    if (!user) return;

    // Optimistic update
    setWishlistItems(prev => prev.filter(item => item.id !== id));

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', id);
      if (error) throw error;
      // toast removed after confirming server-side
      // Find name for toast
      const removed = wishlistItems.find(i => i.id === id);
      if (removed) toast.removedFromWishlist(removed.name);
    } catch (e) {
      console.error('Failed to remove from wishlist:', e);
      toast.error('Failed to remove from wishlist');
      await loadWishlist();
    }
  };

  const clearWishlist = async () => {
    if (!user) return;
    // Optimistic
    const hadItems = wishlistItems.length > 0;
    setWishlistItems([]);
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      if (hadItems) toast.success('Wishlist cleared');
    } catch (e) {
      console.error('Failed to clear wishlist:', e);
      toast.error('Failed to clear wishlist');
      await loadWishlist();
    }
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
