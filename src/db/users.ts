import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: number;
  created_at: string; // ISO timestamp
  email: string;
  name: string;
  avatar: string;
  magic_link: string;
  usergroup: 'business' | 'admin';
  linked_business_id: number;
  uuid: string;
  phone: string;
  description: string;
  invitation_token: string;
  password: string;
  account: string;
  user_id: string;
}

export const getUserBusinessId = async (
  client: SupabaseClient,
  userId: number
) => {
  const { data, error } = await client
    .from('users')
    .select('linked_business_id')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.linked_business_id as number;
};

export const getUserByEmail = async (
  client: SupabaseClient,
  email: string
): Promise<PostgrestSingleResponse<User>> => {
  return client.from('users').select('*').eq('email', email).single();
};

export const isAdmin = async (client: SupabaseClient, userId: number) => {
  const { data, error } = await client
    .from('users')
    .select('usergroup')
    .eq('id', userId)
    .single();

  if (error) {
    return false;
  }

  return data?.usergroup === 'admin';
};
