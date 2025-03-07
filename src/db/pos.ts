import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface Pos {
  id: string;
  created_at: string;
  place_id: string;
  type: string;
  last_activate_at: string;
  name: string;
}

export const getPosById = async (
  client: SupabaseClient,
  id: string
): Promise<PostgrestSingleResponse<Pos | null>> => {
  return client.from('pos').select('*').eq('id', id).maybeSingle();
};

export const getPosByPlaceId = async (
  client: SupabaseClient,
  place_id: number
): Promise<PostgrestSingleResponse<Pos[] | null>> => {
  return client.from('pos').select('*').eq('place_id', place_id);
};

export const createPos = async (
  client: SupabaseClient,
  name: string,
  posId: number,
  placeId: number,
  type: string
): Promise<PostgrestSingleResponse<Pos | null>> => {
  return client
    .from('pos')
    .insert([
      {
        id: posId,
        name,
        place_id: placeId,
        type:type,
        created_at: new Date().toISOString(),
        last_activate_at: new Date().toISOString()
      }
    ])
    .select('*')
    .maybeSingle();
};

export const deletePos = async (
  client: SupabaseClient,
  id: number
): Promise<PostgrestSingleResponse<Pos | null>> => {
  return client.from('pos').delete().eq('id', id).maybeSingle();
};

export const updatePos = async (
  client: SupabaseClient,
  id: number,
  name: string,
  type: string
): Promise<PostgrestSingleResponse<Pos | null>> => {
  return client.from('pos').update({ name, type }).eq('id', id).maybeSingle();
};

