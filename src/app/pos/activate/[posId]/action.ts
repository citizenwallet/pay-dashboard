'use server';

import { getServiceRoleClient } from '@/db';
import { getAllPlaces, getAllPlacesByUserId } from '@/db/places';
import { getUserIdFromSessionAction, isUserLinkedToPlaceAction } from '@/actions/session';
import { isAdmin } from '@/db/users';
import { createPos, getPosById } from '@/db/pos';

export async function getAllPlacesDataAction() {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const admin = await isAdmin(client, userId);

  if (admin) {
    const places = await getAllPlaces(client);
    return places;
  }

  const places = await getAllPlacesByUserId(client, userId);
  return places;
}


export async function createPosAction(placeId: number, name: string,posId: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return await createPos(client, name, posId, placeId);

}


export async function isPosAlreadyActiveAction(posId: string): Promise<boolean> {
  const client = getServiceRoleClient();
  const posData = await getPosById(client, posId);
  return !posData.data; 
}
