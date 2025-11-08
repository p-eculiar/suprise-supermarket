import { supabase } from '../lib/supabase';

export interface DealOfWeek {
  id: string;
  product_id: string;
  priority: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  // Custom fields for overriding product details
  custom_name?: string | null;
  custom_description?: string | null;
  custom_price?: number | null;
  custom_image_url?: string | null;
  custom_discount?: number | null;
}

export interface DealWithProduct extends DealOfWeek {
  product_name?: string;
  product_image_url?: string | null;
  product_price?: number;
  product_category?: string | null;
  product_stock?: number;
  product_description?: string | null;
  product_discount?: number | null;
}

export const dealsService = {
  async list(): Promise<DealWithProduct[]> {
    // Join with products to enrich listing
    const { data, error } = await supabase
      .from('deals_of_week')
      .select(`
        id, 
        product_id, 
        priority, 
        active, 
        starts_at, 
        ends_at, 
        created_at,
        custom_name,
        custom_description,
        custom_price,
        custom_image_url,
        custom_discount,
        products:product_id(name, image_url, price, category, stock, description, discount)
      `)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    
    return (data || []).map((row: any) => {
      // Use custom values if provided, otherwise use product values
      const productName = row.custom_name || row.products?.name || 'Unknown Product';
      const productImage = row.custom_image_url || row.products?.image_url || null;
      const productPrice = row.custom_price !== null && row.custom_price !== undefined 
        ? row.custom_price 
        : row.products?.price || 0;
      const productCategory = row.products?.category || null;
      const productStock = row.products?.stock || 0;
      const productDescription = row.custom_description || row.products?.description || '';
      const productDiscount = row.custom_discount !== null && row.custom_discount !== undefined
        ? row.custom_discount
        : row.products?.discount || 0;
        
      return {
        id: row.id,
        product_id: row.product_id,
        priority: row.priority ?? 1,
        active: row.active ?? true,
        starts_at: row.starts_at ?? null,
        ends_at: row.ends_at ?? null,
        created_at: row.created_at,
        custom_name: row.custom_name || null,
        custom_description: row.custom_description || null,
        custom_price: row.custom_price,
        custom_image_url: row.custom_image_url || null,
        custom_discount: row.custom_discount,
        product_name: productName,
        product_image_url: productImage,
        product_price: productPrice,
        product_category: productCategory,
        product_stock: productStock,
        product_description: productDescription,
        product_discount: productDiscount,
      };
    });
  },

  async create(payload: { 
    product_id: string; 
    priority?: number; 
    active?: boolean; 
    starts_at?: string | null; 
    ends_at?: string | null;
    custom_name?: string | null;
    custom_description?: string | null;
    custom_price?: number | null;
    custom_image_url?: string | null;
    custom_discount?: number | null;
  }): Promise<DealOfWeek> {
    const { data, error } = await supabase
      .from('deals_of_week')
      .insert([{
        product_id: payload.product_id,
        priority: payload.priority ?? 1,
        active: payload.active ?? true,
        starts_at: payload.starts_at ?? null,
        ends_at: payload.ends_at ?? null,
        custom_name: payload.custom_name || null,
        custom_description: payload.custom_description || null,
        custom_price: payload.custom_price,
        custom_image_url: payload.custom_image_url || null,
        custom_discount: payload.custom_discount,
      }])
      .select()
      .single();
    if (error) throw error;
    return data as DealOfWeek;
  },

  async update(id: string, updates: Partial<DealOfWeek>): Promise<DealOfWeek> {
    const { data, error } = await supabase
      .from('deals_of_week')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as DealOfWeek;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('deals_of_week')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async reorder(idPriorityPairs: { id: string; priority: number }[]): Promise<void> {
    // Batch update priorities using upsert on id
    const rows = idPriorityPairs.map(p => ({ id: p.id, priority: p.priority }));
    const { error } = await supabase
      .from('deals_of_week')
      .upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  },
};