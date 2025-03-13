import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface Burn {
  id: number;
  created_at: string;
}

export const createBurn = async (
  client: SupabaseClient
): Promise<PostgrestSingleResponse<Burn>> => {
  return await client.from('payout_burn').insert({}).select().single();
};
