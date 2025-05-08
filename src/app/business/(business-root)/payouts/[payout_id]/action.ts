'use server';
import { isUserAdminAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { createBurn, getBurnById } from '@/db/burn';
import { getPayoutOrders, getPayoutOrdersForTable } from '@/db/orders';
import {
  getPayoutById,
  updatePayoutBurn,
  updatePayoutTransfer
} from '@/db/payouts';
import { createTransfer, getTransferById } from '@/db/transfer';
import { getFnsLocale } from '@/i18n';
import { format } from 'date-fns';

export async function getPayoutAction(
  payout_id: string,
  limit: number,
  offset: number,
  column: string,
  order?: string
) {
  const client = getServiceRoleClient();
  const payout = await getPayoutOrdersForTable(
    client,
    Number(payout_id),
    limit,
    offset,
    column,
    order
  );
  return payout;
}

export async function getPayoutCSVAction(
  payout_id: string,
  csvHeaders: string[]
) {
  const client = getServiceRoleClient();
  const payout = await getPayoutOrders(client, Number(payout_id));

  if (!payout.data || payout.data.length === 0) {
    return ''; // Return an empty CSV string instead of null
  }

  const orders = payout.data;

  const locale = await getFnsLocale();

  const csvData = [
    csvHeaders.join(','),
    ...orders.map((order) => {
      const net = order.total - order.fees;

      const isCorrection = order.status === 'correction';

      return [
        order.id,
        order.created_at
          ? format(new Date(order.created_at), 'P', { locale })
          : '',
        order.created_at
          ? format(new Date(order.created_at), 'p', { locale })
          : '',
        `${isCorrection && order.total > 0 ? '-' : ''} ${(
          order.total / 100
        ).toFixed(2)}`,
        `${isCorrection && order.fees > 0 ? '-' : ''} ${(
          order.fees / 100
        ).toFixed(2)}`,
        `${isCorrection && net > 0 ? '-' : ''} ${(net / 100).toFixed(2)}`,
        order.status,
        order.type,
        order.pos,
        order.description
      ].join(',');
    })
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

export async function getPayoutStatusAction(payout_id: string) {
  const admin = await isUserAdminAction();
  if (!admin) {
    return { error: 'You are not authorized to update payout transfer date' };
  }

  const client = getServiceRoleClient();
  const payout = await getPayoutById(client, payout_id);
  if (payout.data?.burn) {
    const burnData = await getBurnById(client, Number(payout.data.burn));
    payout.data.burnDate = burnData.data?.created_at ?? null;
  }

  if (payout.data?.transfer) {
    const transferData = await getTransferById(
      client,
      Number(payout.data.transfer)
    );
    payout.data.transferDate = transferData.data?.created_at ?? null;
  }
  return { payout };
}
