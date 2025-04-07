import { isUserAdminAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getPendingPayouts } from '@/db/payouts';

export async function getPendingPayoutsAction() {
  const admin = await isUserAdminAction();
  if (!admin) {
    return { error: 'You are not authorized to update payout burn date' };
  }

  const client = getServiceRoleClient();
  const { data, error } = await getPendingPayouts(client);
  if (error) {
    return { error: error.message };
  }
  return data;
}
