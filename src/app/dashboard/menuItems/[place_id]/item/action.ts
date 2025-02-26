"use server"

import { getServiceRoleClient } from '@/db';
import { DeleteItem, getItemById, getItemsForPlace, UpdateItemOrder } from '@/db/items';


import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

const { auth } = NextAuth(authConfig);

export async function getItems(place_id: string) {
    const client = getServiceRoleClient();
    const user = await auth();
    const items = await getItemsForPlace(client, Number(place_id), Number(user?.user?.id));
    return items;
}

export async function deleteItem(id: number, place_id: number) {
    const user = await auth();
    const client = getServiceRoleClient();
    const item = await DeleteItem(client, id, place_id, Number(user?.user?.id));
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


