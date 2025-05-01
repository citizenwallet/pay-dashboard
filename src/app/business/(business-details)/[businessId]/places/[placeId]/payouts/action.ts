'use server';

import { getServiceRoleClient } from '@/db';
import { getPayoutsByPlaceId, PayoutWithBurnAndTransfer } from '@/db/payouts';

export const getPayoutsbyPaceIdAction = async (placeId: number) => {
  const client = getServiceRoleClient();
  const payoutResponse = await getPayoutsByPlaceId(client, placeId.toString());
  const payouts: PayoutWithBurnAndTransfer[] = payoutResponse.data ?? [];

  console.log(payouts);

  return payouts;
};
