import 'server-only';

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient
} from '@supabase/supabase-js';
import { getUserBusinessId } from './users';

export interface Item {
  order: number;
  position: any;
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
  image: File | null,
  price: number,
  vat: number,
  category: string,
  place_id: number,
  user_id: number
) => {
  //get the bussiness id
  const business_id = await getUserBusinessId(client, user_id);
  let url = '';
  if (image) {
    const fileName = `${Date.now()}-${image.name}`;
    const { data, error } = await client.storage
      .from(`uploads/${business_id}/${place_id}`)
      .upload(fileName, image);

    if (error) {
      throw error;
    }
    url = await client.storage
      .from(`uploads/${business_id}/${place_id}`)
      .getPublicUrl(fileName).data.publicUrl;
  }

  return client
    .from('pos_items')
    .insert({
      name,
      description,
      image: url,
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
  return client.from('pos_items').delete().eq('id', id).select().single();
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
  item: Partial<Item>,
  image: File | null,
  user_id: number
) => {

  const business_id = await getUserBusinessId(client, user_id);
  let url = item.image;
  if (image) {
    const fileName = `${Date.now()}-${image.name}`;
    const { data, error } = await client.storage
      .from(`uploads/${business_id}/${item.place_id}`)
      .upload(fileName, image);

    if (error) {
      throw error;
    }
    url = await client.storage
      .from(`uploads/${business_id}/${item.place_id}`)
      .getPublicUrl(fileName).data.publicUrl;
  }
  item.image = url;

  return client.from('pos_items').update(item).eq('id', id).select().single();
};

export const UpdateItemOrder = async (
  client: SupabaseClient,
  place_id: number,
  items: { id: number; order: number }
): Promise<PostgrestSingleResponse<Item>> => {
  return client
    .from('pos_items')
    .update({ order: items.order })
    .eq('place_id', place_id)
    .eq('id', items.id)
    .select()
    .single();
};
