import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface SessionRequest {
  id: number;
  created_at: string;
  salt: string;
}

export const createSessionRequest = async (
  client: SupabaseClient,
  salt: string
): Promise<PostgrestSingleResponse<SessionRequest | null>> => {
  return client
    .from('session_request')
    .insert({
      salt: salt,
      created_at: new Date().toISOString()
    })
    .select('*')
    .maybeSingle();
};

// get count of session requests for a given salt in the last 10 minutes
export const getRecentSessionRequestCount = async (
  client: SupabaseClient,
  salt: string
): Promise<number> => {
  const { data, error } = await client
    .from('session_request')
    .select('count')
    .eq('salt', salt)
    .lte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
    .maybeSingle();
  if (error) {
    return 0;
  }
  return data?.count ?? 0;
};

// get count of session requests for a given salt in the last 24 hours
export const getDailySessionRequestCount = async (
  client: SupabaseClient,
  salt: string
): Promise<number> => {
  const { data, error } = await client
    .from('session_request')
    .select('count')
    .eq('salt', salt)
    .lte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle();
  if (error) {
    return 0;
  }
  return data?.count ?? 0;
};

// get count of session requests for a given salt in the last 30 seconds
export const getImmediateSessionRequestCount = async (
  client: SupabaseClient,
  salt: string
): Promise<number> => {
  const { data, error } = await client
    .from('session_request')
    .select('count')
    .eq('salt', salt)
    .lte('created_at', new Date(Date.now() - 30 * 1000).toISOString())
    .maybeSingle();
  if (error) {
    return 0;
  }
  return data?.count ?? 0;
};
