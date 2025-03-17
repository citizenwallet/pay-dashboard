'use server';

import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { checkUserPlaceAccess, getPlaceById } from '@/db/places';

export async function getPlaceDataAction(placeId: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const admin = await isUserAdminAction();

  if (!admin) {
    const hasPlaceAccess = await checkUserPlaceAccess(
      client,
      userId,
      Number(placeId)
    );
    if (!hasPlaceAccess) {
      throw new Error('You do not have access to this place');
    }
  }
  return await getPlaceById(client, placeId);
}
