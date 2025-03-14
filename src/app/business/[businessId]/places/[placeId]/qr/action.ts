'use server';

import { getServiceRoleClient } from '@/db';
import { getPlaceById } from '@/db/places';

export async function getPlaceDataAction(placeId: number) {
  const client = getServiceRoleClient();
  return await getPlaceById(client, placeId);
}
