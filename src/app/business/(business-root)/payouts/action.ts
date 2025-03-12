'use server';
import { getServiceRoleClient } from '@/db';
import { getPayouts } from '@/db/payouts';

export async function getAllPayoutAction() {
  const client = getServiceRoleClient();
  const payouts = await getPayouts(client);
  return payouts.data;
}
