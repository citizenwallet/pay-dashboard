'use server';

import { getServiceRoleClient } from '@/db';
import { InsertItem } from '@/db/items';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default interface createItemschema {
  name: string;
  description: string;
  image: File | null;
  price: number;
  vat: number;
  category: string;
  place_id: number;
}



export const creatItem = async (item: createItemschema) => {
  const client = getServiceRoleClient();
  const user = await auth();
  const response = await InsertItem(
    client,
    item.name,
    item.description,
    item.image,
    item.price,
    item.vat,
    item.category,
    item.place_id,
    Number(user?.user?.id)
  );
  return response;
};
