-- Create function to get dashboard statistics for admin
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE(
  totalOrders BIGINT,
  totalRevenue DECIMAL(10, 2),
  totalProducts BIGINT,
  totalUsers BIGINT,
  recentOrders JSONB,
  topProducts JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM orders) AS totalOrders,
    (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed') AS totalRevenue,
    (SELECT COUNT(*) FROM products) AS totalProducts,
    (SELECT COUNT(*) FROM users) AS totalUsers,
    (SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT id, order_number, customer_name, total, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    ) t) AS recentOrders,
    (SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT p.name, SUM(oi.quantity) as total_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    ) t) AS topProducts;
END;
$$ LANGUAGE plpgsql;

-- Create a view for dashboard stats
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM orders) AS total_orders,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed') AS total_revenue,
  (SELECT COUNT(*) FROM products) AS total_products,
  (SELECT COUNT(*) FROM users) AS total_users;

-- Test the function
-- SELECT * FROM get_admin_dashboard_stats();

-- Test the view
-- SELECT * FROM dashboard_stats;