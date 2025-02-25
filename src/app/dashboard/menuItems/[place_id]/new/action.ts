'use server';

import { getServiceRoleClient } from '@/db';
import { InsertItem } from '@/db/items';

export default interface createItemschema {
  name: string;
  description: string;
  image: string;
  price: number;
  vat: number;
  category: string;
  place_id: number;
}
export const creatItem = async (item: createItemschema) => {
  const client = getServiceRoleClient();
  const response = await InsertItem(
    client,
    item.name,
    item.description,
    item.image,
    item.price,
    item.vat,
    item.category,
    item.place_id
  );

  return response;
};
