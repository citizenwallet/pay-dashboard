'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getBusinessIdByUserId } from '@/db/business';
import { getPlaceById, Place, updatePlaceById } from '@/db/places';
import { uploadImage } from '@/services/storage/upload';

export async function getPlaceDataAction(placeId: number, businessId: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  return await getPlaceById(client, placeId);
}

export async function updatePlaceAction({
  placeId,
  name,
  description,
  slug,
  image,
  oldimage
}: {
  placeId: number;
  name: string;
  description: string;
  slug: string;
  image: File;
  oldimage: string;
}) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const businessid = await getBusinessIdByUserId(client, userId);
  const busid = businessid.data?.linked_business_id;
  let url = oldimage;
  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  if (image.size != 0) {
    url = await uploadImage(client, image, busid);
  }
  return await updatePlaceById(client, placeId, name, description, slug, url);
}
