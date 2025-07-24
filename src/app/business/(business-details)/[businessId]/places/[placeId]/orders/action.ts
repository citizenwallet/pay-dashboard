'use server';
import { getUserIdFromSessionAction } from '@/actions/session';
import { isUserLinkedToPlaceAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import {
  getOrder,
  getOrdersByPlaceWithOutLimit,
  refundOrder
} from '@/db/orders';
import { getOrderProcessorTx } from '@/db/ordersProcessorTx';
import { getFnsLocale } from '@/i18n';
import { createStripeRefund } from '@/services/stripe';
import { createVivaRefund } from '@/services/viva';
import { format } from 'date-fns';

export async function exportCsvAction(
  place_id: number,
  dateRange: string,
  csvHeaders: string[],
  customStartDate?: string,
  customEndDate?: string
) {
  const client = getServiceRoleClient();
  const orderResponse = await getOrdersByPlaceWithOutLimit(
    client,
    place_id,
    dateRange,
    customStartDate,
    customEndDate
  );

  if (!orderResponse.data || orderResponse.data.length === 0) {
    return null;
  }

  const orders = orderResponse.data;

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

export async function postRefundAction(orderId: number) {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const { data: orderData, error: orderError } = await getOrder(
    client,
    orderId
  );
  if (orderError) {
    throw new Error('Order not found');
  }

  if (orderData.status === 'refunded') {
    throw new Error('Order already refunded');
  }

  const place_id = orderData.place_id;

  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  if (!orderData.processor_tx && orderData.account) {
    // refund via transfer

    const { error: refundError } = await refundOrder(
      client,
      orderId,
      orderData.total,
      orderData.fees,
      null,
      'refund_pending'
    );

    if (refundError) {
      throw new Error('Unable to refund this order');
    }

    return;
  }

  if (!orderData.processor_tx) {
    throw new Error('Order has no processor tx');
  }

  const { data: processorTx, error: processorTxError } =
    await getOrderProcessorTx(client, orderData.processor_tx);
  if (!processorTx || processorTxError) {
    throw new Error('Order has no processor tx');
  }

  switch (processorTx.type) {
    case 'stripe': {
      const refunded = await createStripeRefund(processorTx.processor_tx_id);
      if (!refunded) {
        throw new Error('Unable to refund this order');
      }
      return;
    }
    case 'viva': {
      const refunded = await createVivaRefund(
        processorTx.processor_tx_id,
        orderData.total
      );
      if (!refunded) {
        throw new Error('Unable to refund this order');
      }
      return;
    }
    default:
      throw new Error('Unable to refund this order');
  }
}
