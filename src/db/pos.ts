import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface Pos {
  id: string;
  created_at: string;
  place_id: string;
  type: string;
  last_activate_at: string;
  name: string;
}

export const getPosById = async (
  client: SupabaseClient,
  id: string
): Promise<PostgrestSingleResponse<Pos | null>> => {
  return client
    .from('pos')
    .select('*')
    .eq('id', id)
    .maybeSingle();
};


export const getPosByPlaceId = async (
  client: SupabaseClient,
  place_id: number
): Promise<PostgrestSingleResponse<Pos[] | null>> => {
  return client
    .from('pos')
    .select('*')
    .eq('place_id', place_id);
};
