import { supabase } from '../lib/supabase';

class ImageService {
  /**
   * Upload product image to Supabase Storage
   */
  async uploadProductImage(file: File, productId?: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = productId 
        ? `${productId}-${Date.now()}.${fileExt}`
        : `product-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload image error:', error);
      return null;
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadProductImage(file));
    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  }

  /**
   * Delete product image
   */
  async deleteProductImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/product-images/');
      if (urlParts.length < 2) return false;
      
      const filePath = `products/${urlParts[1]}`;

      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete image error:', error);
      return false;
    }
  }

  /**
   * Update product image in database
   */
  async updateProductImage(productId: string, newImageUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ image_url: newImageUrl })
        .eq('id', productId);

      if (error) {
        console.error('Error updating product image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update product image error:', error);
      return false;
    }
  }

  /**
   * Upload category image
   */
  async uploadCategoryImage(file: File, categoryName: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${categoryName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading category image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload category image error:', error);
      return null;
    }
  }

  /**
   * Get placeholder image URL by category
   */
  getPlaceholderImage(category: string): string {
    const placeholders: Record<string, string> = {
      'Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
      'Fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80',
      'Dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80',
      'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=80',
      'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
      'Beverages': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
      'Snacks': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=80',
      'Seafood': 'https://images.unsplash.com/photo-1615485500834-bc10199bc6dd?w=500&auto=format&fit=crop&q=80',
      'Frozen': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80',
      'Organic': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&auto=format&fit=crop&q=80',
    };

    return placeholders[category] || 'https://images.unsplash.com/photo-1542838132-92d533f92e39?w=500&auto=format&fit=crop&q=80';
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, or WebP.' };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 5MB.' };
    }

    return { valid: true };
  }

  /**
   * Compress image before upload (optional)
   */
  async compressImage(file: File, maxWidth: number = 800): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}

export const imageService = new ImageService();
