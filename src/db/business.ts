import 'server-only';

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient
} from '@supabase/supabase-js';

export interface Business {
  id: number;
  created_at: string;
  name: string | null;
  status: string | null;
  vat_number: string | null;
  business_status: string | null;
  invite_code: string | null;
  email: string | null;
  phone: string | null;
  iban_number: string | null;
  address_legal: string | null;
  legal_name: string | null;
  accepted_membership_agreement: string | null;
  accepted_terms_and_conditions: string | null;
}

export interface BusinessSearch
  extends Pick<Business, 'id' | 'name' | 'vat_number'> {
  places: {
    balances: {
      balance: number;
      token: string;
    }[];
  }[];
  business_users: {
    user_id: number;
    role: string;
  }[];
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

export const getBusinessesBySearch = async (
  client: SupabaseClient,
  limit: number = 15,
  offset: number = 0,
  search: string = '',
  userId: number | null = null
): Promise<PostgrestResponse<BusinessSearch>> => {
  let query = client.from('businesses').select(
    `id,
      name,
      vat_number,
      places:places!business_id(balances:places_balances!place_id(balance,token)),
      business_users:business_users!business_id!inner(user_id,role)`,
    {
      count: 'exact'
    }
  );

  if (userId) {
    query = query.eq('business_users.user_id', userId);
  }

  if (search && search.trim() !== '') {
    query = query.or(`name.ilike.%${search}%,vat_number.ilike.%${search}%`);
  }

  return query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);
};
