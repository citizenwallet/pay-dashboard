import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface BusinessUser {
  user_id: number;
  business_id: number;
  role: string;
}

export const createBusinessUser = async (
  client: SupabaseClient,
  user_id: number,
  business_id: number,
  role: string
): Promise<PostgrestSingleResponse<BusinessUser>> => {
  return client
    .from('business_users')
    .insert({ user_id, business_id, role })
    .select()
    .single();
};
