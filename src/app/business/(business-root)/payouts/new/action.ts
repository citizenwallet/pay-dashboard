'use server';
import { isUserAdminAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getOrdersNotPayoutBy, updateOrdersPayout } from '@/db/orders';
import { createPayouts } from '@/db/payouts';
import { getAllPlaces, getPlaceById } from '@/db/places';

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

export async function createPayoutAction(
  placeId: number,
  userId: string,
  from: string,
  to: string,
  total: number
) {
  const client = getServiceRoleClient();
  const admin = await isUserAdminAction();
  if (!admin) {
    return { error: 'You are not authorized to create a payout' };
  }
  const place = await getPlaceById(client, placeId);
  const businessId = place.data?.business_id;
  if (!businessId) {
    return { error: 'Business not found' };
  }
  const payoutResponse = await createPayouts(
    client,
    userId,
    from,
    to,
    total,
    placeId.toString(),
    businessId.toString()
  );
  const payoutId = payoutResponse.data?.[0].id;

  const orders = await getOrdersNotPayoutBy(
    client,
    placeId,
    'custom',
    from,
    to
  );
  const orderIds = orders.data?.map((order) => order.id);
  if (orderIds) {
    await updateOrdersPayout(client, payoutId, orderIds);
  }
  return payoutResponse;
}
