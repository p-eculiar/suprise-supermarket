-- Create diaspora_gift_baskets table
CREATE TABLE IF NOT EXISTS diaspora_gift_baskets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price_ngn DECIMAL(10, 2) NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  price_gbp DECIMAL(10, 2) NOT NULL,
  price_eur DECIMAL(10, 2) NOT NULL,
  items JSONB DEFAULT '[]',
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diaspora_orders table
CREATE TABLE IF NOT EXISTS diaspora_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  basket_id UUID REFERENCES diaspora_gift_baskets(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  sender_country TEXT,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT,
  recipient_address TEXT NOT NULL,
  recipient_city TEXT,
  recipient_state TEXT,
  recipient_lga TEXT,
  gift_message TEXT,
  delivery_instructions TEXT,
  preferred_delivery_date DATE,
  currency TEXT NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  total_ngn DECIMAL(10, 2) NOT NULL,
  exchange_rate DECIMAL(10, 6) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'confirmed', 'shipped', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diaspora_gift_baskets_active ON diaspora_gift_baskets(active);
CREATE INDEX IF NOT EXISTS idx_diaspora_gift_baskets_created_at ON diaspora_gift_baskets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diaspora_orders_basket_id ON diaspora_orders(basket_id);
CREATE INDEX IF NOT EXISTS idx_diaspora_orders_status ON diaspora_orders(status);
CREATE INDEX IF NOT EXISTS idx_diaspora_orders_created_at ON diaspora_orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE diaspora_gift_baskets ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaspora_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for diaspora_gift_baskets (public read for active baskets, admin write)
CREATE POLICY "Anyone can view active gift baskets" ON diaspora_gift_baskets
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage gift baskets" ON diaspora_gift_baskets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for diaspora_orders
CREATE POLICY "Users can view their own diaspora orders" ON diaspora_orders
  FOR SELECT USING (sender_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can view all diaspora orders" ON diaspora_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage diaspora orders" ON diaspora_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample gift baskets
INSERT INTO diaspora_gift_baskets (name, description, price_ngn, price_usd, price_gbp, price_eur, items, image_url, active) VALUES
('Essential Groceries Basket', 'A perfect starter basket with essential Nigerian groceries including rice, beans, spices, and cooking oil.', 25000, 250, 200, 230, '[
  {"name": "5kg Premium Rice", "quantity": 1, "unit": "bag"},
  {"name": "2kg Beans", "quantity": 1, "unit": "pack"},
  {"name": "Vegetable Oil", "quantity": 1, "unit": "bottle"},
  {"name": "Tomato Paste", "quantity": 2, "unit": "tins"},
  {"name": "Seasoning Cubes", "quantity": 2, "unit": "packs"},
  {"name": "Garri", "quantity": 1, "unit": "bag"}
]', 'https://images.unsplash.com/photo-1574375929283-1a64d9a6f7f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', true),
('Premium Snacks Basket', 'Delight your loved ones with a selection of popular Nigerian snacks and treats.', 35000, 350, 280, 320, '[
  {"name": "Chin Chin", "quantity": 3, "unit": "packs"},
  {"name": "Biscuits", "quantity": 2, "unit": "packs"},
  {"name": "Popcorn", "quantity": 2, "unit": "packs"},
  {"name": "Peanuts", "quantity": 1, "unit": "bag"},
  {"name": "Cashew Nuts", "quantity": 1, "unit": "pack"},
  {"name": "Gala", "quantity": 2, "unit": "packs"}
]', 'https://images.unsplash.com/photo-1614023445217-2b6e6a0d3a6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', true),
('Fresh Produce Basket', 'Fresh vegetables and fruits to make delicious Nigerian meals.', 20000, 200, 160, 185, '[
  {"name": "Tomatoes", "quantity": 2, "unit": "kg"},
  {"name": "Onions", "quantity": 1, "unit": "kg"},
  {"name": "Pepper", "quantity": 500, "unit": "g"},
  {"name": "Plantain", "quantity": 5, "unit": "pieces"},
  {"name": "Bananas", "quantity": 1, "unit": "bunch"},
  {"name": "Oranges", "quantity": 6, "unit": "pieces"}
]', 'https://images.unsplash.com/photo-1557844352-761dcf98555f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', true)
ON CONFLICT DO NOTHING;