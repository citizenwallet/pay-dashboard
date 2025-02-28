'use server';
import { getServiceRoleClient } from '@/db';
import { getItemById } from '@/db/items';
import { checkUserPlaceAccess } from '@/db/places';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
const { auth } = NextAuth(authConfig);

export async function getItemAction(place_id: string, item_id: string) {
  const client = getServiceRoleClient();
  const user = await auth();
  const res = await checkUserPlaceAccess(
    client,
    Number(user?.user?.id),
    Number(place_id)
  );
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const item = await getItemById(client, Number(place_id), Number(item_id));
  return item;
}
