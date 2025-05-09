'use server';

import { getServiceRoleClient } from '@/db';
import { getPayoutsByPlaceId } from '@/db/payouts';
import { getFnsLocale } from '@/i18n';
import { format } from 'date-fns';

export const getPayoutsbyPaceIdAction = async (placeId: number) => {
  const client = getServiceRoleClient();
  const { data: payouts } = await getPayoutsByPlaceId(
    client,
    placeId.toString()
  );

  return payouts;
};

export async function getPayoutsCSVAction(
  placeId: string,
  csvHeaders: string[]
) {
  const client = getServiceRoleClient();
  const { data: payouts } = await getPayoutsByPlaceId(
    client,
    placeId.toString()
  );

  if (!payouts || payouts.length === 0) {
    return ''; // Return an empty CSV string instead of null
  }

  const locale = await getFnsLocale();

  const csvData = [
    csvHeaders.join(','),
    ...payouts.map((payout) => {
      const net = payout.total - payout.fees;

      const completed =
        payout.payout_burn !== null && payout.payout_transfer !== null;

      return [
        payout.id,
        payout.created_at
          ? format(new Date(payout.created_at), 'P', { locale })
          : '',
        payout.created_at
          ? format(new Date(payout.created_at), 'p', { locale })
          : '',
        payout.from ? format(new Date(payout.created_at), 'P', { locale }) : '',
        payout.to ? format(new Date(payout.created_at), 'P', { locale }) : '',
        (payout.total / 100).toFixed(2),
        (payout.fees / 100).toFixed(2),
        (net / 100).toFixed(2),
        completed ? 'completed' : 'pending'
      ].join(',');
    })
  ].join('\n');

  return csvData;
}
