'use server';

import { getUserIdFromSessionAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getLinkedBusinessByUserId } from '@/db/business';
import { getPlaceById, getPlacesByBusinessId } from '@/db/places';
import { getLastplace } from '@/db/users';

export async function getPlaceAllAction() {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const business = await getLinkedBusinessByUserId(client, userId);
  const places = await getPlacesByBusinessId(
    client,
    business.data?.linked_business_id
  );
  return places.data;
}

export async function getPlaceAction(): Promise<{
  lastId: number;
  busId: number;
}> {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const data = await getLastplace(client, userId);
  let lastId: number = data.data?.last_place;
  if (!lastId) {
    const places = await getPlaceAllAction();
    if (places && places.length > 0) {
      lastId = places[0].id;
    }
  }

  const { data: place } = await getPlaceById(client, lastId);

  if (!place) {
    return { lastId: 0, busId: 0 };
  }
  const busId: number = place?.business_id;

  return { lastId, busId };
}
