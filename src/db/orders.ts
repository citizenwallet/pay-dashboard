import 'server-only';

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient
} from '@supabase/supabase-js';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'needs_minting'
  | 'needs_burning'
  | 'refunded'
  | 'refund_pending'
  | 'refund'
  | 'correction';

export interface Order {
  id: number;
  created_at: string;
  completed_at: string | null;
  total: number;
  due: number;
  fees: number;
  place_id: number;
  items: {
    id: number;
    quantity: number;
  }[];
  status: OrderStatus;
  description: string;
  tx_hash: string | null;
  type: 'web' | 'app' | 'terminal' | 'system' | null;
  account: string | null;
  payout_id: number | null;
  pos: string | null;
  processor_tx: number | null;
  refund_id: number | null;
  token: string | null;
}

export interface OrderTotal {
  status: OrderStatus;
  total: number;
  fees: number;
}

// Helper function to calculate date range filters
const getDateRangeFilter = (
  dateRange: string,
  customStartDate?: string,
  customEndDate?: string
) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (dateRange) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0)); // Start of today
      endDate = new Date(now.setHours(23, 59, 59, 999)); // End of today
      break;
    case 'yesterday':
      startDate = new Date(now.setDate(now.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last7days':
      startDate = new Date(now.setDate(now.getDate() - 6));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      break;
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'custom':
      if (!customStartDate || !customEndDate) return null;
      startDate = new Date(customStartDate);

      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(customEndDate);
      endDate.setUTCHours(23, 59, 59, 999);
      break;
    default:
      return null; // No filter if dateRange is invalid
  }

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };
};

export const createOrder = async (
  client: SupabaseClient,
  placeId: number,
  total: number,
  items: { id: number; quantity: number }[],
  description: string
): Promise<PostgrestSingleResponse<Order>> => {
  return client
    .from('orders')
    .insert({
      place_id: placeId,
      items,
      total,
      due: total,
      status: 'pending',
      description
    })
    .select()
    .single();
};

export const createTerminalOrder = async (
  client: SupabaseClient,
  placeId: number,
  total: number,
  description: string
): Promise<PostgrestSingleResponse<Order>> => {
  return client
    .from('orders')
    .insert({
      place_id: placeId,
      items: [],
      total,
      due: total,
      status: 'paid',
      description,
      type: 'terminal'
    })
    .select()
    .single();
};

export const updateOrder = async (
  client: SupabaseClient,
  orderId: number,
  total: number,
  items: { id: number; quantity: number }[]
): Promise<PostgrestSingleResponse<Order>> => {
  return client
    .from('orders')
    .update({ total, items })
    .eq('id', orderId)
    .single();
};

export const getOrder = async (
  client: SupabaseClient,
  orderId: number
): Promise<PostgrestSingleResponse<Order>> => {
  return client.from('orders').select().eq('id', orderId).single();
};

export const completeOrder = async (
  client: SupabaseClient,
  orderId: number
): Promise<PostgrestSingleResponse<Order>> => {
  return client
    .from('orders')
    .update({ status: 'paid', due: 0, completed_at: new Date().toISOString() })
    .eq('id', orderId)
    .single();
};

export const refundOrder = async (
  client: SupabaseClient,
  orderId: number,
  amount: number,
  fees: number,
  processorTxId: number | null,
  status: OrderStatus = 'refund'
): Promise<PostgrestSingleResponse<Order | null>> => {
  const orderResponse = await getOrder(client, orderId);
  const { data: order, error } = orderResponse;
  if (error) {
    throw new Error(error.message);
  }

  if (order.status === 'refunded') {
    return orderResponse;
  }

  const newOrder: Omit<
    Order,
    'id' | 'created_at' | 'completed_at' | 'tx_hash' | 'refund_id'
  > = {
    place_id: order.place_id,
    items: order.items,
    total: amount,
    fees,
    due: 0,
    status,
    description: order.description,
    type: order.type,
    payout_id: order.payout_id,
    pos: order.pos,
    processor_tx: processorTxId,
    token: order.token,
    account: order.account
  };

  const result = await client
    .from('orders')
    .insert(newOrder)
    .select()
    .maybeSingle();

  const { data: refundOrder, error: refundOrderError } = result;
  const refundOrderId: number | null = refundOrder?.id;

  if (refundOrderError === null && refundOrderId !== null) {
    const { error: updatedOrderError } = await client
      .from('orders')
      .update({ status: 'refunded', refund_id: refundOrderId })
      .eq('id', orderId);

    console.error('updatedOrderError', updatedOrderError);
  }

  return result;
};

export const cancelOrder = async (
  client: SupabaseClient,
  orderId: number
): Promise<PostgrestSingleResponse<Order>> => {
  return client
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .single();
};

export const attachTxHashToOrder = async (
  client: SupabaseClient,
  orderId: number,
  txHash: string
): Promise<PostgrestSingleResponse<Order>> => {
  return client
    .from('orders')
    .update({ tx_hash: txHash, status: 'paid' })
    .eq('id', orderId)
    .single();
};

export const getOrderStatus = async (
  client: SupabaseClient,
  orderId: number
): Promise<PostgrestSingleResponse<Order['status']>> => {
  return client.from('orders').select('status').eq('id', orderId).single();
};

