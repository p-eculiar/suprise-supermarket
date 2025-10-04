// Product related types
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  isOnSale: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  categoryId: string;
  categoryName: string;
  imageUrl: string;
  imageAlt?: string;
  images?: ProductImage[];
  attributes?: ProductAttribute[];
  tags?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  barcode?: string;
  upc?: string;
  ean?: string;
  brand?: string;
  supplier?: string;
  taxClass?: string;
  taxRate?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  relatedProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Filter types
export interface ProductFilterOptions {
  categories?: string[];
  priceRange?: [number, number];
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
  rating?: number;
  searchQuery?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'featured' | 'bestselling';
  page?: number;
  limit?: number;
}

// Cart related types
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
  stock: number;
  sku: string;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

// User related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: 'customer' | 'admin' | 'staff';
  addresses?: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  instructions?: string;
}

export interface UserPreferences {
  newsletter: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
}

// Order related types
export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
  imageUrl: string;
  weight?: number;
  variant?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery' | 'other';
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  customerNote?: string;
  couponCode?: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

// Review related types
export interface Review {
  id: string;
  userId: string;
  productId: string;
  userName: string;
  userImage?: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  likes: number;
  dislikes: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Coupon related types
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  isSingleUse: boolean;
  isFirstOrderOnly: boolean;
  categories?: string[];
  products?: string[];
  excludedProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

// Notification related types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// API Error type
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
}
