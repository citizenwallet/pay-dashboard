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

export interface UserWithLastPlace {
  id: number;
  last_place: number | null;
  place: {
    id: number;
    business_id: number;
    name: string;
    business: {
      id: number;
      name: string;
      status: string;
      invite_code: string;
    };
  };
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

export const getUserIdbyBusinessId = async (
  client: SupabaseClient,
  businessId: number
) => {
  const { data, error } = await client
    .from('users')
    .select('id')
    .eq('linked_business_id', businessId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data?.id as number;
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
  return client.from('users').update({ last_place: placeid }).eq('id', userid);
};

export const getFirstPlace = async (
  client: SupabaseClient,
  businessId: number
) => {
  return client
    .from('places')
    .select('*')
    .eq('business_id', businessId)
    .limit(1)
    .single();
};

export const getUserLastPlace = async (
  client: SupabaseClient,
  userid: number
): Promise<PostgrestSingleResponse<UserWithLastPlace | null>> => {
  return client
    .from('users')
    .select(
      `id,last_place,place:places!last_place(id,business_id,name,business:businesses!business_id(id,name,status,invite_code))`
    )
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

export const createUser = async (
  client: SupabaseClient,
  user: {
    name: string;
    email: string;
    phone: string;
    linked_business_id: number;
  }
): Promise<PostgrestSingleResponse<User>> => {
  return await client.from('users').insert(user).select().single();
};
