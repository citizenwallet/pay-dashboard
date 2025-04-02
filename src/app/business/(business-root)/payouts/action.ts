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

interface FullPayout {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  from: string;
  to: string;
  burn: number;
  transfer: number;
  total: number;
  place_id: number;
  business_id: number;
  places: {
    name: string;
  };
  businesses: {
    name: string;
  };
  payout_burn: {
    created_at: string;
  };
  payout_transfer: {
    created_at: string;
  };
}

export async function getAllPayoutAction(
  limit: number,
  offset: number,
  search?: string,
  column: string = 'payout_transfer(created_at)',
  order?: string
) {
  const client = getServiceRoleClient();

  if (column === 'business_id') {
    column = 'businesses(name)';
  } else if (column === 'place_id') {
    column = 'places(name)';
  } else if (column === 'burn') {
    column = 'payout_burn(created_at)';
  } else if (column === 'transfer') {
    column = 'payout_transfer(created_at)';
  }
  const payoutResponse = await getPayouts(
    client,
    limit,
    offset,
    column,
    order,
    search
  );
  const payouts: FullPayout[] = payoutResponse.data ?? [];
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
