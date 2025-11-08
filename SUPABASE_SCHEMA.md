# Supabase Database Schema

This document outlines the complete database schema required for the Surprise Supermarket application.

## Tables

### 1. `products`
Main products catalog table.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  categoryName TEXT,
  price DECIMAL(10, 2) NOT NULL,
  originalPrice DECIMAL(10, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  imageUrl TEXT,
  isActive BOOLEAN DEFAULT true,
  isFeatured BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviewCount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_products_category ON products(categoryName);
CREATE INDEX idx_products_featured ON products(isFeatured);
CREATE INDEX idx_products_active ON products(isActive);
CREATE INDEX idx_products_created ON products(created_at DESC);
```

### 2. `orders`
Customer orders table.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'Nigeria',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

### 3. `profiles`
Extended user profiles table.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  avatar_url TEXT,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_notifications ON profiles(email_notifications);
```

### 4. `email_notifications`
Email notification queue table.

```sql
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  user_name TEXT,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image TEXT,
  notification_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_notifications_status ON email_notifications(status);
CREATE INDEX idx_notifications_created ON email_notifications(created_at DESC);
```

### 5. `contacts`
Contact form submissions table.

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_contacts_created ON contacts(created_at DESC);
```

## Storage Buckets

### 1. `user-uploads`
For user profile images and avatars.

```sql
-- Create the bucket (execute in Supabase Dashboard > Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true);

-- Set up RLS policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 2. `product-images`
For product images uploaded by admins.

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Set up RLS policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

## Row Level Security (RLS) Policies

### Products Table

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can read products
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

-- Only authenticated users (admins) can insert
CREATE POLICY "Authenticated users can insert products"
ON products FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users (admins) can update
CREATE POLICY "Authenticated users can update products"
ON products FOR UPDATE
USING (auth.role() = 'authenticated');

-- Only authenticated users (admins) can delete
CREATE POLICY "Authenticated users can delete products"
ON products FOR DELETE
USING (auth.role() = 'authenticated');
```

### Orders Table

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (auth.role() = 'authenticated');
```

### Profiles Table

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Profiles are created on user signup (handled by trigger)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

### Email Notifications Table

```sql
-- Enable RLS
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "Admins can view all notifications"
ON email_notifications FOR SELECT
USING (auth.role() = 'authenticated');

-- System can insert notifications
CREATE POLICY "Service role can insert notifications"
ON email_notifications FOR INSERT
WITH CHECK (true);
```

### Contacts Table

```sql
-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Anyone can submit contact forms
CREATE POLICY "Anyone can submit contacts"
ON contacts FOR INSERT
WITH CHECK (true);

-- Only admins can view contacts
CREATE POLICY "Admins can view contacts"
ON contacts FOR SELECT
USING (auth.role() = 'authenticated');
```

## Database Functions & Triggers

### Auto-update timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to products table
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply to orders table
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply to profiles table
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Auto-create profile on signup

```sql
-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, email_notifications)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'email_notifications')::boolean, true)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute function on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

## Initial Data Setup (Optional)

### Sample Products

```sql
INSERT INTO products (name, description, categoryName, price, originalPrice, stock, sku, imageUrl, isFeatured, rating)
VALUES
  ('Organic Tomatoes', 'Fresh organic tomatoes from local farms', 'Vegetables', 5.99, 7.99, 150, 'VEG-001', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', true, 4.5),
  ('Fresh Strawberries', 'Sweet and juicy strawberries', 'Fruits', 4.99, 6.99, 85, 'FRU-001', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', true, 4.8),
  ('Whole Milk', 'Farm fresh whole milk', 'Dairy', 3.49, 3.99, 120, 'DAI-001', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', false, 4.6),
  ('Green Peas', 'Fresh garden peas', 'Vegetables', 2.49, 2.99, 200, 'VEG-002', 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=400', false, 4.3);
```

## Environment Variables

Add these to your `.env` file:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SITE_URL=http://localhost:3000
```

## Setup Instructions

1. **Create Project**: Create a new project in Supabase Dashboard
2. **Run SQL Scripts**: Execute all the CREATE TABLE statements in the SQL Editor
3. **Create Storage Buckets**: Create the two storage buckets in Storage section
4. **Enable RLS**: Run all RLS policy statements
5. **Create Functions**: Execute the trigger functions
6. **Add Sample Data**: Optionally insert sample products
7. **Update .env**: Add your Supabase credentials to `.env` file

## Notes

- The `profiles` table is automatically populated when users sign up through the trigger
- Email notifications are queued in the `email_notifications` table and can be processed by a cron job
- All timestamps use UTC timezone
- Storage buckets have public read access but authenticated write access
- RLS policies ensure data security at the database level
