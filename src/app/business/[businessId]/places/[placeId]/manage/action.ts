'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getOrdersByPlace, getOrdersByPlaceCount } from '@/db/orders';
import { deletePlaceById, getPlaceById, handleArchiveToggleById, handleVisibilityToggleceById } from '@/db/places';

export async function getPlaceDataAction(placeId: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  return await getPlaceById(client, placeId);
}

export async function getPlaceOrderAction(placeId: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  return await getOrdersByPlace(client, placeId);
}


export const handleVisibilityToggleAction = async (placeId: number)=> {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return await handleVisibilityToggleceById(client, placeId);

};

export const handleArchiveToggleAction = async (placeId: number) => {
    const client = getServiceRoleClient();

    const userId = await getUserIdFromSessionAction();
  
    const res = await isUserLinkedToPlaceAction(client, userId, placeId);
    if (!res) {
      throw new Error('User does not have access to this place');
    }

    return await handleArchiveToggleById(client, placeId);

}

export const deleteplaceAction = async (placeId: number) => {
    const client = getServiceRoleClient();
    const userId = await getUserIdFromSessionAction();
    const res = await isUserLinkedToPlaceAction(client, userId, placeId);
    if (!res) {
      throw new Error('User does not have access to this place');
    }
    return await deletePlaceById(client, placeId);

}