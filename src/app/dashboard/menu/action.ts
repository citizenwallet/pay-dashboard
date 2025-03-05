'use server';

import { getServiceRoleClient } from '@/db';
import { getAllPlaces, getAllPlacesByUserId } from '@/db/places';
import { getUserIdFromSessionAction } from '@/actions/session';
import { isAdmin } from '@/db/users';

export async function getAllPlacesDataAction() {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const admin = await isAdmin(client, userId);

  if (admin) {
    const places = await getAllPlaces(client);
    return places;
  }

  const places = await getAllPlacesByUserId(client, userId);

  return places;
}
