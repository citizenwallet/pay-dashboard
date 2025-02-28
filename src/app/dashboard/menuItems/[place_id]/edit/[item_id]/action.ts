'use server';
import { getServiceRoleClient } from '@/db';
import { getItemById, Item, updateItem } from '@/db/items';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { checkUserPlaceAccess } from '@/db/places';
import { getUserBusinessId } from '@/db/users';
import { uploadImage } from '@/db/image';

const { auth } = NextAuth(authConfig);

export async function getItem(place_id: string, item_id: string) {
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

export async function updateItems(
  item_id: number,
  data: Partial<Item>,
  image: File | null
) {
  const client = getServiceRoleClient();
  const user = await auth();
  const res = await checkUserPlaceAccess(
    client,
    Number(user?.user?.id),
    Number(data.place_id)
  );
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  const business_id = await getUserBusinessId(client, Number(user?.user?.id));
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
