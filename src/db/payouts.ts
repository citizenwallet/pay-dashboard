import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface Payout {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  from: string;
  to: string;
  burn: number;
  transfer: number;
  total: number;
  place_id: string;
  business_id: string;
}

export const getPayouts = async (
  client: SupabaseClient
): Promise<PostgrestSingleResponse<Payout[]>> => {
  return await client.from('payouts').select('*');
};
