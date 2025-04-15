'use server';
import { getUserIdFromSessionAction } from '@/actions/session';
import { isUserLinkedToPlaceAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getOrder, getOrdersByPlaceWithOutLimit } from '@/db/orders';
import { getOrderProcessorTx } from '@/db/ordersProcessorTx';
import { createStripeRefund } from '@/services/stripe';
import { createVivaRefund } from '@/services/viva';

export async function exportCsvAction(
  place_id: number,
  dateRange: string,
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

  console.log(orderData);

  if (!orderData.processor_tx) {
    throw new Error('Order has no processor tx');
  }

  const place_id = orderData.place_id;

  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
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
