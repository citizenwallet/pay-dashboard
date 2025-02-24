"use server";

import { getServiceRoleClient } from '@/db';
import { getAllPlaces } from '@/db/places';

export async function getAllPlacesData(): Promise<any> {
    const client = getServiceRoleClient();
    const places = await getAllPlaces(client);
    return places;
}
