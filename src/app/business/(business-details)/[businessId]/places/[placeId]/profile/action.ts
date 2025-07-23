'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getLinkedBusinessByUserId } from '@/db/business';
import { getPlaceById, updatePlaceById } from '@/db/places';
import { uploadImage } from '@/services/storage/upload';
import { checkUsernameAvailability, CommunityConfig } from '@citizenwallet/sdk';
import { revalidatePath } from 'next/cache';
import Config from '@/cw/community.json';

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
  const businessid = await getLinkedBusinessByUserId(client, userId);
  const busid = businessid.data?.linked_business_id;
  let url = oldimage;
  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  if (image.size != 0) {
    url = await uploadImage(client, image, busid);
  }
  const data = await updatePlaceById(client, placeId, {
    name,
    description,
    slug,
    image: url
  });
  revalidatePath(`/business/${busid}/places/${placeId}/profile`);

  return data;
}

export async function checkSlugAvailableAction(slug: string, placeId: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  const community = new CommunityConfig(Config);

  const available = await checkUsernameAvailability(community, slug);

  return available;
}
