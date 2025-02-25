"use server"
import { OrdersPage } from '@/app/dashboard/places/[id]/orders/_components/orders-page';
import { getServiceRoleClient } from '@/db';
import { DeleteItem, getItemById, getItemsForPlace, UpdateItemOrder } from '@/db/items';
import { Apple } from 'lucide-react';


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



export async function updateItemOrder(
    place_id: number, 
    positions: Record<number, { from: number; to: number }>
) {

    const client = getServiceRoleClient();
    for (const [id, { from, to }] of Object.entries(positions)) {
        const item = await UpdateItemOrder(client, place_id, { id: Number(id), order: to });
        // console.log(item)
    }
    return { success: true };
}


