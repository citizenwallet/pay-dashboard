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

export const getUserById = async (
  client: SupabaseClient,
  userId: number
): Promise<PostgrestSingleResponse<User>> => {
  return client.from('users').select('*').eq('id', userId).single();
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

export const updateLastplace = async (
  client: SupabaseClient,
  userid: number,
  placeid: number
): Promise<PostgrestSingleResponse<User | null>> => {
  return client
    .from('users')
    .update({ last_place: placeid })
    .eq('id', userid);
};

export const getLastplace = async (
  client: SupabaseClient,
  userid: number
)=> {
  return client
  .from('users')
  .select('last_place') 
  .eq('id', userid)
  .single();
};
export const userExists = async (
  client: SupabaseClient,
  email: string
): Promise<boolean> => {
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return false;
  }
  return true;
};
