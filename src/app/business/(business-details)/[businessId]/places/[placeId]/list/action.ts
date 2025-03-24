'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { updatePlaceById } from '@/db/places';
import { getUserBusinessId } from '@/db/users';
import { uploadImage } from '@/services/storage/upload';

export async function updatePlaceNameAction(placeId: number, name: string) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const { data, error } = await updatePlaceById(client, placeId, { name });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updatePlaceDescriptionAction(
  placeId: number,
  description: string
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const { data, error } = await updatePlaceById(client, placeId, {
    description
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updatePlaceHiddenAction(
  placeId: number,
  hidden: boolean
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const { data, error } = await updatePlaceById(client, placeId, {
    hidden
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updatePlaceImageAction(formData: FormData) {
  const client = getServiceRoleClient();

  // Extract data from FormData
  const placeId = Number(formData.get('placeId'));
  const imageFile = formData.get('file') as File;

  if (!placeId || !imageFile) {
    throw new Error('Missing required data for image upload');
  }

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  // Get the business ID for the user
  const businessId = await getUserBusinessId(client, userId);
  if (!businessId) {
    throw new Error('User does not have a business');
  }

  try {
    // Upload the image to storage
    const imageUrl = await uploadImage(client, imageFile, businessId);

    // Update the item with the image URL
    const response = await updatePlaceById(client, placeId, {
      image: imageUrl
    });

    return { response, imageUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}
