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
): Promise<PostgrestResponse<Place | null>> => {
  return client.from('places').select('*').eq('business_id', businessId);
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
): Promise<
  Pick<Place, 'id' | 'name' | 'slug' | 'image' | 'accounts' | 'description'>[]
> => {
  const placesQuery = client
    .from('places')
    .select('id, name, slug, image, accounts ,description')
    .order('id', { ascending: true });

  const { data, error } = await placesQuery;

  if (error) {
    throw error;
  }

  return data;
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
        users!inner (
          id
        )
      )
    `
    )
    .eq('id', placeId)
    .eq('businesses.users.id', userId)
    .maybeSingle();

  console.log('data', data);
  console.log('error', error);

  if (error) {
    throw error;
  }

  return data !== null;
};
