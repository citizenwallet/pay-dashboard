'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getAllPlaces, getAllPlacesByUserId, getPlaceById } from '@/db/places';
import { createPos, getPosById } from '@/db/pos';
import { isAdmin, updateLastplace } from '@/db/users';

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

export async function createPosAction(
  placeId: number,
  name: string,
  posId: string
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  console.log('Creating POS with following details:');
  console.log('POS ID:', posId);
  console.log('POS ID length:', posId.length);
  console.log('Place ID:', placeId);
  console.log('Name:', name);

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  const posData = await getPosById(client, posId);

  if (posData.data) {
    throw new Error('POS already exists');
  }

  const result = await createPos(client, name, posId, placeId, 'app', true);

  await updateLastplace(client, userId, placeId);

  return result;
}

export async function isPosAlreadyActiveAction(
  posId: string
): Promise<boolean> {
  const client = getServiceRoleClient();
  const posData = await getPosById(client, posId);
  return !posData.data;
}

export async function getPosByPlaceIdAction(placeId: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  const posData = await getPlaceById(client, placeId);
  return posData;
}
