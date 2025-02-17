import 'server-only';

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient
} from '@supabase/supabase-js';

export type OrderStatus = 'pending' | 'paid' | 'cancelled';

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
  type: 'web' | 'app' | 'terminal' | null;
}

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

export const getOrdersByPlace = async (
  client: SupabaseClient,
  placeId: number,
  limit: number = 10,
  offset: number = 0
): Promise<PostgrestResponse<Order>> => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  return client
    .from('orders')
    .select()
    .eq('place_id', placeId)
    .or(
      `status.eq.paid,and(status.eq.pending,created_at.gte.${fiveMinutesAgo})`
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit);
};

export const getOrdersByPlaceCount = async (
  client: SupabaseClient,
  placeId: number
): Promise<PostgrestResponse<Order>> => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  return client
    .from('orders')
    .select('*', { count: 'estimated', head: true })
    .eq('place_id', placeId)
    .or(
      `status.eq.paid,and(status.eq.pending,created_at.gte.${fiveMinutesAgo})`
    );
};
