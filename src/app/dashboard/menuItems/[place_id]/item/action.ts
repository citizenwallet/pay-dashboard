"use server"
import { getServiceRoleClient } from '@/db';
import { DeleteItem, getItemsForPlace } from '@/db/items';


export async function getItems(place_id: string) {
    const client = getServiceRoleClient();
    const items = await getItemsForPlace(client, Number(place_id));
    return items;
}

export async function deleteItem(id: number) {
    const client = getServiceRoleClient();
    const item = await DeleteItem(client, id);
    return item;
}
