'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToBusinessAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import Config from '@/cw/community.json';
import { upsertProfile } from '@/cw/profiles';
import { getServiceRoleClient } from '@/db';
import { checkUserAccessBusiness, getBusinessById } from '@/db/business';
import { isOwnerOfBusiness } from '@/db/businessUser';
import {
  createPlace,
  getPlaceById,
  getPlacesByBusinessId,
  handleVisibilityToggleceById,
  uniqueSlugPlace,
  updatePlaceAccounts
} from '@/db/places';
import { getUserLastPlace, isAdmin, updateLastplace } from '@/db/users';
import { generateRandomString } from '@/lib/utils';
import { uploadImage } from '@/services/storage/upload';
import {
  CommunityConfig,
  getCardAddress,
  verifyAndSuggestUsername
} from '@citizenwallet/sdk';
import { id } from 'ethers';
import { revalidatePath } from 'next/cache';

export async function uploadImageAction(
  businessId: number,
  file: File
): Promise<string> {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const isLinked = await isUserLinkedToBusinessAction(
    client,
    userId,
    businessId
  );
  if (!isLinked) {
    throw new Error('User does not have access to this business');
  }

  const url = await uploadImage(client, file, businessId);
  return url;
}

export const generateUniqueSlugAction = async (baseSlug: string) => {
  let slug = baseSlug;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const client = getServiceRoleClient();

    const { data, error } = await uniqueSlugPlace(client, slug);

    if (error && error.code !== 'PGRST116') {
      throw new Error('Error checking slug uniqueness');
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${generateRandomString(4)}`;
    attempts++;
  }

  throw new Error('Unable to generate unique slug after max attempts');
};

export async function createPlaceAction(
  businessId: number,
  name: string,
  description: string,
  slug: string,
  image: string
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const admin = await isAdmin(client, userId);

  if (!admin) {
    const isOwner = await isOwnerOfBusiness(client, userId, businessId);

    if (!isOwner) {
      throw new Error('User does not have access to this Activity');
    }
  }

  const invitationCode = generateRandomString(16);

  const community = new CommunityConfig(Config);

  const username = await verifyAndSuggestUsername(community, slug);
  if (!username) {
    return { error: 'Unable to generate unique slug for place' };
  }

  const { data: place, error } = await createPlace(client, {
    business_id: businessId,
    slug: username,
    name: name,
    description: description,
    accounts: [],
    invite_code: invitationCode,
    image: image || null,
    hidden: true,
    archived: false,
    display: 'amount'
  });

  if (!place || error) {
    throw new Error('Failed to create place');
  }

  const hashedSerial = id(`${businessId}:${place.id}`);

  const account = await getCardAddress(community, hashedSerial);
  if (!account) {
    return { error: 'Failed to get account address' };
  }

  try {
    await upsertProfile(community, username, name, account, description, image);
  } catch (error) {
    console.error('Failed to upsert profile', error);
  }

  await updatePlaceAccounts(client, place.id, [account]);

  await updateLastplace(client, userId, place.id);

  revalidatePath(`/business/${businessId}/places/${place.id}/list`);

  return place;
}

export const changeLastPlaceAction = async (placeid: number) => {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const data = await updateLastplace(client, userId, placeid);
  return data;
};

export const getLastPlaceIdAction = async () => {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const { data, error } = await getUserLastPlace(client, userId);
  if (error) {
    throw new Error('Failed to get last place');
  }
  if (!data) {
    throw new Error('Failed to get last place');
  }

  return data.place.id;
};

export const getLastPlaceAction = async () => {
  const client = getServiceRoleClient();
  const id = await getLastPlaceIdAction();
  const res = await getPlaceById(client, Number(id));
  return res.data;
};

export const handleVisibilityToggleAction = async (placeId: number) => {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return await handleVisibilityToggleceById(client, placeId);
};

export const checkUserAccessBusinessAction = async (businessId: number) => {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const res = await checkUserAccessBusiness(client, userId, businessId);
  return res;
};

export const getBusinessPlacesAction = async (businessId: number) => {
  const client = getServiceRoleClient();
  const res = await getPlacesByBusinessId(client, businessId);
  return res.data;
};

export const getBusinessAction = async (businessId: number) => {
  const client = getServiceRoleClient();
  const res = await getBusinessById(client, businessId);
  return res.data;
};

export const getPlaceByIdAction = async (placeId: number) => {
  const client = getServiceRoleClient();
  const res = await getPlaceById(client, placeId);
  return res.data;
};
