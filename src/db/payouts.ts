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
  fees: number;
  place_id: string;
  business_id: string;
  burnDate: string | null;
  transferDate: string | null;
}

export interface PayoutWithBurnAndTransfer extends Payout {
  payout_burn: {
    created_at: string;
  } | null;
  payout_transfer: {
    created_at: string;
  } | null;
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
      users!inner(email),
      places!inner(name), 
      businesses!inner(name),
      payout_burn(created_at), 
      payout_transfer(created_at)`
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
      users!inner(email),
      places!inner(name), 
      businesses!inner(name), 
      payout_burn(created_at), 
      payout_transfer(created_at)`
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
): Promise<PostgrestSingleResponse<PayoutWithBurnAndTransfer[]>> => {
  return await client
    .from('payouts')
    .select(
      `*,payout_burn(created_at), 
      payout_transfer(created_at)`
    )
    .eq('place_id', placeId)
    .order('to', { ascending: false });
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

export const totalPayoutAmountAndCount = async (
  client: SupabaseClient,
  payoutId: string
) => {
  const data = await client
    .from('orders')
    .select()
    .eq('payout_id', payoutId)
    .in('status', [
      'paid',
      'needs_minting',
      'correction',
      'refunded',
      'refund'
    ]);
  const totalAmount = data.data?.reduce(
    (acc, order) =>
      acc +
      (order.status === 'correction' || order.status === 'refund'
        ? order.total * -1
        : order.total),
    0
  );
  const totalFees = data.data?.reduce(
    (acc, order) =>
      acc + (order.status === 'correction' ? order.fees * -1 : order.fees),
    0
  );

  const totalNet = totalAmount - totalFees;
  const count = data.data?.length;
  return { totalAmount, totalFees, totalNet, count };
};

export const updatePayoutTotal = async (
  client: SupabaseClient,
  payoutId: string,
  total: number,
  fees: number
): Promise<PostgrestSingleResponse<Payout>> => {
  return await client
    .from('payouts')
    .update({ total: total, fees: fees })
    .eq('id', payoutId)
    .select()
    .single();
};

export const getPendingPayouts = async (
  client: SupabaseClient,
  offset: number,
  limit: number,
  search: string
) => {
  return await client
    .from('places')
    .select('*, businesses(name), payouts(id, created_at)', { count: 'exact' })
    .ilike('name', `%${search}%`)
    .range(offset, offset + limit - 1);
};
