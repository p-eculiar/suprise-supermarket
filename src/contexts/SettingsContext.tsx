import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtime } from '../hooks/useRealtime';
import toast from '../components/common/Toast';

interface Settings {
  platformFeePercentage: number;
  taxRate: number;
  minimumOrder: number;
  shippingFee: number;
  freeShippingThreshold: number;
  siteName: string;
  supportEmail: string;
  currency: string;
  timezone: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  formatCurrency: (amount: number, currencyCode?: string) => string;
}

const defaultSettings: Settings = {
  platformFeePercentage: 2.5,
  taxRate: 7.5,
  minimumOrder: 1000.00,
  shippingFee: 500.00,
  freeShippingThreshold: 50000.00,
  siteName: 'Suprise Supermarket',
  supportEmail: 'support@suprisesuper.com',
  currency: 'NGN',
  timezone: 'Africa/Lagos'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Make sure we're getting the correct row by ID
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      console.log('Settings data loaded:', data);
      console.log('Settings error:', error);
      
      if (error) {
        // Handle "no rows" error by trying to create default settings
        if (error.code === 'PGRST116' || error.message?.includes('Results contain 0 rows') || error.details?.includes('The result contains 0 rows')) {
          console.log('No settings found, attempting to create default settings...');
          // Try to create default settings
          const defaultSettingsData = {
            id: '00000000-0000-0000-0000-000000000001',
            platform_fee_percentage: 2.5,
            tax_rate: 7.5,
            minimum_order: 1000.00,
            shipping_fee: 500.00,
            free_shipping_threshold: 50000.00,
            site_name: 'Suprise Supermarket',
            support_email: 'support@suprisesuper.com',
            currency: 'NGN',
            timezone: 'Africa/Lagos'
          };
          
          const { data: insertedData, error: insertError } = await supabase
            .from('platform_settings')
            .upsert(defaultSettingsData, { onConflict: 'id' })
            .select()
            .single();
          
          if (!insertError && insertedData) {
            console.log('Created default settings:', insertedData);
            setSettings({
              platformFeePercentage: Number(insertedData.platform_fee_percentage ?? 2.5),
              taxRate: Number(insertedData.tax_rate ?? 7.5),
              minimumOrder: Number(insertedData.minimum_order ?? 1000.00),
              shippingFee: Number(insertedData.shipping_fee ?? 500.00),
              freeShippingThreshold: Number(insertedData.free_shipping_threshold ?? 50000.00),
              siteName: insertedData.site_name ?? 'Suprise Supermarket',
              supportEmail: insertedData.support_email && insertedData.support_email.trim() !== '' ? insertedData.support_email : 'support@suprisesuper.com',
              currency: insertedData.currency ?? 'NGN',
              timezone: insertedData.timezone ?? 'Africa/Lagos',
            });
          } else {
            console.log('Failed to create default settings, using defaults...');
            setSettings({
              platformFeePercentage: 2.5,
              taxRate: 7.5,
              minimumOrder: 1000.00,
              shippingFee: 500.00,
              freeShippingThreshold: 50000.00,
              siteName: 'Suprise Supermarket',
              supportEmail: 'support@suprisesuper.com',
              currency: 'NGN',
              timezone: 'Africa/Lagos'
            });
          }
        } 
        // Handle "table not found" error by using default settings
        else if (error.message?.includes('could not find the table') || error.message?.includes('platform_settings')) {
          console.log('Platform settings table not found, using default settings...');
          setSettings({
            platformFeePercentage: 2.5,
            taxRate: 7.5,
            minimumOrder: 1000.00,
            shippingFee: 500.00,
            freeShippingThreshold: 50000.00,
            siteName: 'Suprise Supermarket',
            supportEmail: 'support@suprisesuper.com',
            currency: 'NGN',
            timezone: 'Africa/Lagos'
          });
        } else {
          // For other errors, throw to show error message
          throw new Error(error.message || 'Unknown error occurred');
        }
      } else if (data) {
        console.log('Processing settings data:', data);
        setSettings({
          platformFeePercentage: Number(data.platform_fee_percentage ?? 2.5),
          taxRate: Number(data.tax_rate ?? 7.5),
          minimumOrder: Number(data.minimum_order ?? 1000.00),
          shippingFee: Number(data.shipping_fee ?? 500.00),
          freeShippingThreshold: Number(data.free_shipping_threshold ?? 50000.00),
          siteName: data.site_name ?? 'Suprise Supermarket',
          supportEmail: data.support_email && data.support_email.trim() !== '' ? data.support_email : 'support@suprisesuper.com',
          currency: data.currency ?? 'NGN',
          timezone: data.timezone ?? 'Africa/Lagos',
        });
      }
    } catch (error: any) {
      console.error('Failed to load settings', error);
      // Only show error toast for actual errors, not missing data or missing table
      if (!error.message?.includes('Results contain 0 rows') && 
          !error.message?.includes('PGRST116') && 
          !error.message?.includes('could not find the table') && 
          !error.message?.includes('platform_settings')) {
        toast.error(`Failed to load settings: ${error.message || 'Please try again.'}`);
      }
      // Use default settings even if there's an error
      setSettings({
        platformFeePercentage: 2.5,
        taxRate: 7.5,
        minimumOrder: 1000.00,
        shippingFee: 500.00,
        freeShippingThreshold: 50000.00,
        siteName: 'Suprise Supermarket',
        supportEmail: 'support@suprisesuper.com',
        currency: 'NGN',
        timezone: 'Africa/Lagos'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Format currency based on settings
  const formatCurrency = (amount: number, currencyCode?: string) => {
    const currency = currencyCode || settings.currency || 'NGN';
    const locale = currency === 'NGN' ? 'en-NG' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Realtime: pick up settings changes made elsewhere
  useRealtime<any>({
    table: 'platform_settings',
    events: ['UPDATE'],
    filter: { column: 'id', value: '00000000-0000-0000-0000-000000000001' }, // Add filter to only listen for updates to our settings row
    onEvent: async (payload) => {
      try {
        console.log('Realtime settings update payload:', payload);
        // Make sure we're getting the correct row by ID
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .single();
        console.log('Realtime settings data:', data);
        console.log('Realtime settings error:', error);
        if (!error && data) {
          setSettings({
            platformFeePercentage: Number(data.platform_fee_percentage ?? 2.5),
            taxRate: Number(data.tax_rate ?? 7.5),
            minimumOrder: Number(data.minimum_order ?? 1000.00),
            shippingFee: Number(data.shipping_fee ?? 500.00),
            freeShippingThreshold: Number(data.free_shipping_threshold ?? 50000.00),
            siteName: data.site_name ?? 'Suprise Supermarket',
            supportEmail: data.support_email && data.support_email.trim() !== '' ? data.support_email : 'support@suprisesuper.com',
            currency: data.currency ?? 'NGN',
            timezone: data.timezone ?? 'Africa/Lagos',
          });
          // Only show success toast if it's an actual update from another user
          if (payload.new?.id !== '00000000-0000-0000-0000-000000000001') {
            toast.success('Platform settings updated by another administrator');
          }
        }
      } catch (error: any) {
        console.error('Failed to handle realtime update', error);
        // Don't show error toast for real-time updates to avoid spam
      }
    },
    channelName: 'app-platform-settings',
  });

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};