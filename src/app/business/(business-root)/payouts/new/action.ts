'use server';
import { getServiceRoleClient } from '@/db';
import { getOrdersNotPayoutBy } from '@/db/orders';
import { getAllPlaces } from '@/db/places';

export async function getAllPlacesAction() {
  const client = getServiceRoleClient();
  const places = await getAllPlaces(client);
  return places.data;
}

export async function getOrdersAction(
  placeId: number,
  customStartDate?: string,
  customEndDate?: string
) {
  const client = getServiceRoleClient();
  const orderResponse = await getOrdersNotPayoutBy(
    client,
    placeId,
    'custom',
    customStartDate,
    customEndDate
  );
  return orderResponse;
}
