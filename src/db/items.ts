import 'server-only';

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient
} from '@supabase/supabase-js';

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
  hidden: boolean;
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

export const insertItem = async (
  client: SupabaseClient,
  name: string,
  description: string,
  image: string,
  price: number,
  vat: number,
  category: string,
  place_id: number
) => {
  return client
    .from('pos_items')
    .insert({
      name,
      description,
      image: image,
      price,
      vat,
      category,
      place_id
    })
    .select()
    .single();
};

export const deleteItem = async (
  client: SupabaseClient,
  id: number
): Promise<PostgrestSingleResponse<Item>> => {
  return client.from('pos_items').delete().eq('id', id).select().single();
};

export const getItemById = async (
  client: SupabaseClient,
  placeId: number,
  itemId: number
): Promise<PostgrestSingleResponse<Item>> => {
  return client
    .from('pos_items')
    .select('*')
    .eq('place_id', placeId)
    .eq('id', itemId)
    .single();
};

export const updateItem = async (
  client: SupabaseClient,
  id: number,
  item: Partial<Item>
): Promise<PostgrestSingleResponse<Item>> => {
  return client.from('pos_items').update(item).eq('id', id).select().single();
};

export const updateItemOrder = async (
  client: SupabaseClient,
  id: number,
  order: number
): Promise<PostgrestSingleResponse<Item>> => {
  return client
    .from('pos_items')
    .update({ order: order })
    .eq('id', id)
    .select()
    .single();
};

/**
 * Calculates a new order value between two existing order values
 * @param prevOrder Order value of the item before the target position
 * @param nextOrder Order value of the item after the target position
 * @returns A new order value that falls between prevOrder and nextOrder
 */
export const calculateOrderBetween = (
  prevOrder: number | null,
  nextOrder: number | null
): number => {
  // If no previous item, place at half of next item's order or 0 if no next item
  if (prevOrder === null) {
    return nextOrder !== null ? nextOrder / 2 : 0;
  }

  // If no next item, place after previous item
  if (nextOrder === null) {
    return prevOrder + 1;
  }

  // Place between the two items
  return (nextOrder + prevOrder) / 2;
};

/**
 * Updates an item's order by placing it between two other items
 * @param client Supabase client
 * @param placeId Place ID
 * @param itemId Item ID to update
 * @param prevItemId ID of the item before the target position (null if first)
 * @param nextItemId ID of the item after the target position (null if last)
 */
export const reorderItem = async (
  client: SupabaseClient,
  itemId: number,
  prevItemId: number | null,
  nextItemId: number | null
): Promise<PostgrestSingleResponse<Item>> => {
  // Get the order values of the surrounding items
  let prevOrder: number | null = null;
  let nextOrder: number | null = null;

  if (prevItemId !== null) {
    const { data: prevItem } = await client
      .from('pos_items')
      .select('order')
      .eq('id', prevItemId)
      .single();

    if (prevItem) {
      prevOrder = prevItem.order;
    }
  }

  if (nextItemId !== null) {
    const { data: nextItem } = await client
      .from('pos_items')
      .select('order')
      .eq('id', nextItemId)
      .single();

    if (nextItem) {
      nextOrder = nextItem.order;
    }
  }

  // Calculate the new order value
  const newOrder = calculateOrderBetween(prevOrder, nextOrder);

  // Update the item with the new order
  return updateItemOrder(client, itemId, newOrder);
};
