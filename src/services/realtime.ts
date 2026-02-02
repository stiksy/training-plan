import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'

/**
 * Subscribe to real-time changes on a specific table
 * @param table - The table name to subscribe to
 * @param callback - Function to call when changes occur
 * @returns RealtimeChannel subscription
 */
export function subscribeToTable(
  table: string,
  callback: (payload: any) => void
): RealtimeChannel {
  return supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      callback
    )
    .subscribe()
}

/**
 * Unsubscribe from a real-time channel
 * @param channel - The channel to unsubscribe from
 */
export async function unsubscribeFromChannel(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel)
}
