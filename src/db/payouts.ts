import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface Payout {
  actionDate: string | undefined;
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
  burnDate: string | null;
  transferDate: string | null;
}

export const getPayouts = async (
  client: SupabaseClient,
  limit: number,
  offset: number,
  column?: string,
  order?: string,
  search?: string
) => {
  if (search) {
    return await client
      .from('payouts')
      .select(
        `*, 
      places!inner(name), 
      businesses!inner(name),
      payout_burn!inner(created_at), 
      payout_transfer!inner(created_at)`
      )
      .filter('places.name', 'ilike', `%${search}%`)
      .filter('businesses.name', 'ilike', `%${search}%`)
      .order(column ?? 'id', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);
  }

  return await client
    .from('payouts')
    .select(
      `*, 
      places!inner(name), 
      businesses!inner(name), 
      payout_burn!inner(created_at), 
      payout_transfer!inner(created_at)`
    )
    .order(column ?? 'id', { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);
};

export const getPayoutById = async (
  client: SupabaseClient,
  id: string
): Promise<PostgrestSingleResponse<Payout>> => {
  return await client.from('payouts').select('*').eq('id', id).single();
};

export const createPayouts = async (
  client: SupabaseClient,
  userId: string,
  from: string,
  to: string,
  total: number,
  place_id: string,
  business_id: string
) => {
  return await client
    .from('payouts')
    .insert({
      place_id: place_id,
      user_id: userId,
      from: from,
      to: to,
      total: total,
      business_id: business_id
    })
    .select();
};

export const updatePayoutBurn = async (
  client: SupabaseClient,
  payout_id: string,
  burn_id: number
): Promise<PostgrestSingleResponse<Payout>> => {
  return await client
    .from('payouts')
    .update({ burn: burn_id })
    .eq('id', payout_id)
    .select()
    .single();
};

export const updatePayoutTransfer = async (
  client: SupabaseClient,
  payout_id: string,
  transfer_id: number
): Promise<PostgrestSingleResponse<Payout>> => {
  return await client
    .from('payouts')
    .update({ transfer: transfer_id })
    .eq('id', payout_id)
    .select()
    .single();
};

export const getPayoutsByPlaceId = async (
  client: SupabaseClient,
  placeId: string
): Promise<PostgrestSingleResponse<Payout[]>> => {
  return await client.from('payouts').select('*').eq('place_id', placeId);
};

export const getPayoutBurnId = async (
  client: SupabaseClient,
  payoutId: string
): Promise<PostgrestSingleResponse<Payout>> => {
  return await client
    .from('payouts')
    .select('burn')
    .eq('id', payoutId)
    .single();
};

export const getPayoutTransferId = async (
  client: SupabaseClient,
  payoutId: string
): Promise<PostgrestSingleResponse<Payout>> => {
  return await client
    .from('payouts')
    .select('transfer')
    .eq('id', payoutId)
    .single();
};

export const updatePayoutBurnDate = async (
  client: SupabaseClient,
  payoutBurnId: string,
  burnDate: string
): Promise<PostgrestSingleResponse<Payout>> => {
  return await client
    .from('payout_burn')
    .update({ created_at: burnDate })
    .eq('id', payoutBurnId)
    .select()
    .single();
};

export const updatePayoutTransferDate = async (
  client: SupabaseClient,
  payoutTransferId: string,
  transferDate: string
): Promise<PostgrestSingleResponse<Payout>> => {
  return await client
    .from('payout_transfer')
    .update({ created_at: transferDate })
    .eq('id', payoutTransferId)
    .select()
    .single();
};
