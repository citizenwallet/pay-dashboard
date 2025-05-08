import 'server-only';

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient
} from '@supabase/supabase-js';
import { encodeBase64 } from 'ethers';
import Stripe from 'stripe';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'needs_minting'
  | 'needs_burning'
  | 'refunded'
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
  pos: string | null;
  processor_tx: number | null;
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
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
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
      .in('status', ['paid', 'refunded'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  }

  return client
    .from('orders')
    .select()
    .eq('place_id', placeId)
    .in('status', ['paid', 'refunded'])
    .gte('created_at', range.start)
    .lte('created_at', range.end)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
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
    .in('status', ['paid', 'refunded', 'correction']);

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
      .in('status', ['paid', 'refunded', 'correction'])
      .order('created_at', { ascending: false });
  }

  return client
    .from('orders')
    .select()
    .eq('place_id', placeId)
    .in('status', ['paid', 'refunded', 'correction'])
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
      .in('status', ['paid', 'needs_minting', 'correction'])
      .order('created_at', { ascending: false });
  }

  return client
    .from('orders')
    .select()
    .eq('place_id', placeId)
    .is('payout_id', null)
    .in('status', ['paid', 'needs_minting', 'correction'])
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
  return client.from('orders').select().eq('payout_id', payoutId);
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
