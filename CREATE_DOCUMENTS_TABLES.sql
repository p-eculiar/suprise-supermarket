-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  receipt_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  transaction_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_receipts_order_id ON receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Create policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE id = invoices.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for receipts
CREATE POLICY "Users can view their own receipts" ON receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE id = receipts.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all receipts" ON receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample data to test
INSERT INTO invoices (order_id, invoice_number, customer_name, customer_email, items, subtotal, tax, delivery_fee, discount, total, payment_method, payment_status, order_date, due_date, status)
VALUES 
  ('12a93c70-9831-4d63-a7e4-d0431ae6a049', 'INV-001', 'John Doe', 'surpry1980@yahoo.com', '[{"name": "Test Product", "quantity": 1, "price": 25.98}]', 25.98, 2.08, 5.00, 0.00, 33.06, 'paystack', 'pending', NOW(), NOW() + INTERVAL '30 days', 'pending');

INSERT INTO receipts (order_id, receipt_number, customer_name, customer_email, items, subtotal, tax, delivery_fee, discount, total, payment_method, payment_status, payment_date, transaction_reference)
VALUES 
  ('12a93c70-9831-4d63-a7e4-d0431ae6a049', 'REC-001', 'John Doe', 'surpry1980@yahoo.com', '[{"name": "Test Product", "quantity": 1, "price": 25.98}]', 25.98, 2.08, 5.00, 0.00, 33.06, 'paystack', 'pending', NOW(), 'txn_1234567890');

-- Verify the tables were created
SELECT COUNT(*) as invoice_count FROM invoices;
SELECT COUNT(*) as receipt_count FROM receipts;