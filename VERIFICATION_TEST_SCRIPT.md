# Verification Test Script

## Overview
This script outlines the steps to verify that all key functionality of the Suprise Supermarket application is working correctly.

## Test 1: Email Verification Flow

### Steps:
1. Navigate to the registration page (/register)
2. Fill in the registration form with valid information:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPass123!
   - Confirm Password: TestPass123!
   - Check "I agree to the Terms of Service and Privacy Policy"
3. Click "Create Account"
4. Verify that:
   - User is redirected to the email verification page (/verify-email)
   - Success message is displayed: "Account created successfully! Please check your email to verify your account."
   - Email is sent to the provided address

5. Check email and click the verification link
6. Verify that:
   - User is automatically logged in
   - User is redirected to the homepage (/)
   - User's name/email appears in the header
   - User is directed to the user dashboard when clicking "Dashboard" in the profile dropdown

### Expected Results:
✅ User can register successfully
✅ User is redirected to verification page
✅ Email verification works
✅ User is automatically logged in after verification
✅ User is directed to correct dashboard based on role

## Test 2: Admin Dashboard Access

### Prerequisites:
- Have an existing user account that has been assigned admin role

### Steps:
1. Log in with admin credentials
2. Verify that:
   - User is logged in successfully
   - User's name/email appears in the header
   - When clicking "Dashboard" in the profile dropdown, user is directed to /admin

3. Navigate to /admin
4. Verify that:
   - Admin dashboard loads correctly
   - Real-time statistics are displayed
   - Recent orders are shown
   - Top selling products are displayed

### Expected Results:
✅ Admin user can log in
✅ Admin user is directed to admin dashboard
✅ Admin dashboard displays real data
✅ Admin can access all admin features

## Test 3: Regular User Dashboard Access

### Steps:
1. Log in with regular user credentials (non-admin)
2. Verify that:
   - User is logged in successfully
   - User's name/email appears in the header
   - When clicking "Dashboard" in the profile dropdown, user is directed to /dashboard

3. Navigate to /dashboard
4. Verify that:
   - User dashboard loads correctly
   - Product categories are displayed
   - Featured products are shown
   - Recent orders are displayed (if any)

### Expected Results:
✅ Regular user can log in
✅ Regular user is directed to user dashboard
✅ User dashboard displays real data

## Test 4: Add to Cart Functionality

### Steps:
1. Navigate to the homepage or products page while NOT logged in
2. Click "Add to Cart" on any product
3. Verify that:
   - Toast notification appears: "Please login or signup to add items to cart"
   - User is redirected to login page after 1.5 seconds
   - Product information is passed in the navigation state

4. Log in with valid credentials
5. Verify that:
   - User is redirected back to the previous page or cart
   - Product is automatically added to cart
   - Cart icon shows correct item count

6. Log out and log back in
7. Navigate to /cart
8. Verify that:
   - Previously added items are still in cart
   - Cart total is calculated correctly

### Expected Results:
✅ Unauthenticated users are redirected to login
✅ Product information is preserved during login flow
✅ Items are automatically added after login
✅ Cart persists between sessions

## Test 5: Product Browsing

### Steps:
1. Navigate to /products
2. Verify that:
   - Products are loaded from database
   - Categories filter works
   - Price filter works
   - Sorting options work
   - Pagination works

3. Click on a product to view details
4. Verify that:
   - Product details page loads
   - Product information is displayed correctly
   - "Add to Cart" button works (follows authentication flow)

### Expected Results:
✅ Products load from database
✅ Filtering and sorting work correctly
✅ Product details are displayed
✅ Add to cart functionality works

## Test 6: Order History

### Steps:
1. Log in as a user with previous orders
2. Navigate to /dashboard
3. Verify that:
   - Recent orders are displayed in the sidebar
   - Order totals are calculated correctly
   - Order dates are displayed

4. Navigate to /orders (if applicable)
5. Verify that:
   - Complete order history is displayed
   - Order details are accessible

### Expected Results:
✅ Order history is displayed
✅ Order information is accurate
✅ Order details are accessible

## Test 7: Admin Order Management

### Steps:
1. Log in as admin user
2. Navigate to /admin/orders
3. Verify that:
   - All orders are displayed
   - Order status can be updated
   - Order details are accessible
   - Search functionality works

### Expected Results:
✅ Admin can view all orders
✅ Admin can manage order status
✅ Order search works correctly

## Test 8: Profile Management

### Steps:
1. Log in as any user
2. Click on profile avatar in header
3. Select appropriate dashboard option
4. Navigate to profile settings (if implemented)
5. Verify that:
   - User can view their profile information
   - User can update their profile information
   - Changes are saved correctly

### Expected Results:
✅ Users can access their profile
✅ Profile information is displayed
✅ Profile updates work correctly

## Test 9: Responsive Design

### Steps:
1. Navigate to homepage on desktop
2. Verify that:
   - Layout is correct
   - All components are visible
   - Navigation works

3. Resize browser to mobile dimensions
4. Verify that:
   - Mobile menu appears
   - Layout adjusts appropriately
   - All functionality is accessible

### Expected Results:
✅ Desktop layout is correct
✅ Mobile layout is responsive
✅ All functionality works on mobile

## Test 10: Error Handling

### Steps:
1. Attempt to access admin pages as non-admin user
2. Verify that:
   - User is redirected to homepage or login page
   - No errors are displayed to user

3. Attempt to access non-existent pages
4. Verify that:
   - 404 page is displayed
   - User can navigate back to homepage

5. Disconnect internet and try to perform actions
6. Verify that:
   - Appropriate error messages are displayed
   - App handles disconnection gracefully

### Expected Results:
✅ Unauthorized access is properly handled
✅ 404 errors are handled gracefully
✅ Network errors are handled appropriately

## Conclusion

If all tests pass, the Suprise Supermarket application is functioning correctly with all requested features working as expected:

✅ Email verification flow works seamlessly
✅ Role-based dashboard access functions correctly
✅ Authentication-aware cart functionality works
✅ All dashboard components use real data
✅ Responsive design works on all devices
✅ Error handling is appropriate
✅ Security measures are in place