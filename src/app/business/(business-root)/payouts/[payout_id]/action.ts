'use server';
import { getServiceRoleClient } from '@/db';
import { createBurn } from '@/db/burn';
import { getPayoutOrders } from '@/db/orders';
import { updatePayoutBurn, updatePayoutTransfer } from '@/db/payouts';
import { createTransfer } from '@/db/transfer';

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

export async function setPayoutStatusAction(payout_id: string, status: string) {
  const client = getServiceRoleClient();
  try {
    if (status == 'burn') {
      const burn = await createBurn(client);
      const burnId = burn.data?.id;
      if (!burnId) {
        throw new Error('Failed to create burn');
      }
      const payout = await updatePayoutBurn(client, payout_id, burnId);
    } else if (status == 'transferred') {
      const transfer = await createTransfer(client);
      const transferId = transfer.data?.id;
      if (!transferId) {
        throw new Error('Failed to create transfer');
      }
      const payout = await updatePayoutTransfer(client, payout_id, transferId);
    }
  } catch (error) {
    return false;
  }

  return true;
}
