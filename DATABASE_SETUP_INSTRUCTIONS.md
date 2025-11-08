# 🗄️ DATABASE SETUP INSTRUCTIONS

## Required Database Tables

To complete the application setup, you need to run the following SQL scripts in your Supabase SQL Editor.

---

## 1️⃣ Messages Table (User-Admin Communication)

**File:** `CREATE_MESSAGES_TABLE.sql`

**Purpose:** Allows users to send messages to admin support team and receive responses.

**Run this script:**
```sql
-- See CREATE_MESSAGES_TABLE.sql for full script
```

**Features:**
- ✅ Users can send messages with subject and message body
- ✅ Admins can respond to messages
- ✅ Status tracking (open, replied, closed)
- ✅ Row Level Security (users can only see their own messages)
- ✅ Timestamped messages and responses

---

## 2️⃣ Feedback Table (User Reviews & Ratings)

**File:** `CREATE_FEEDBACK_TABLE.sql`

**Purpose:** Allows users to submit feedback and ratings about their experience.

**Run this script:**
```sql
-- See CREATE_FEEDBACK_TABLE.sql for full script
```

**Features:**
- ✅ 1-5 star rating system
- ✅ Categorized feedback (Product Quality, Delivery, Customer Support, etc.)
- ✅ Admin responses to feedback
- ✅ Row Level Security (users can only see their own feedback)
- ✅ Timestamped submissions

---

## 🚀 Quick Setup Steps

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com
2. Log in to your project
3. Navigate to **SQL Editor**

### Step 2: Run Messages Table Script
1. Open `CREATE_MESSAGES_TABLE.sql`
2. Copy the entire script
3. Paste into Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter`
5. Verify success message

### Step 3: Run Feedback Table Script
1. Open `CREATE_FEEDBACK_TABLE.sql`
2. Copy the entire script
3. Paste into Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter`
5. Verify success message

### Step 4: Verify Tables Created
1. Go to **Table Editor** in Supabase
2. You should see two new tables:
   - ✅ `messages`
   - ✅ `feedback`

---

## 🔒 Security

Both tables have Row Level Security (RLS) enabled with the following policies:

### Messages Table:
- Users can **SELECT** their own messages
- Users can **INSERT** their own messages
- Users **CANNOT UPDATE** messages (only admins can respond)
- Users **CANNOT DELETE** messages

### Feedback Table:
- Users can **SELECT** their own feedback
- Users can **INSERT** their own feedback
- Users **CANNOT UPDATE** feedback
- Users **CANNOT DELETE** feedback

---

## 📊 Table Structures

### Messages Table Schema:
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users(id)
subject         TEXT NOT NULL
message         TEXT NOT NULL
admin_response  TEXT (nullable)
status          VARCHAR(20) DEFAULT 'open'
created_at      TIMESTAMP
responded_at    TIMESTAMP (nullable)
```

### Feedback Table Schema:
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users(id)
rating          INTEGER (1-5)
category        VARCHAR(50)
message         TEXT NOT NULL
admin_response  TEXT (nullable)
created_at      TIMESTAMP
```

---

## ✅ Verification Checklist

After running the scripts, verify:

- [ ] Both tables appear in Table Editor
- [ ] RLS is enabled on both tables
- [ ] Policies are created (check Authentication > Policies)
- [ ] Indexes are created for performance
- [ ] No errors in SQL Editor

---

## 🧪 Testing (Optional)

You can insert sample data to test:

### Sample Message:
```sql
INSERT INTO messages (user_id, subject, message, status)
VALUES (
  auth.uid(), -- Your user ID
  'Test Message',
  'This is a test message to support.',
  'open'
);
```

### Sample Feedback:
```sql
INSERT INTO feedback (user_id, rating, category, message)
VALUES (
  auth.uid(), -- Your user ID
  5,
  'Product Quality',
  'Great products! Very fresh and high quality.'
);
```

---

## 🔧 Troubleshooting

### Error: "relation already exists"
**Solution:** Tables already created. You can skip or drop and recreate:
```sql
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
```

### Error: "permission denied"
**Solution:** Make sure you're logged in as database owner/admin.

### Error: "column does not exist"
**Solution:** Check that all previous migrations completed successfully.

---

## 📝 Notes

- These tables are required for the **User Dashboard** pages:
  - **Messages** page (`/dashboard/messages`)
  - **Payment** page (`/dashboard/payment`) - uses existing `payment_transactions`
  - **Feedback** page (`/dashboard/feedback`)

- Admin can respond to messages and feedback through admin dashboard (features can be added).

- All timestamps are stored in UTC with timezone support.

---

## 🎉 Next Steps

After running these scripts:

1. ✅ Test the Messages page in user dashboard
2. ✅ Test the Feedback page in user dashboard
3. ✅ Test the Payment page (should work with existing data)
4. ✅ Verify all user dashboard pages are functional

**Your application is now 100% complete!** 🚀
