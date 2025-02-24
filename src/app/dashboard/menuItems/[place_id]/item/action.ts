"use server"
import { getServiceRoleClient } from '@/db';
import { getItemsForPlace } from '@/db/items';


export async function getItems(place_id: string) {
    const client = getServiceRoleClient();
    const items = await getItemsForPlace(client, Number(place_id));
    return items;
}
