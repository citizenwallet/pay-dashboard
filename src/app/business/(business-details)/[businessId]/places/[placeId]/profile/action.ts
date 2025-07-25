'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import Config from '@/cw/community.json';
import { upsertProfile } from '@/cw/profiles';
import { getServiceRoleClient } from '@/db';
import { getPlaceById, updatePlaceById } from '@/db/places';
import { uploadImage } from '@/services/storage/upload';
import { checkUsernameAvailability, CommunityConfig } from '@citizenwallet/sdk';
import { revalidatePath } from 'next/cache';

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
  description: string | null;
  slug: string;
  image: File | null;
  oldimage: string;
}) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const { data: place } = await getPlaceById(client, placeId);
  if (!place) {
    throw new Error('Place not found');
  }

  let url = oldimage;
  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  if (image && image.size > 0) {
    url = await uploadImage(client, image, place.business_id);
  }

  const community = new CommunityConfig(Config);

  // Only pass the URL to upsertProfile if it's not a blob URL
  const imageUrl = url && !url.startsWith('blob:') ? url : null;

  await upsertProfile(
    community,
    slug.trim(),
    name.trim(),
    place.accounts[0],
    description?.trim() || '',
    imageUrl
  );

  const data = await updatePlaceById(client, placeId, {
    name,
    description,
    slug,
    image: url
  });
  revalidatePath(`/business/${place.business_id}/places/${placeId}/profile`);

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
