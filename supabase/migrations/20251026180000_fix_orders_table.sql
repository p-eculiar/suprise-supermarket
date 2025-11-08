-- Fix orders table to ensure all columns exist and have proper constraints

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_state TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_postal_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paystack_reference TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approval_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bank_transfer_details JSONB;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'confirmed', 'shipped', 'delivered'));
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- Column already exists, ignore
END $$;

-- Ensure the status column has the correct constraint
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    -- First drop any existing constraint
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
    
    -- Add the correct constraint
    ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'confirmed', 'shipped', 'delivered'));
  END IF;
EXCEPTION WHEN undefined_column THEN
  -- Status column doesn't exist, ignore
END $$;

-- Update existing status values to match new constraints (only if status column exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    UPDATE orders SET status = 'pending' WHERE status NOT IN ('pending', 'processing', 'completed', 'cancelled', 'confirmed', 'shipped', 'delivered');
  END IF;
EXCEPTION WHEN undefined_column THEN
  -- Status column doesn't exist, ignore
END $$;