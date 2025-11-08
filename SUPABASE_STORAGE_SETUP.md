# 📦 SUPABASE STORAGE SETUP FOR IMAGES

## 🎯 OVERVIEW

This guide sets up image storage in Supabase so admins can upload/update product images through the dashboard.

---

## STEP 1: Create Storage Bucket (2 minutes)

### In Supabase Dashboard:

1. **Go to Storage**
   - Click "Storage" in the left sidebar
   - Click "New Bucket"

2. **Create `product-images` Bucket**
   - Name: `product-images`
   - **Public bucket**: Toggle ON ✅
   - **File size limit**: 5MB
   - **Allowed MIME types**: 
     - image/jpeg
     - image/jpg
     - image/png
     - image/webp
   - Click "Create bucket"

3. **Create Folder Structure** (optional)
   - Click on `product-images` bucket
   - Create folders:
     - `products/`
     - `categories/`
     - `banners/`
     - `logos/`

---

## STEP 2: Set Storage Policies (2 minutes)

### In Supabase Dashboard → Storage → Policies:

1. **Allow Public Read**
   ```sql
   CREATE POLICY "Public can view product images"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'product-images' );
   ```

2. **Allow Authenticated Users to Upload**
   ```sql
   CREATE POLICY "Authenticated users can upload product images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'product-images' 
     AND auth.role() = 'authenticated'
   );
   ```

3. **Allow Authenticated Users to Update**
   ```sql
   CREATE POLICY "Authenticated users can update product images"
   ON storage.objects FOR UPDATE
   USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' )
   WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
   ```

4. **Allow Authenticated Users to Delete**
   ```sql
   CREATE POLICY "Authenticated users can delete product images"
   ON storage.objects FOR DELETE
   USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
   ```

---

## STEP 3: Test Image Upload (1 minute)

### In Supabase Dashboard:

1. Go to Storage → `product-images`
2. Click "Upload file"
3. Select an image
4. Upload successfully? ✅

---

## 🎨 USING PLACEHOLDER IMAGES NOW

### Current Setup:
- ✅ All products use Unsplash images (professional, free to use)
- ✅ Images are hosted on Unsplash CDN (fast, reliable)
- ✅ No storage limits while using Unsplash
- ✅ Perfect for development and testing

### Categories with Images:
- **Vegetables**: 10 products with images
- **Fruits**: 10 products with images  
- **Dairy**: 5 products with images
- **Bakery**: 5 products with images
- **Meat/Seafood**: 5 products with images
- **Beverages**: 5 products with images
- **Snacks**: 5 products with images

**Total**: 50 products, all with professional placeholder images!

---

## 🔄 UPDATING TO REAL IMAGES LATER

### Through Admin Dashboard:

1. **Navigate to Admin → Products**
2. **Click on any product**
3. **Click "Edit" or "Update Image"**
4. **Upload new image** (drag & drop or browse)
5. **Image automatically:**
   - Uploads to Supabase Storage
   - Compresses if needed
   - Updates database URL
   - Displays on website immediately

### Image Upload Component Features:
- ✅ Drag & drop support
- ✅ Image preview before upload
- ✅ Automatic compression
- ✅ File type validation
- ✅ File size validation (max 5MB)
- ✅ Progress indicator
- ✅ Multiple images at once

---

## 📊 STORAGE LIMITS

### Supabase Free Tier:
- **Storage**: 1 GB
- **Transfer**: 2 GB/month
- **Perfect for**: 100-200 product images

### Upgrade When Needed:
- **Pro Plan** ($25/month): 100 GB storage
- **Pay as you go**: $0.021/GB/month

---

## 🎯 BEST PRACTICES

### Image Guidelines:
1. **Size**: 800x800px recommended
2. **Format**: WebP preferred (smaller file size)
3. **Quality**: 80% compression (good balance)
4. **Naming**: Use descriptive names
5. **Alt Text**: Add descriptions for SEO

### Performance:
- ✅ Images lazy-load automatically
- ✅ Responsive images served
- ✅ CDN caching enabled
- ✅ WebP with fallback

---

## 🚀 READY TO USE!

### What Works Now:
- ✅ Homepage shows products with images
- ✅ Products page shows all products with images
- ✅ Categories have appropriate images
- ✅ All sections display correctly

### What You Can Do Later:
1. Upload real product photos
2. Update through admin dashboard
3. Batch upload multiple images
4. Organize in folders
5. Delete old placeholders

---

## 📝 QUICK COMMANDS

### Get Storage Usage:
```sql
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint / 1024 / 1024 as total_mb
FROM storage.objects
GROUP BY bucket_id;
```

### List All Product Images:
```sql
SELECT name, created_at, 
  (metadata->>'size')::bigint / 1024 as size_kb
FROM storage.objects
WHERE bucket_id = 'product-images'
  AND name LIKE 'products/%'
ORDER BY created_at DESC;
```

### Clean Up Old Images:
```sql
-- Delete images older than 30 days not in use
DELETE FROM storage.objects
WHERE bucket_id = 'product-images'
  AND created_at < NOW() - INTERVAL '30 days'
  AND name NOT IN (SELECT image_url FROM products);
```

---

## ✅ SETUP COMPLETE!

Your image system is ready:
- ✅ 50 products with placeholder images
- ✅ Storage bucket configured
- ✅ Upload service created
- ✅ Admin dashboard ready for image updates
- ✅ All pages displaying images correctly

**You can now use the website with these images and update them later through the admin panel!**

---

**Need Help?**
- Supabase Storage Docs: https://supabase.com/docs/guides/storage
- Image Optimization: https://web.dev/fast/#optimize-your-images
