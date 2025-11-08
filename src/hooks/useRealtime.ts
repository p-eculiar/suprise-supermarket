import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface UseRealtimeOptions<T> {
  table: string;
  events?: PostgresEvent[];
  filter?: {
    column: string;
    value: string | number | boolean;
  };
  onEvent: (payload: { eventType: PostgresEvent; new: T | null; old: T | null }) => void;
  channelName?: string;
}

export function useRealtime<T = any>({ table, events = ['INSERT', 'UPDATE', 'DELETE'], filter, onEvent, channelName }: UseRealtimeOptions<T>) {
  const onEventRef = useRef(onEvent);
  
  // Keep the ref updated with the latest onEvent function
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const channel = supabase
      .channel(channelName || `${table}-realtime-${Date.now()}`);

    events.forEach((event) => {
      channel.on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter: `${filter.column}=eq.${filter.value}` } : {}),
        } as any,
        (payload: any) => {
          // Use the ref to ensure we're calling the latest onEvent function
          onEventRef.current({ 
            eventType: event, 
            new: (payload.new as T) || null, 
            old: (payload.old as T) || null 
          });
        }
      );
    });

    // Properly handle the subscription promise
    channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to ${table} real-time updates on channel ${channelName || `${table}-realtime`}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to ${table} real-time updates:`, err);
      } else if (status === 'CLOSED') {
        console.log(`Closed subscription to ${table} real-time updates on channel ${channelName || `${table}-realtime`}`);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  // Only re-subscribe when table or channelName changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, channelName, filter]);
}