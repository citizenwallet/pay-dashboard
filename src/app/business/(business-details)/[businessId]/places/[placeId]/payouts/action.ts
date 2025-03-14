'use server';

import { getServiceRoleClient } from '@/db';
import { getBurnById } from '@/db/burn';
import { getPayoutsByPlaceId, Payout } from '@/db/payouts';
import { getTransferById } from '@/db/transfer';

export const getPayoutsbyPaceIdAction = async (placeId: number) => {
  const client = getServiceRoleClient();
  const payoutResponse = await getPayoutsByPlaceId(client, placeId.toString());
  const payouts: Payout[] = payoutResponse.data ?? [];

  //assign burn and transfer name to payout
  for (const payout of payouts) {
    if (payout.burn) {
      const burnData = await getBurnById(client, Number(payout.burn));
      payout.actionDate = burnData.data?.created_at;
    }
    if (payout.transfer) {
      const transferData = await getTransferById(
        client,
        Number(payout.transfer)
      );
      payout.actionDate = transferData.data?.created_at;
    }
  }

  return payouts;
};
