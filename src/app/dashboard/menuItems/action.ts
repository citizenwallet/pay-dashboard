"use server";

import { getServiceRoleClient } from '@/db';
import { getAllPlacesByUserId } from '@/db/places';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

const { auth } = NextAuth(authConfig);

export async function getAllPlacesData(): Promise<any> {
    const client = getServiceRoleClient();
    const user = await auth();
    const places = await getAllPlacesByUserId(client, Number(user?.user?.id));
    return places;
}
