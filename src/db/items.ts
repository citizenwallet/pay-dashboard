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

export const getFirstTwoItems = async (
  client: SupabaseClient,
  placeId: number
): Promise<PostgrestResponse<Item>> => {
  return client
    .from('pos_items')
    .select('*')
    .eq('place_id', placeId)
    .order('order', { ascending: true })
    .limit(2);
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
  const LARGE_INCREMENT = 1000; // Use large increments
  const MIN_ORDER = 0; // Never go below 0

  // If no previous item, place before next item but never negative
  if (prevOrder === null) {
    if (nextOrder !== null) {
      // If next item is too close to 0, use minimum order
      if (nextOrder <= MIN_ORDER + 1) {
        return MIN_ORDER;
      }
      return Math.max(MIN_ORDER, nextOrder - LARGE_INCREMENT);
    }
    return MIN_ORDER; // Default to 0 if no items exist
  }

  // If no next item, place after previous item
  if (nextOrder === null) {
    return prevOrder + LARGE_INCREMENT;
  }

  // Place between the two items
  const midPoint = (nextOrder + prevOrder) / 2;

  // If the gap is too small, trigger rebalancing
  if (Math.abs(nextOrder - prevOrder) < 0.001) {
    // Return a temporary order and trigger rebalancing later
    return prevOrder + 0.0001;
  }

  return midPoint;
};

export const rebalanceAllItems = async (
  client: SupabaseClient,
  placeId: number
): Promise<void> => {
  const INTERVAL = 1000; // Space items 1000 units apart
  const START_ORDER = 1000; // Start at 1000

  // Get all items ordered by current order
  const { data: items } = await getItemsForPlace(client, placeId);

  if (!items || items.length === 0) return;

  // Update each item with new clean order values
  for (let i = 0; i < items.length; i++) {
    const newOrder = START_ORDER + i * INTERVAL;
    await updateItemOrder(client, items[i].id, newOrder);
  }

  console.log(`Rebalanced ${items.length} items for place ${placeId}`);
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
  placeId: number,
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

  // Check if we need rebalancing (order too small or negative)
  if (
    newOrder < 0 ||
    (prevOrder !== null &&
      nextOrder !== null &&
      Math.abs(nextOrder - prevOrder) < 0.001)
  ) {
    await rebalanceAllItems(client, placeId);

    // Recalculate after rebalancing
    // Get fresh order values after rebalancing
    if (prevItemId !== null) {
      const { data: prevItem } = await client
        .from('pos_items')
        .select('order')
        .eq('id', prevItemId)
        .single();
      if (prevItem) prevOrder = prevItem.order;
    }

    if (nextItemId !== null) {
      const { data: nextItem } = await client
        .from('pos_items')
        .select('order')
        .eq('id', nextItemId)
        .single();
      if (nextItem) nextOrder = nextItem.order;
    }

    const rebalancedOrder = calculateOrderBetween(prevOrder, nextOrder);
    return updateItemOrder(client, itemId, rebalancedOrder);
  }

  if (prevItemId === null && nextItemId !== null) {
    const { data: items } = await getFirstTwoItems(client, placeId);
    if (items && items.length === 2) {
      const previousItemNewOrder = calculateOrderBetween(
        newOrder,
        items[1].order
      );

      await updateItemOrder(client, nextItemId, previousItemNewOrder);
    }
  }

  // Update the item with the new order
  return updateItemOrder(client, itemId, newOrder);
};
