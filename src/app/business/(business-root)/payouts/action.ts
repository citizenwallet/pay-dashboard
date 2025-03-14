'use server';
import { getServiceRoleClient } from '@/db';
import { getBurnById } from '@/db/burn';
import { getBusinessById } from '@/db/business';
import { getPayouts, Payout } from '@/db/payouts';
import { getPlaceById } from '@/db/places';
import { getTransferById } from '@/db/transfer';
import { SupabaseClient } from '@supabase/supabase-js';

export async function getAllPayoutAction() {
  const client = getServiceRoleClient();
  const payoutResponse = await getPayouts(client);

  const payouts: Payout[] = payoutResponse.data ?? [];

  //assign place and business name to payout
  for (const payout of payouts) {
    const placeData = await getPlaceById(client, Number(payout.place_id));
    payout.place_id = placeData.data?.name ?? '';

    const businessData = await getBusinessById(
      client,
      Number(payout.business_id)
    );
    payout.business_id = businessData.data?.name ?? '';
  }

  //assign burn and transfer name to payout
  for (const payout of payouts) {
    if (payout.burn) {
      const burnData = await getBurnById(client, Number(payout.burn));
      payout.burnDate = burnData.data?.created_at ?? null;
    }

    if (payout.transfer) {
      const transferData = await getTransferById(
        client,
        Number(payout.transfer)
      );
      payout.transferDate = transferData.data?.created_at ?? null;
    }
  }
  return payouts;
}
