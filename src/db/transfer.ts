import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface Transfer {
  id: number;
  created_at: string;
}

export const createTransfer = async (
  client: SupabaseClient
): Promise<PostgrestSingleResponse<Transfer>> => {
  return await client.from('payout_transfer').insert({}).select().single();
};

export const getTransferById = async (
  client: SupabaseClient,
  id: number
): Promise<PostgrestSingleResponse<Transfer>> => {
  return await client.from('payout_transfer').select().eq('id', id).single();
};
