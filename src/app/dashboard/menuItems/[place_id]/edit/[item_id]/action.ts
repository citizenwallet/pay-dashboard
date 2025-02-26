'use server';
import { getServiceRoleClient } from '@/db';
import { getItemById, Item, UpdateItem } from '@/db/items';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

const { auth } = NextAuth(authConfig);

export async function getItem(place_id: string, item_id: string) {
  const client = getServiceRoleClient();
  const item = await getItemById(client, Number(place_id), Number(item_id));
  return item;
}

export async function updateItem(
  item_id: number,
  data: Partial<Item>,
  image: File | null
) {
  const client = getServiceRoleClient();
  const user = await auth();

  const item = await UpdateItem(client, item_id, data, image, Number(user?.user?.id));
  return item;
}
