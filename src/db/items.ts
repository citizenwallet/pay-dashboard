import 'server-only';

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient
} from '@supabase/supabase-js';
import { getUserBusinessId } from './users';
import { Place } from './places';

export interface Item {
  order: number;
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
  placeId: number,
  userId: number
): Promise<PostgrestResponse<Item>> => {
  const hasAccess:boolean = await checkItemAccess(client, placeId, userId);
  if (!hasAccess) {
    throw new Error('User does not have access to this place');
  }
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
  image: File,
  price: number,
  vat: number,
  category: string,
  place_id: number,
  user_id: number
) => {
  const hasAccess = await checkItemAccess(client, place_id, user_id);
  if (!hasAccess) {
    throw new Error('User does not have access to this place');
  }
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
  id: number,
  place_id: number,
  user_id: number
): Promise<PostgrestSingleResponse<Item>> => {
  
  const hasAccess = await checkItemAccess(client, place_id, user_id);
  if (!hasAccess) {
    throw new Error('User does not have access to this place');
  }
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
): Promise<PostgrestSingleResponse<Item>> => {

  if (!item.place_id) {
    throw new Error('Place ID is required');
  }

  const hasAccess = await checkItemAccess(client, item.place_id, user_id);
  if (!hasAccess) {
    throw new Error('User does not have access to this place');
  }

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

export const checkItemAccess = async (
  client: SupabaseClient,
  placeId: number,
  userId: number
): Promise<boolean> => {

  const data = await client.from('users').select('linked_business_id').eq('id', userId);
  const business_id = data.data?.[0]?.linked_business_id;
  const placesQuery = client.from('places').select('*').eq('business_id', business_id);
  const place_ids = (await placesQuery).data?.map((place: Place) => place.id) || [];
  return place_ids.includes(placeId);
};
