-- =====================================================
-- ORDERS & PAYMENTS TABLES FOR SURPRISE SUPERMARKET
-- =====================================================

-- 0. DROP EXISTING TABLES (IF YOU WANT FRESH START)
-- Uncomment these lines if you want to recreate tables from scratch
-- DROP TABLE IF EXISTS public.payment_transactions CASCADE;
-- DROP TABLE IF EXISTS public.order_items CASCADE;
-- DROP TABLE IF EXISTS public.orders CASCADE;

-- 1. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Order Details
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')),
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    
    -- Delivery Address
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    delivery_postal_code VARCHAR(20),
    delivery_notes TEXT,
    
    -- Order Totals
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Payment Information
    payment_method VARCHAR(50) DEFAULT 'paystack',
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_reference VARCHAR(255),
    paystack_reference VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- 2. CREATE ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Product Information (stored for historical record)
    product_id UUID REFERENCES public.products(id),
    product_name VARCHAR(255) NOT NULL,
    product_image_url TEXT,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Transaction Details
    reference VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    
    -- Payment Provider
    provider VARCHAR(50) DEFAULT 'paystack',
    provider_reference VARCHAR(255),
    provider_response JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE INDEXES FOR BETTER PERFORMANCE (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON public.payment_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);

-- 5. CREATE FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON public.payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 8. CREATE RLS POLICIES FOR ORDERS
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own pending orders" ON public.orders;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
    ON public.orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending orders
CREATE POLICY "Users can update their own pending orders"
    ON public.orders
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- 9. CREATE RLS POLICIES FOR ORDER ITEMS
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;

-- Users can view order items for their own orders
CREATE POLICY "Users can view their own order items"
    ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Users can insert order items for their own orders
CREATE POLICY "Users can insert their own order items"
    ON public.order_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- 10. CREATE RLS POLICIES FOR PAYMENT TRANSACTIONS
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users can insert their own payment transactions" ON public.payment_transactions;

-- Users can view transactions for their own orders
CREATE POLICY "Users can view their own payment transactions"
    ON public.payment_transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payment_transactions.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Users can insert transactions for their own orders
CREATE POLICY "Users can insert their own payment transactions"
    ON public.payment_transactions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payment_transactions.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- 11. CREATE FUNCTION TO GENERATE ORDER NUMBER
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    done BOOLEAN := FALSE;
BEGIN
    WHILE NOT done LOOP
        new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_order_number) THEN
            done := TRUE;
        END IF;
    END LOOP;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- 12. GRANT PERMISSIONS
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.payment_transactions TO authenticated;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- To run this:
-- 1. Go to Supabase Dashboard
-- 2. Click "SQL Editor"
-- 3. Click "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" button
-- 6. Tables will be created with all relationships and security
