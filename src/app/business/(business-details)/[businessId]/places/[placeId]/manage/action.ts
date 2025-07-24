'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { isOwnerOfBusiness } from '@/db/businessUser';
import { placeHasOrders } from '@/db/orders';
import {
  deletePlaceById,
  getPlaceById,
  handleArchiveToggleById,
  handleVisibilityToggleceById
} from '@/db/places';
import { getFirstPlace, isAdmin, updateLastplace } from '@/db/users';

export async function getPlaceDataAction(placeId: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  return await getPlaceById(client, placeId);
}

export async function placeHasOrdersAction(placeId: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  return placeHasOrders(client, placeId);
}

export const handleVisibilityToggleAction = async (placeId: number) => {
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
};

export const deletePlaceAction = async (placeId: number) => {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  const admin = await isAdmin(client, userId);

  const hasOrders = await placeHasOrders(client, placeId);
  if (hasOrders) {
    throw new Error('Place has orders, cannot delete');
  }

  const { data: place, error: placeError } = await getPlaceById(
    client,
    placeId
  );
  if (!place || placeError) {
    throw new Error('Place not found');
  }

  if (!admin) {
    const isOwner = await isOwnerOfBusiness(client, userId, place.business_id);

    if (!isOwner) {
      throw new Error('User does not have access to this place');
    }
  }

  const { data: firstPlace, error } = await getFirstPlace(
    client,
    place.business_id
  );
  if (error) {
    throw new Error('Error getting first place');
  }

  if (!firstPlace) {
    throw new Error('No places found');
  }

  const { error: deletedPlaceError } = await deletePlaceById(client, placeId);
  if (deletedPlaceError) {
    throw new Error('Error deleting place');
  }

  return updateLastplace(client, userId, firstPlace.id);
};
