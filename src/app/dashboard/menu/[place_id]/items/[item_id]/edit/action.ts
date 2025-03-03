'use server';
import { getServiceRoleClient } from '@/db';
import { getItemById, Item, updateItem } from '@/db/items';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { checkUserPlaceAccess } from '@/db/places';
import { getUserBusinessId } from '@/db/users';
import { uploadImage } from '@/services/storage/image';
import { getUserIdFromSessionAction } from '@/actions/session';
import { isUserLinkedToPlaceAction } from '@/actions/session';

const { auth } = NextAuth(authConfig);

export async function getItemAction(place_id: number, item_id: number) {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const item = await getItemById(client, Number(place_id), Number(item_id));
  return item;
}

export async function updateItemsAction(
  item_id: number,
  data: Partial<Item>,
  image: File | null
) {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(
    client,
    userId,
    Number(data.place_id)
  );
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  const business_id = await getUserBusinessId(client, userId);
  if (image) {
    const imageUrl = await uploadImage(
      client,
      image,
      Number(business_id),
      Number(data.place_id)
    );
    data.image = imageUrl;
  }
  const item = await updateItem(client, item_id, data);
  return item;
}
