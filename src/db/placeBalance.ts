import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

export interface PlaceBalance {
  token: string;
  place_id: number;
  balance: number;
}

export const upsertPlaceBalance = async (
  client: SupabaseClient,
  placeBalance: PlaceBalance
) => {
  return await client
    .from('places_balances')
    .upsert(placeBalance, { onConflict: 'token, place_id' });
};
