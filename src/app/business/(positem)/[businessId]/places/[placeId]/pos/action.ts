'use server';

import { getServiceRoleClient } from '@/db';
import { isUserLinkedToPlaceAction } from '@/actions/session';
import { getUserIdFromSessionAction } from '@/actions/session';
import { getPosByPlaceId } from '@/db/pos';



export async function getPosAction(place_id: number) {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const items = await getPosByPlaceId(client, Number(place_id));
  return items;
}
