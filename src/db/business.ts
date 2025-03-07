import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface Business {
  id: number;
  created_at: string;
  name: string | null;
  status: string | null;
  vat_number: string | null;
  business_status: string | null;
  invite_code: string | null;
  account: string | null;
  email: string | null;
  phone: string | null;
}

export type NewBusiness = Omit<Business, 'id' | 'created_at'>;

export const createBusiness = async (
  client: SupabaseClient,
  business: NewBusiness
): Promise<PostgrestSingleResponse<Business>> => {
  return client.from('businesses').insert(business).select().single();
};

export const getBusinessByToken = async (
  client: SupabaseClient,
  token: string
): Promise<PostgrestSingleResponse<Business>> => {
  return client
    .from('businesses')
    .select('*')
    .eq('invite_code', token)
    .single();
};

export const getBusinessIdByUserId = async (
  client: SupabaseClient,
  userid: number
) => {
  return client
    .from('users')
    .select('linked_business_id')
    .eq('id', userid)
    .single();
};

export const getBusinessById = async (
  client: SupabaseClient,
  businessId: number
): Promise<PostgrestSingleResponse<Business>> => {
  return client.from('businesses').select('*').eq('id', businessId).single();
};
