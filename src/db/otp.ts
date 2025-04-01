import 'server-only';

import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface Otp {
  source: string;
  created_at: string;
  expires_at: string;
  code: string;
  type: string;
}

export const createOtp = async (
  client: SupabaseClient,
  email: string,
  otp: string
): Promise<PostgrestSingleResponse<Otp | null>> => {
  return client
    .from('otp')
    .upsert(
      {
        source: email,
        code: otp,
        type: 'email',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      },
      {
        onConflict: 'source'
      }
    )
    .select('*')
    .maybeSingle();
};

export const verifyOtp = async (
  client: SupabaseClient,
  email: string,
  otp: string
): Promise<{ valid: boolean; data: Otp | null; error?: string }> => {
  const { data, error } = await client
    .from('otp')
    .select('*')
    .eq('source', email)
    .eq('code', otp)
    .gte('expires_at', new Date().toISOString()) // Ensure OTP isn’t expired
    .maybeSingle();

  if (error) {
    return { valid: false, data: null, error: error.message };
  }
  if (!data) {
    return { valid: false, data: null, error: 'Invalid or expired OTP' };
  }
  return { valid: true, data };
};

export const deleteVerifyOtp = async (
  client: SupabaseClient,
  email: string
): Promise<{ valid: boolean; error?: string }> => {
  const { error } = await client
    .from('otp')
    .delete()
    .eq('source', email);

  if (error) {
    return { valid: false, error: error.message };
  }
  
  return { valid: true };
};

