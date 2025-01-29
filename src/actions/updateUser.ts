'use server';

import { getServiceRoleClient } from '@/db';

export async function updateUser(data: any) {
  const client = getServiceRoleClient();
  return client.from('users').update(data);
}
