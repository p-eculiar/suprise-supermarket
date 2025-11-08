import { supabase } from '../lib/supabase';
import { EmailNotificationService } from './emailService';

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
   * Submit contact form data to the server and send email notification
   * @param data Contact form data
   * @returns Promise with success status and message
   */
  submitContactForm: async (data: ContactFormData): Promise<{ success: boolean; message: string }> => {
    try {
      // First, save the contact data to the database
      const { error: insertError } = await supabase.from('contacts').insert([data]);

      if (insertError) {
        throw insertError;
      }

      // Call the Edge Function directly to send email notification
      try {
        console.log('Calling Edge Function to send email notification');
        
        const response = await fetch('https://awepkphahdheqomgucby.supabase.co/functions/v1/contact-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            contact: {
              ...data,
              created_at: new Date().toISOString()
            }
          })
        });

        const result = await response.json();
        console.log('Edge Function response:', result);
        
        if (result.success) {
          console.log('Email notification sent successfully');
        } else {
          console.warn('Failed to send email notification:', result.error);
        }
      } catch (edgeFunctionError) {
        console.error('Error calling Edge Function:', edgeFunctionError);
        // Don't throw here - we still want to consider the form submission successful
      }

      return { success: true, message: 'Form submitted successfully! We\'ll get back to you soon.' };
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      throw new Error(error.message || 'Failed to submit contact form');
    }
  },
};

// Products API with improved error handling
export const fetchProducts = async (filters?: any): Promise<{ data: any[], count: number }> => {
  try {
    // Check if we have a valid session before making requests
    const { data: { session } } = await supabase.auth.getSession();
    
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

    if (error) {
      console.error('Products API error:', error);
      // If it's an authentication error, try to refresh the session
      if (error.message?.includes('jwt expired') || error.message?.includes('Invalid JWT')) {
        console.log('JWT expired, attempting to refresh session');
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Session refresh failed:', refreshError);
          throw new Error('Authentication expired. Please refresh the page.');
        }
        // Retry the request
        const retryQuery = supabase.from('products').select('*', { count: 'exact' });
        // Apply same filters as above...
        const { data: retryData, error: retryError, count: retryCount } = await retryQuery;
        if (retryError) throw retryError;
        return { data: retryData || [], count: retryCount || 0 };
      }
      throw error;
    }
    return { data: data || [], count: count || 0 };
  } catch (error: any) {
    console.error('Failed to fetch products:', error);
    throw new Error(error.message || 'Failed to load products. Please refresh the page.');
  }
};

