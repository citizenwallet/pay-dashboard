'use server';

import { getServiceRoleClient } from '@/db';

export async function upsertUser(data: any) {
  const client = getServiceRoleClient();
  return client.from('users').upsert(data, { onConflict: 'email' });
}
