'use server';

import { getServiceRoleClient } from '@/db';
import { deleteItem, getItemsForPlace, updateItemOrder } from '@/db/items';

import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { checkUserPlaceAccess } from '@/db/places';
import { isUserLinkedToPlaceAction } from '@/actions/session';
import { getUserIdFromSessionAction } from '@/actions/session';

const { auth } = NextAuth(authConfig);

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
  place_id: number,
  positions: Record<number, { from: number; to: number }>
) {
  const client = getServiceRoleClient();
  const user = await auth();
  const res = await checkUserPlaceAccess(
    client,
    Number(user?.user?.id),
    Number(place_id)
  );
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  for (const [id, { from, to }] of Object.entries(positions)) {
    const item = await updateItemOrder(client, place_id, {
      id: Number(id),
      order: to
    });
  }
  return { success: true };
}
