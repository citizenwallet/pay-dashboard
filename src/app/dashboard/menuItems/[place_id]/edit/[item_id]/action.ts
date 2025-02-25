"use server"
import { getServiceRoleClient } from '@/db';
import { getItemById, Item, UpdateItem } from '@/db/items';

export async function getItem(place_id: string, item_id: string) {
    const client = getServiceRoleClient();
    const item = await getItemById(client, Number(place_id), Number(item_id));
    return item;
}

export async function updateItem(item_id: number, data: Partial<Item>) {
    const client = getServiceRoleClient();
    const item = await UpdateItem(client, item_id, data);
    return item;
}
