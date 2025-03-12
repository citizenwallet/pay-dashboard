'use server';

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
