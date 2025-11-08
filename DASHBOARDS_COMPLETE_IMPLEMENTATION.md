# 🎛️ DASHBOARDS COMPLETE IMPLEMENTATION GUIDE

## 📊 CURRENT STATUS ANALYSIS

### USER DASHBOARD PAGES

| Page | File | Status | Integration Needed |
|------|------|--------|-------------------|
| **Dashboard Home** | `UserDashboard.tsx` | ✅ Exists | 🔄 Connect to real data |
| **Customization** | `Customization.tsx` | ✅ Exists | 🔄 Update profiles table + refresh context |
| **Orders** | `Orders.tsx` | ⚠️ Stub (104 bytes) | 🔴 Build from scratch |
| **History** | `History.tsx` | ✅ Exists | 🔄 Connect to real data |
| **Messages** | `Messages.tsx` | ⚠️ Stub (106 bytes) | 🔴 Build from scratch |
| **Payment** | `Payment.tsx` | ⚠️ Stub (111 bytes) | 🔴 Build from scratch |
| **Feedback** | `Feedback.tsx` | ⚠️ Stub (106 bytes) | 🔴 Build from scratch |

### ADMIN DASHBOARD PAGES

| Page | File | Status | Integration Needed |
|------|------|--------|-------------------|
| **Dashboard Home** | `Dashboard.tsx` | ✅ Exists | 🔄 Connect to analytics service |
| **Products Management** | `Products.tsx` | ✅ Exists | ✅ Already integrated |
| **Product Form** | `ProductForm.tsx` | ✅ Exists | 🔄 Add image upload |
| **Orders Management** | `Orders.tsx` | ✅ Exists | 🔄 Connect to real orders |
| **Users Management** | `Users.tsx` | ✅ Exists | 🔄 Connect to real users |
| **Settings** | `Settings.tsx` | ✅ Exists | 🔄 Connect to settings |
| **Corporate Clients** | `CorporateClients.tsx` | ✅ Exists | ℹ️ Optional feature |
| **Diaspora Gifting** | `DiasporaGifting.tsx` | ✅ Exists | ℹ️ Optional feature |
| **Social Leads** | `SocialLeads.tsx` | ✅ Exists | ℹ️ Optional feature |
| **Subscriptions** | `Subscriptions.tsx` | ✅ Exists | ℹ️ Optional feature |
| **Nigeria Analytics** | `NigeriaAnalytics.tsx` | ✅ Exists | 🔄 Connect to real data |
| **Categories Management** | N/A | ❌ Missing | 🔴 Create new page |

---

## 🎯 IMPLEMENTATION PRIORITY

### CRITICAL (Do These First!) 🔥

1. **Update Customization Page** (User Dashboard)
   - Update profiles table
   - Refresh AuthContext immediately
   - Show updated name in header/nav
   - Toast notifications for success/error

2. **Create Categories Management** (Admin Dashboard)
   - Add new categories
   - Edit existing categories
   - Delete categories
   - Upload category images
   - Set category slug/description

3. **Complete Orders Page** (User Dashboard)
   - List user's orders
   - Order details modal
   - Order tracking
   - Reorder functionality

4. **Update Admin Dashboard Home**
   - Real-time statistics
   - Sales charts
   - Recent orders
   - Low stock alerts

---

## 📝 DETAILED IMPLEMENTATION PLAN

### 1. USER CUSTOMIZATION PAGE (CRITICAL)

**Current Issues:**
- ❌ Only updates auth metadata, not profiles table
- ❌ Doesn't refresh context after update
- ❌ Name in header doesn't update immediately
- ❌ Uses direct Supabase calls instead of userService

**Required Changes:**
```typescript
// Should do:
1. Update auth.updateUser() ✅
2. Update profiles table via userService ✅
3. Call refreshUser() in AuthContext ✅
4. Show toast notification ✅
5. Update all components showing user info ✅
```

**Files to Update:**
- `src/pages/dashboard/Customization.tsx`
- `src/contexts/AuthContext.tsx` (add refreshUser function)

---

### 2. CATEGORIES MANAGEMENT PAGE (CRITICAL)

**What's Needed:**
```typescript
// Admin should be able to:
✅ View all categories
✅ Add new category (name, slug, description, image)
✅ Edit category details
✅ Delete category (with confirmation)
✅ Upload/update category images
✅ See product count per category
✅ Set category order/priority
```

**New File:**
- `src/pages/admin/Categories.tsx`

**Database:**
```sql
-- May need categories table (optional)
-- Or just use product.category as enum
SELECT DISTINCT category, COUNT(*) as product_count
FROM products
GROUP BY category;
```

---

### 3. USER ORDERS PAGE (HIGH PRIORITY)

**What's Needed:**
```typescript
// User should see:
✅ List of all their orders
✅ Order status (pending, processing, shipped, delivered)
✅ Order date and total
✅ View order details (items, address, payment)
✅ Track order status
✅ Reorder button
✅ Download invoice/receipt
✅ Filter by status/date
```

**New File:**
- `src/pages/dashboard/Orders.tsx` (rebuild from stub)

---

### 4. ADMIN DASHBOARD HOME (HIGH PRIORITY)

**What's Needed:**
```typescript
// Dashboard should show:
✅ Total revenue (today, week, month)
✅ Total orders (with growth %)
✅ Total customers (with growth %)
✅ Total products
✅ Sales chart (last 7/30 days)
✅ Recent orders table
✅ Low stock products alert
✅ Top selling products
✅ Revenue by category
```

