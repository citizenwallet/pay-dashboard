import 'server-only';

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient
} from '@supabase/supabase-js';

export type DisplayMode = 'amount' | 'menu' | 'topup' | 'amountAndMenu';

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
  hidden: boolean;
  archived: boolean;
  display: DisplayMode;
}

export type NewPlace = Omit<Place, 'id' | 'created_at' | 'terminal_id'>;

export interface PlaceSearchResult {
  id: number;
  name: string;
  slug: string;
}

export interface PlaceWithBusiness extends Place {
  business: { name: string };
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

export const getPlacesCountByBusinessId = async (
  client: SupabaseClient,
  businessId: number
): Promise<{ count: number }> => {
  const response = await client
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId);
  return { count: response.count || 0 };
};

export const getPlacesByBusinessIdWithLimit = async (
  client: SupabaseClient,
  businessId: number,
  limit: number = 10,
  offset: number = 0,
  search: string = ''
): Promise<PostgrestResponse<Place[]>> => {
  return client
    .from('places')
    .select('*')
    .eq('business_id', businessId)
    .ilike('name', `%${search}%`)
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1);
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

export const getAllPlaces = async (
  client: SupabaseClient
): Promise<PostgrestResponse<Place>> => {
  const placesQuery = client
    .from('places')
    .select('*')
    .order('id', { ascending: true });

  return placesQuery;
};

export const getAllPlacesWithBusiness = async (
  client: SupabaseClient
): Promise<PostgrestResponse<PlaceWithBusiness>> => {
  return client
    .from('places')
    .select('*,business:businesses!business_id(name)')
    .order('id', { ascending: true });
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

export const uniqueSlugPlace = async (
  client: SupabaseClient,
  slug: string
): Promise<PostgrestSingleResponse<{ data: Place | null; error: any }>> => {
  return await client.from('places').select('id').eq('slug', slug).single();
};

export const handleVisibilityToggleceById = async (
  client: SupabaseClient,
  placeId: number
): Promise<PostgrestSingleResponse<Place | null>> => {
  // get the current hidden status
  const { data: currentPlace, error: fetchError } = await client
    .from('places')
    .select('hidden')
    .eq('id', placeId)
    .maybeSingle();

  if (fetchError || !currentPlace) {
    throw fetchError || new Error('Place not found');
  }

  const newHiddenValue = !currentPlace.hidden;

  return client
    .from('places')
    .update({ hidden: newHiddenValue })
    .eq('id', placeId)
    .maybeSingle();
};

export const handleArchiveToggleById = async (
  client: SupabaseClient,
  placeId: number
): Promise<PostgrestSingleResponse<Place | null>> => {
  // Fetch the current state of the place
  const { data: place, error } = await client
    .from('places')
    .select('archived, hidden')
    .eq('id', placeId)
    .single();

  if (error || !place) {
    throw new Error('Place not found');
  }

  // Toggle the archived and hidden values based on current state
  const newState = {
    archived: place.archived ? false : true,
    hidden: place.hidden ? false : true
  };

  // Update the place with the toggled values
  return client.from('places').update(newState).eq('id', placeId).maybeSingle();
};

export const updatePlaceById = async (
  client: SupabaseClient,
  placeId: number,
  place: Partial<Place>
): Promise<PostgrestSingleResponse<Place | null>> => {
  return client.from('places').update(place).eq('id', placeId).maybeSingle();
};

export const deletePlaceById = async (
  client: SupabaseClient,
  placeId: number
): Promise<PostgrestSingleResponse<Place | null>> => {
  return client.from('places').delete().eq('id', placeId);
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
  display: DisplayMode
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

export const getPlaceBySlug = async (
  client: SupabaseClient,
  slug: string
): Promise<PostgrestSingleResponse<Place | null>> => {
  return client.from('places').select('*').eq('slug', slug).maybeSingle();
};
