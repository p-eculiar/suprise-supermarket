import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from '../components/common/Toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryName: string;
  stock: number;
  quantity?: number;
}

/**
 * Helper function to handle add to cart with authentication check
 * @param item - The product to add to cart
 * @param auth - Authentication context
 * @param cart - Cart context
 * @param navigate - Navigation function
 */
export const handleAddToCart = (
  item: CartItem,
  auth: ReturnType<typeof useAuth>,
  cart: ReturnType<typeof useCart>,
  navigate: ReturnType<typeof useNavigate>
) => {
  // Check if user is authenticated
  if (!auth.isAuthenticated) {
    // Show toast notification
    toast.info('Please login or signup to add items to cart');
    
    // Navigate to login page after a short delay
    setTimeout(() => {
      navigate('/login', { 
        state: { 
          message: 'Please login to add items to cart',
          redirectToCart: true,
          product: item
        } 
      });
    }, 1500);
    
    return false;
  }
  
  // Add item to cart
  cart.addToCart({
    id: item.id,
    name: item.name,
    price: item.price,
    originalPrice: item.originalPrice,
    imageUrl: item.imageUrl,
    categoryName: item.categoryName,
    stock: item.stock
  }, item.quantity || 1);
  
  // Show success toast
  const total = item.price * (item.quantity || 1);
  toast.addedToCart(item.name, total, item.quantity || 1);
  
  return true;
};

/**
 * Helper function to handle add to cart with redirect to cart
 * @param item - The product to add to cart
 * @param auth - Authentication context
 * @param cart - Cart context
 * @param navigate - Navigation function
 */
export const handleAddToCartAndGoToCart = (
  item: CartItem,
  auth: ReturnType<typeof useAuth>,
  cart: ReturnType<typeof useCart>,
  navigate: ReturnType<typeof useNavigate>
) => {
  const added = handleAddToCart(item, auth, cart, navigate);
  
  if (added) {
    // Navigate to cart page after a short delay
    setTimeout(() => {
      navigate('/cart');
    }, 1500);
  }
};