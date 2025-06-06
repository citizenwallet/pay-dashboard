'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToBusinessAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import {
  getLinkedBusinessByUserId,
  getBusinessById,
  checkUserAccessBusiness
} from '@/db/business';
import {
  createPlace,
  getPlaceById,
  getPlacesByBusinessId,
  handleVisibilityToggleceById,
  uniqueSlugPlace
} from '@/db/places';
import { generateRandomString } from '@/lib/utils';
import { uploadImage } from '@/services/storage/upload';
import { Wallet } from 'ethers';
import { getAccountAddress, CommunityConfig } from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { getLastplace, updateLastplace } from '@/db/users';

export async function getPlaceAction() {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const businessid = await getLinkedBusinessByUserId(client, userId);
  const places = await getPlacesByBusinessId(
    client,
    businessid.data?.linked_business_id
  );
  return places.data;
}

export async function uploadImageAction(file: File): Promise<string> {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const businessid = await getLinkedBusinessByUserId(client, userId);
  const busId = businessid.data?.linked_business_id;

  const url = await uploadImage(client, file, busId);
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

  const res = await isUserLinkedToBusinessAction(client, userId, businessId);
  if (!res) {
    throw new Error('User does not have access to this business');
  }

  const invitationCode = generateRandomString(16);

  const newPk = Wallet.createRandom();
  const address = newPk.address;

  const community = new CommunityConfig(Config);

  const account = await getAccountAddress(community, address);
  if (!account) {
    throw new Error('Failed to get account address');
  }

  const { data: place, error } = await createPlace(client, {
    business_id: businessId,
    slug: slug,
    name: name,
    description: description,
    accounts: [account],
    invite_code: invitationCode,
    image: image || null,
    hidden: true,
    archived: false,
    display: 'amount'
  });

  if (!place || error) {
    throw new Error('Failed to create place');
  }

  await updateLastplace(client, userId, place.id);

  return place;
}

export async function getBusinessIdAction(): Promise<number> {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const businessid = await getLinkedBusinessByUserId(client, userId);
  const busid = businessid.data?.linked_business_id;
  return busid;
}

export const getLinkedBusinessAction = async () => {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const businessid = await getLinkedBusinessByUserId(client, userId);
  const business = await getBusinessById(
    client,
    businessid.data?.linked_business_id
  );
  return business.data;
};

export const changeLastPlaceAction = async (placeid: number) => {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const data = await updateLastplace(client, userId, placeid);
  return data;
};

export const getLastPlaceIdAction = async () => {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const data = await getLastplace(client, userId);
  let lastId = data.data?.last_place;
  if (!lastId) {
    const places = await getPlaceAction();
    if (places && places.length > 0) {
      lastId = places[0].id;
    }
    return lastId;
  }

  return lastId;
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
