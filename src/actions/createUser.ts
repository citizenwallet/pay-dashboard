'use server';

import { getServiceRoleClient } from '@/db';

export async function createUser(data: any) {
  const client = getServiceRoleClient();
  return client.from('users').insert(data);
}
