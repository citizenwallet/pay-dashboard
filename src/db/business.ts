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
  iban_number: string | null;
  address_legal: string | null;
  legal_name: string | null;
  accepted_membership_agreement: string | null;
  accepted_terms_and_conditions: string | null;
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

export const getLinkedBusinessByUserId = async (
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

export const getAllBusiness = async (
  client: SupabaseClient
): Promise<PostgrestSingleResponse<Business[]>> => {
  return client.from('businesses').select('*');
};

export const checkUserAccessBusiness = async (
  client: SupabaseClient,
  userId: number,
  businessId: number
): Promise<boolean> => {
  const { data, error } = await client
    .from('business_users')
    .select('*')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .single();
  return data ? true : false;
};
export const updateBusiness = async (
  client: SupabaseClient,
  id: number,
  data: Partial<Business>
): Promise<PostgrestSingleResponse<Business>> => {
  return client.from('businesses').update(data).eq('id', id).select().single();
};

export const getBusinessByVatNumber = async (
  client: SupabaseClient,
  vatNumber: string
): Promise<PostgrestSingleResponse<Business>> => {
  return client
    .from('businesses')
    .select('*')
    .eq('vat_number', vatNumber)
    .single();
};
