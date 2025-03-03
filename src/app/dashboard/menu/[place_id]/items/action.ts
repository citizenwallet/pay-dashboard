'use server';

import { getServiceRoleClient } from '@/db';
import {
  deleteItem,
  getItemsForPlace,
  reorderItem,
  updateItemOrder,
  updateItem
} from '@/db/items';

import { isUserLinkedToPlaceAction } from '@/actions/session';
import { getUserIdFromSessionAction } from '@/actions/session';

export async function getItemsAction(place_id: number) {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const items = await getItemsForPlace(client, Number(place_id));
  return items;
}

export async function deletePlaceItemAction(id: number, place_id: number) {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const item = await deleteItem(client, id);
  return item;
}

export async function updateItemOrderInPlaceAction(
  placeId: number,
  itemId: number,
  prevItemId: number | null,
  nextItemId: number | null
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return reorderItem(client, itemId, prevItemId, nextItemId);
}

export async function updateItemNameAction(
  itemId: number,
  placeId: number,
  name: string
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return updateItem(client, itemId, { name });
}

export async function updateItemDescriptionAction(
  itemId: number,
  placeId: number,
  description: string
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return updateItem(client, itemId, { description });
}
