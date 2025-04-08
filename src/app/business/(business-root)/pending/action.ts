import { isUserAdminAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getPendingPayouts } from '@/db/payouts';

export async function getPendingPayoutsAction(
  offset: string,
  limit: string,
  search: string
) {
  const admin = await isUserAdminAction();
  if (!admin) {
    return { error: 'You are not authorized to update payout burn date' };
  }

  const client = getServiceRoleClient();
  const { data, error, count } = await getPendingPayouts(
    client,
    Number(offset),
    Number(limit),
    search
  );
  if (error) {
    return { error: error.message };
  }
  return { data, count };
}
