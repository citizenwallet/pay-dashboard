import 'server-only';

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  // QueryData,
  SupabaseClient
} from '@supabase/supabase-js';

export interface Place {
  id: number;
  created_at: string;
  business_id: number;
  slug: string;
  name: string;
  accounts: string[];
  invite_code: string | null;
  terminal_id: number | null;
  image: string | null;
  description: string | null;
  display: 'amount' | 'menu' | 'topup';
}

export type NewPlace = Omit<
  Place,
  'id' | 'created_at' | 'terminal_id' | 'description'
>;

export interface PlaceSearchResult {
  id: number;
  name: string;
  slug: string;
}

export const getPlaceByUsername = async (
  client: SupabaseClient,
  username: string
): Promise<PostgrestSingleResponse<Place | null>> => {
  return client.from('places').select('*').eq('slug', username).maybeSingle();
};

export const getPlacesByBusinessId = async (
  client: SupabaseClient,
  businessId: number
): Promise<PostgrestResponse<Place>> => {
  return client
    .from('places')
    .select('*')
    .eq('business_id', businessId)
    .order('id', { ascending: true });
};

export const getPlaceByTerminalId = async (
  client: SupabaseClient,
  terminalId: number
): Promise<PostgrestSingleResponse<Place | null>> => {
  return client
    .from('places')
    .select('*')
    .eq('terminal_id', terminalId)
    .maybeSingle();
};

export const getPlacesByAccount = async (
  client: SupabaseClient,
  account: string
): Promise<PostgrestResponse<Place>> => {
  return client
    .from('places')
    .select('*')
    .contains('accounts', JSON.stringify([account]));
};

export const getPlaceById = async (
  client: SupabaseClient,
  id: number
): Promise<PostgrestSingleResponse<Place | null>> => {
  return client.from('places').select('*').eq('id', id).maybeSingle();
};

export const getPlaceByInviteCode = async (
  client: SupabaseClient,
  inviteCode: string
): Promise<PostgrestSingleResponse<Place | null>> => {
  return client
    .from('places')
    .select('*')
    .eq('invite_code', inviteCode)
    .maybeSingle();
};

export const searchPlaces = async (
  client: SupabaseClient,
  query: string
): Promise<PostgrestResponse<PlaceSearchResult>> => {
  return client
    .from('places')
    .select('id, name, slug')
    .ilike('name', `%${query}%`);
};

export const createPlace = async (
  client: SupabaseClient,
  place: NewPlace
): Promise<PostgrestSingleResponse<Place>> => {
  return client.from('places').insert(place).select().single();
};

// TODO: add pagination
export const getAllPlaces = async (
  client: SupabaseClient
): Promise<PostgrestResponse<Place>> => {
  const placesQuery = client
    .from('places')
    .select('*')
    .order('id', { ascending: true });

  return placesQuery;
};

export const checkUserPlaceAccess = async (
  client: SupabaseClient,
  userId: number,
  placeId: number
): Promise<boolean> => {
  const { data, error } = await client
    .from('places')
    .select(
      `
      id,
      business_id,
      businesses!inner (
        users!business_users!inner (
          id
        )
      )
    `
    )
    .eq('id', placeId)
    .eq('businesses.users.id', userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data !== null;
};

export const getAllPlacesByUserId = async (
  client: SupabaseClient,
  userId: number
): Promise<PostgrestResponse<Place>> => {
  const data = await client
    .from('users')
    .select('linked_business_id')
    .eq('id', userId);
  const business_id: number | null = data.data?.[0]?.linked_business_id;

  if (!business_id) {
    return { data: [], error: null, count: 0, status: 200, statusText: 'OK' };
  }

  const placesQuery = client
    .from('places')
    .select('*')
    .eq('business_id', business_id);
  return placesQuery;
};

export const updatePlaceDisplay = async (
  client: SupabaseClient,
  placeId: number,
  display: 'amount' | 'menu' | 'topup'
) => {
  return client.from('places').update({ display }).eq('id', placeId);
};

export const getPlaceDisplay = async (
  client: SupabaseClient,
  placeId: number
) => {
  return client
    .from('places')
    .select('display')
    .eq('id', placeId)
    .maybeSingle();
};
