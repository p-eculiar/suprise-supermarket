-- Add UPDATE policy for admins to be able to mark any notification as read
CREATE POLICY "Admins can update all notifications" ON notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Confirm the policy was added
SELECT * FROM pg policies WHERE tablename = 'notifications';