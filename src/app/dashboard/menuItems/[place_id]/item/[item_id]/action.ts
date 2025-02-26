"use server"
import { getServiceRoleClient } from '@/db';
import { getItemById } from '@/db/items';

export async function getItem(place_id: string, item_id: string) {
    const client = getServiceRoleClient();
    const item = await getItemById(client, Number(place_id), Number(item_id));
    return item;
}

