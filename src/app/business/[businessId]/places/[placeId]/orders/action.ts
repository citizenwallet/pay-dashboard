'use server';

import Stripe from 'stripe';
import { getServiceRoleClient } from '@/db';
import { getOrdersByPlaceWithOutLimit } from '@/db/orders';

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

export async function postRefund(transactionId: number) {
  // Initialize Stripe client
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-02-24.acacia'
  });

  try {
    // Create a refund for the given transaction
    return await stripe.refunds.create({
      payment_intent: transactionId.toString()
    });
  } catch (error) {
    console.error('Error while processing refund:', error);
    throw new Error('Failed to process refund.');
  }
}
