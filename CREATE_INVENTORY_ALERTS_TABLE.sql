-- Create inventory_alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    current_stock INTEGER NOT NULL,
    threshold INTEGER NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstock')),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_resolved ON inventory_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_alert_type ON inventory_alerts(alert_type);

-- Enable Row Level Security
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory alerts (admin only)
CREATE POLICY "Admins can manage inventory alerts" ON inventory_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Insert some sample inventory alerts for testing
INSERT INTO inventory_alerts (product_id, product_name, current_stock, threshold, alert_type, resolved)
SELECT 
    id as product_id,
    name as product_name,
    stock as current_stock,
    low_stock_threshold as threshold,
    CASE 
        WHEN stock = 0 THEN 'out_of_stock'
        WHEN stock <= low_stock_threshold THEN 'low_stock'
        ELSE 'overstock'
    END as alert_type,
    FALSE as resolved
FROM products 
WHERE stock <= low_stock_threshold
ON CONFLICT DO NOTHING;