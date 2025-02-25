import 'server-only';

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient
} from '@supabase/supabase-js';


export interface Item {
  id: number;
  created_at: string;
  place_id: number;
  name: string;
  description: string;
  image?: string;
  price: number;
  vat: number;
  category: string;
}

export const getItemsForPlace = async (
  client: SupabaseClient,
  placeId: number
): Promise<PostgrestResponse<Item>> => {
  return client
    .from('pos_items')
    .select('*')
    .eq('place_id', placeId)
    .order('order', { ascending: true });
};

export const InsertItem = async (
  client: SupabaseClient,
  name: string,
  description: string,
  image: string,
  price: number,
  vat: number,
  category: string,
  place_id: number,
): Promise<PostgrestSingleResponse<Item>> => {
  return client
    .from('pos_items')
    .insert({
      name,
      description,
      image,
      price,
      vat,
      category,
      place_id,
    })
    .select()
    .single();
};


export const DeleteItem = async (
  client: SupabaseClient,
  id: number
): Promise<PostgrestSingleResponse<Item>> => {
  return client
    .from('pos_items')
    .delete()
    .eq('id', id)
    .select()
    .single();
};

export const getItemById = async (
  client: SupabaseClient,
  place_id: number,
  item_id: number
): Promise<PostgrestSingleResponse<Item>> => {
  return client
    .from('pos_items')
    .select('*')
    .eq('place_id', place_id)
    .eq('id', item_id)
    .single();
};

export const UpdateItem = async (
  client: SupabaseClient,
  id: number,
  data: Partial<Item>
): Promise<PostgrestSingleResponse<Item>> => {
  return client
    .from('pos_items')
    .update(data)
    .eq('id', id)
    .select()
    .single();
};

