'use server';
import { isUserAdminAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getBurnById } from '@/db/burn';
import { getBusinessById } from '@/db/business';
import {
  getPayoutBurnId,
  getPayouts,
  getPayoutTransferId,
  Payout,
  updatePayoutBurnDate,
  updatePayoutTransferDate
} from '@/db/payouts';
import { getPlaceById } from '@/db/places';
import { getTransferById } from '@/db/transfer';

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

export async function updatePayoutBurnDateAction(id: string, date: string) {
  const admin = await isUserAdminAction();
  if (!admin) {
    return { error: 'You are not authorized to update payout burn date' };
  }
  const client = getServiceRoleClient();
  const { data: payoutBurnId } = await getPayoutBurnId(client, id);

  if (!payoutBurnId) {
    return { error: 'Payout burn id not found' };
  }

  return await updatePayoutBurnDate(client, payoutBurnId.burn.toString(), date);
}

export async function updatePayoutTransferDateAction(id: string, date: string) {
  const admin = await isUserAdminAction();
  if (!admin) {
    return { error: 'You are not authorized to update payout transfer date' };
  }

  const client = getServiceRoleClient();
  const { data: payoutTransferId } = await getPayoutTransferId(client, id);

  if (!payoutTransferId) {
    return { error: 'Payout burn id not found' };
  }

  return await updatePayoutTransferDate(
    client,
    payoutTransferId.transfer.toString(),
    date
  );
}
