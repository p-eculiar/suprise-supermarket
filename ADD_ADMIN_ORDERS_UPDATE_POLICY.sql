-- Add the missing RLS policy to allow admins to update orders
-- This is the specific policy that was missing causing the error

CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );