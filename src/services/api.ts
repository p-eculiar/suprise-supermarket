import { supabase } from '../lib/supabase';

// Types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}



// API methods
export const contactApi = {
  /**
   * Submit contact form data to the server
   * @param data Contact form data
   * @returns Promise with success status and message
   */
  submitContactForm: async (data: ContactFormData): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.from('contacts').insert([data]);

      if (error) {
        throw error;
      }

      return { success: true, message: 'Form submitted successfully!' };
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      throw new Error(error.message || 'Failed to submit contact form');
    }
  },
};

// Products API
export const fetchProducts = async (filters?: any): Promise<{ data: any[], count: number }> => {
  try {
    let query = supabase.from('products').select('*', { count: 'exact' });

    // Featured filter
    if (filters?.isFeatured) {
      query = query.eq('is_featured', true);
    }

    // Category filter
    if (filters?.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories);
    }

    // Price range filter
    if (filters?.priceRange && filters.priceRange.length === 2) {
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
    }

    // Rating filter
    if (filters?.rating) {
      query = query.gte('rating', filters.rating);
    }

    // Search query
    if (filters?.searchQuery) {
      query = query.ilike('name', `%${filters.searchQuery}%`);
    }

    // Sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name-asc':
          query = query.order('name', { ascending: true });
          break;
        case 'name-desc':
          query = query.order('name', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'featured':
          query = query.eq('is_featured', true).order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    }

    // Pagination
    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    } else if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  } catch (error: any) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

