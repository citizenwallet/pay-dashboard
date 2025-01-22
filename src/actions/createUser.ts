'use server';

import { getServiceRoleClient } from '@/db';

export async function createUser(data: any) {
  const client = getServiceRoleClient();
  return client.from('users').upsert(data, {
    onConflict: 'email', // clé unique pour détecter les doublons
    ignoreDuplicates: true // mettre à jour si existe déjà
  });
}
