-- Create or replace the dashboard_stats view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM orders) AS total_orders,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed') AS total_revenue,
  (SELECT COUNT(*) FROM products) AS total_products,
  (SELECT COUNT(*) FROM profiles) AS total_users;

-- Grant access to the view for admins
GRANT SELECT ON dashboard_stats TO authenticated;

-- Add a comment to describe the view
COMMENT ON VIEW dashboard_stats IS 'Dashboard statistics for admin panel';