**Update File:**
- `src/pages/admin/Dashboard.tsx`

---

### 5. ADMIN PRODUCTS PAGE (MEDIUM PRIORITY)

**Current Status:** ✅ Already integrated with Supabase

**Enhancements Needed:**
```typescript
✅ Add ImageUpload component to ProductForm
✅ Bulk actions (delete multiple, export)
✅ Stock management
✅ Featured/bestseller toggle
✅ Duplicate product
✅ Import products (CSV)
```

**Update Files:**
- `src/pages/admin/ProductForm.tsx`
- `src/pages/admin/Products.tsx`

---

### 6. ADMIN ORDERS PAGE (MEDIUM PRIORITY)

**What's Needed:**
```typescript
// Admin should be able to:
✅ View all orders
✅ Filter by status/date/customer
✅ Update order status
✅ View order details
✅ Print packing slip
✅ Refund order
✅ Send tracking info to customer
✅ Mark as shipped/delivered
```

**Update File:**
- `src/pages/admin/Orders.tsx`

---

### 7. ADMIN USERS PAGE (MEDIUM PRIORITY)

**What's Needed:**
```typescript
// Admin should see:
✅ List of all users
✅ User details (name, email, join date)
✅ Order count and total spent
✅ Ban/activate user
✅ View user's orders
✅ Search users
✅ Export user list
```

**Update File:**
- `src/pages/admin/Users.tsx`

---

### 8. USER MESSAGES PAGE (LOW PRIORITY)

**What's Needed:**
```typescript
// User can:
✅ Send message to support
✅ View message history
✅ See admin responses
✅ Mark as read/unread
✅ Attach files (optional)
```

**New File:**
- `src/pages/dashboard/Messages.tsx` (rebuild)

**Database:**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subject TEXT,
  message TEXT,
  status VARCHAR(20), -- 'open', 'replied', 'closed'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 9. USER PAYMENT PAGE (LOW PRIORITY)

**What's Needed:**
```typescript
// User can see:
✅ Payment history
✅ Saved payment methods
✅ Transaction details
✅ Download receipts
✅ Refund requests
```

**New File:**
- `src/pages/dashboard/Payment.tsx` (rebuild)

---

## 🔧 IMPLEMENTATION STEPS

### STEP 1: Fix Customization Page (30 min)

**Changes Required:**
1. Import userService
2. Update both auth and profiles table
3. Add refreshUser to AuthContext
4. Call refreshUser after save
5. Add better toast notifications

### STEP 2: Create Categories Management (45 min)

**Implementation:**
1. Create Categories.tsx page
2. Add CRUD operations for categories
3. Add category image upload
4. Add to admin navigation
5. Add route in App.tsx

### STEP 3: Create User Orders Page (30 min)

**Implementation:**
1. Rebuild Orders.tsx
2. Fetch user orders from database
3. Display order cards with details
4. Add filters and search
5. Add order detail modal

### STEP 4: Update Admin Dashboard (30 min)

**Implementation:**
1. Connect to adminService
2. Fetch real statistics
3. Create sales chart component
4. Display recent orders
5. Add low stock alerts

### STEP 5: Enhance Product Form (20 min)

**Implementation:**
1. Add ImageUpload component
2. Handle image upload on save
3. Show image preview
4. Add validation

---

## 🎨 UI/UX REQUIREMENTS

### Customization Page:
```
✅ Profile picture upload with preview
✅ Form fields: Name, Email, Phone, Address
✅ Loading states during save
✅ Success/error messages
✅ Immediate header update after save
✅ Responsive design
```

### Categories Management:
```
✅ Grid/List view of categories
✅ Add category modal/form
✅ Edit inline or modal
✅ Delete with confirmation
✅ Image upload for each category
✅ Product count badge
✅ Drag & drop to reorder (optional)
```

### Orders Pages:
```
✅ Order cards with key info
✅ Status badges (color-coded)
✅ Timeline/tracking view
✅ Order detail modal
✅ Filter by status/date
✅ Search by order number
✅ Download invoice button
```

### Admin Dashboard:
```
✅ Stat cards with icons
✅ Growth indicators (↑/↓)
✅ Line/Bar charts for sales
✅ Recent orders table
✅ Quick actions menu
✅ Refresh button
✅ Date range selector
```

---

## 📊 DATABASE REQUIREMENTS

### Ensure These Tables Exist:

```sql
-- profiles table (for customization)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  avatar_url TEXT,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- categories table (optional - or use products.category)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  product_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- messages table (for support)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  admin_response TEXT,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP
);
```

---

## ✅ SUCCESS CRITERIA

### User Dashboard:
- [ ] User can update profile and see changes in header immediately
- [ ] User can view all their orders
- [ ] User can track order status
- [ ] User can send messages to support
- [ ] User can view payment history

### Admin Dashboard:
- [ ] Admin sees real-time statistics
- [ ] Admin can add/edit/delete categories
- [ ] Admin can add/edit/delete products with images
- [ ] Admin can manage orders (update status)
- [ ] Admin can view and manage users
- [ ] Admin can respond to user messages

---

## 🚀 READY TO IMPLEMENT!

I'll now create/update these files in priority order:

1. ✅ Update AuthContext with refreshUser
2. ✅ Update Customization page
3. ✅ Create Categories Management
4. ✅ Rebuild User Orders page
5. ✅ Update Admin Dashboard

**Let's start!** 🎯