export const placeHasOrders = async (
  client: SupabaseClient,
  placeId: number
): Promise<boolean> => {
  const { count } = await client
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('place_id', placeId)
    .limit(1);

  return (count ?? 0) > 0;
};

export const getOrdersByPlace = async (
  client: SupabaseClient,
  placeId: number,
  limit: number = 10,
  offset: number = 0,
  dateRange: string = 'today',
  customStartDate?: string,
  customEndDate?: string
): Promise<PostgrestResponse<Order>> => {
  const range = getDateRangeFilter(dateRange, customStartDate, customEndDate);
  if (!range) {
    // Handle invalid date range gracefully (e.g., return all orders or throw an error)
    return client
      .from('orders')
      .select()
      .eq('place_id', placeId)
      .in('status', ['paid', 'refunded', 'refund', 'correction'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  }

  return client
    .from('orders')
    .select()
    .eq('place_id', placeId)
    .in('status', ['paid', 'refunded', 'refund', 'correction'])
    .gte('created_at', range.start)
    .lte('created_at', range.end)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
};

export const getOrdersTotalByPlace = async (
  client: SupabaseClient,
  placeId: number,
  dateRange: string = 'today',
  customStartDate?: string,
  customEndDate?: string
): Promise<PostgrestResponse<OrderTotal>> => {
  const range = getDateRangeFilter(dateRange, customStartDate, customEndDate);
  if (!range) {
    // Handle invalid date range gracefully (e.g., return all orders or throw an error)
    return client
      .from('orders')
      .select('status,total,fees')
      .eq('place_id', placeId)
      .in('status', ['paid', 'refunded', 'refund', 'correction'])
      .order('created_at', { ascending: false });
  }

  return client
    .from('orders')
    .select('status,total,fees')
    .eq('place_id', placeId)
    .in('status', ['paid', 'refunded', 'refund', 'correction'])
    .gte('created_at', range.start)
    .lte('created_at', range.end)
    .order('created_at', { ascending: false });
};

export const getOrdersByPlaceCount = async (
  client: SupabaseClient,
  placeId: number,
  dateRange: string = 'today',
  customStartDate?: string,
  customEndDate?: string
): Promise<{ count: number }> => {
  const range = getDateRangeFilter(dateRange, customStartDate, customEndDate);
  let query = client
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('place_id', placeId)
    .in('status', ['paid', 'refunded', 'refund', 'correction']);

  if (range) {
    query = query.gte('created_at', range.start).lte('created_at', range.end);
  }

  const response = await query;
  return { count: response.count || 0 };
};

export const getOrdersByPlaceWithOutLimit = async (
  client: SupabaseClient,
  placeId: number,
  dateRange: string = 'today',
  customStartDate?: string,
  customEndDate?: string
): Promise<PostgrestResponse<Order>> => {
  const range = getDateRangeFilter(dateRange, customStartDate, customEndDate);
  if (!range) {
    return client
      .from('orders')
      .select()
      .eq('place_id', placeId)
      .in('status', ['paid', 'refunded', 'refund', 'correction'])
      .order('created_at', { ascending: false });
  }

  return client
    .from('orders')
    .select()
    .eq('place_id', placeId)
    .in('status', ['paid', 'refunded', 'refund', 'correction'])
    .gte('created_at', range.start)
    .lte('created_at', range.end)
    .order('created_at', { ascending: false });
};

export const getOrdersNotPayoutBy = async (
  client: SupabaseClient,
  placeId: number,
  dateRange: string = 'today',
  customStartDate?: string,
  customEndDate?: string
): Promise<PostgrestResponse<Order>> => {
  const range = getDateRangeFilter(dateRange, customStartDate, customEndDate);
  if (!range) {
    return client
      .from('orders')
      .select()
      .eq('place_id', placeId)
      .is('payout_id', null)
      .in('status', [
        'paid',
        'refunded',
        'needs_minting',
        'refund',
        'correction'
      ])
      .order('created_at', { ascending: false });
  }

  return client
    .from('orders')
    .select()
    .eq('place_id', placeId)
    .is('payout_id', null)
    .in('status', ['paid', 'refunded', 'needs_minting', 'refund', 'correction'])
    .gte('created_at', range.start)
    .lte('created_at', range.end)
    .order('created_at', { ascending: false });
};

export const updateOrdersPayout = async (
  client: SupabaseClient,
  payoutId: number,
  orderIds: number[]
): Promise<PostgrestSingleResponse<Order[]>> => {
  return client
    .from('orders')
    .update({ payout_id: payoutId })
    .in('id', orderIds)
    .select();
};

export const getPayoutOrders = async (
  client: SupabaseClient,
  payoutId: number
): Promise<PostgrestResponse<Order>> => {
  return client
    .from('orders')
    .select()
    .eq('payout_id', payoutId)
    .order('created_at', { ascending: false });
};

export const getPayoutOrdersForTable = async (
  client: SupabaseClient,
  payoutId: number,
  limit: number,
  offset: number,
  column?: string,
  order?: string
): Promise<PostgrestResponse<Order>> => {
  return client
    .from('orders')
    .select()
    .eq('payout_id', payoutId)
    .order(column ?? 'id', { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);
};
