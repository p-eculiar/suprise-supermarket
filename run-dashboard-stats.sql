-- First, let's create the dashboard stats view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM orders) AS total_orders,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed') AS total_revenue,
  (SELECT COUNT(*) FROM products) AS total_products,
  (SELECT COUNT(*) FROM users) AS total_users;

-- Test the view
SELECT * FROM dashboard_stats;