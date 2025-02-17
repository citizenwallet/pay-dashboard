'use server';

import { getUserIdFromSession, isUserLinkedToPlace } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getOrdersByPlace } from '@/db/orders';

export async function fetchOrdersAction(
  placeId: number,
  limit?: number,
  offset?: number
) {
  const userId = await getUserIdFromSession();

  const client = getServiceRoleClient();

  const isLinked = await isUserLinkedToPlace(client, userId, placeId);
  if (!isLinked) {
    throw new Error('User is not linked to this place');
  }

  const orders = await getOrdersByPlace(client, placeId, limit, offset);

  return orders;
}
