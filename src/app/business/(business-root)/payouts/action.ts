'use server';
import { getServiceRoleClient } from '@/db';
import { getBusinessById } from '@/db/business';
import { getPayouts, Payout } from '@/db/payouts';
import { getPlaceById } from '@/db/places';

export async function getAllPayoutAction() {
  const client = getServiceRoleClient();
  const payoutResponse = await getPayouts(client);

  const payouts: Payout[] = payoutResponse.data ?? [];

  for (const payout of payouts) {
    const placeData = await getPlaceById(client, Number(payout.place_id));
    payout.place_id = placeData.data?.name ?? '';

    const businessData = await getBusinessById(
      client,
      Number(payout.business_id)
    );
    payout.business_id = businessData.data?.name ?? '';
  }
  return payouts;
}
