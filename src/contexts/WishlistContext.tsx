import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from '../components/common/Toast';

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
  addToWishlist: (item: Omit<WishlistItem, 'dateAdded'>) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (item: Omit<WishlistItem, 'dateAdded'>) => {
    const newItem = {
      ...item,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setWishlistItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        toast.info(`${item.name} is already in your wishlist`);
        return prev;
      }
      toast.addedToWishlist(item.name);
      return [...prev, newItem];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => {
      const item = prev.find(i => i.id === id);
      if (item) {
        toast.removedFromWishlist(item.name);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearWishlist = () => {
    if (wishlistItems.length > 0) {
      setWishlistItems([]);
      toast.success('Wishlist cleared');
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
