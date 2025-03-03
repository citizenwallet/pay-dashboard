'use server';

import { getServiceRoleClient } from '@/db';
import { insertItem } from '@/db/items';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { uploadImage } from '@/services/storage/image';
import { getUserBusinessId } from '@/db/users';
import { checkUserPlaceAccess } from '@/db/places';

const { auth } = NextAuth(authConfig);

export default interface createItemschema {
  name: string;
  description: string;
  image: File;
  price: number;
  vat: number;
  category: string;
  place_id: number;
}

export const creatItemAction = async (item: createItemschema) => {
  const client = getServiceRoleClient();
  const user = await auth();

  const res = await checkUserPlaceAccess(
    client,
    Number(user?.user?.id),
    item.place_id
  );
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  const business_id = await getUserBusinessId(client, Number(user?.user?.id));
  const imageUrl = await uploadImage(
    client,
    item.image,
    Number(business_id),
    item.place_id
  );
  const response = await insertItem(
    client,
    item.name,
    item.description,
    imageUrl,
    item.price,
    item.vat,
    item.category,
    item.place_id
  );
  return response;
};
