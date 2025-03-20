'use server';
import { getServiceRoleClient } from '@/db';
import { getPayoutOrders } from '@/db/orders';

export async function getPayoutAction(payout_id: string) {
  const client = getServiceRoleClient();
  const payout = await getPayoutOrders(client, Number(payout_id));
  return payout;
}

export async function getPayoutCSVAction(payout_id: string) {
  const client = getServiceRoleClient();
  const payout = await getPayoutOrders(client, Number(payout_id));

  if (!payout.data || payout.data.length === 0) {
    return ''; // Return an empty CSV string instead of null
  }

  const orders = payout.data;

  const csvHeaders = [
    'ID',
    'Created At',
    'Total',
    'Due',
    'Status',
    'Type',
    'Fees',
    'Place ID'
  ];

  const csvData = [
    csvHeaders.join(','),
    ...orders.map((order) =>
      [
        order.id,
        order.created_at,
        order.total,
        order.due,
        order.status,
        order.type,
        order.fees,
        order.place_id
      ].join(',')
    )
  ].join('\n');

  return csvData;
}
