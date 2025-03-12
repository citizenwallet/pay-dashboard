'use server';

import { getUserIdFromSessionAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getBusinessIdByUserId } from '@/db/business';
import { getLastPlaceAction } from './business/(business-details)/[businessId]/action';
import { getPlaceById, getPlacesByBusinessId } from '@/db/places';
import { getLastplace } from '@/db/users';

export async function getPlaceAllAction() {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const businessid = await getBusinessIdByUserId(client, userId);
  const places = await getPlacesByBusinessId(
    client,
    businessid.data?.linked_business_id
  );
  return places.data;
}

export async function getPlaceAction(): Promise<{
  lastId: number;
  busid: number;
}> {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const businessid = await getBusinessIdByUserId(client, userId);
  const busid: number = businessid.data?.linked_business_id; // output

  const data = await getLastplace(client, userId);
  let lastId: number = data.data?.last_place;
  if (!lastId) {
    const places = await getPlaceAllAction();
    if (places && places.length > 0) {
      lastId = places[0].id;
    }
  }

  return { lastId, busid };
}
