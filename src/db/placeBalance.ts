import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

export interface PlaceBalance {
  token: string;
  place_id: number;
  updated_at: string;
  balance: number;
}

export interface BalanceWithPlace extends PlaceBalance {
  place: {
    id: number;
    name: string;
    payouts: { id: number; created_at: string }[];
    business: { name: string };
  };
}

export const upsertPlaceBalance = async (
  client: SupabaseClient,
  placeBalance: PlaceBalance
) => {
  return await client
    .from('places_balances')
    .upsert(placeBalance, { onConflict: 'token, place_id' });
};

export const getAllBalancesForToken = async (
  client: SupabaseClient,
  token: string,
  offset: number = 0,
  limit: number = 15
): Promise<{ data: BalanceWithPlace[]; count: number }> => {
  let query = client
    .from('places_balances')
    .select(
      `*,
      place:place_id(id,name,business:businesses!business_id(name), payouts:payouts!place_id(id,created_at))
      `,
      { count: 'exact' }
    )
    .eq('token', token)
    .gt('balance', 0);

  // Add sorting - order by balance descending
  query = query.order('balance', {
    ascending: false
  });

  const { data, count } = await query.range(offset, offset + limit - 1);

  return {
    data: data ?? [],
    count: count ?? 0
  };
};
