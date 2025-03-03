'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getBusinessIdByUserId } from '@/db/business';
import { createPlace, getPlacesByBusinessId, Place, uniqueSlugPlace } from '@/db/places';
import { generateRandomString } from '@/lib/utils';
import { uploadImage } from '@/services/storage/upload';
import { Wallet } from 'ethers';
import { getAccountAddress, CommunityConfig } from '@citizenwallet/sdk';
import Config from '@/cw/community.json';


export async function getPlaceAction() {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const businessid = await getBusinessIdByUserId(client, userId);
  const places = await getPlacesByBusinessId(
    client,
    businessid.data?.linked_business_id
  );
  return places.data;
}

export async function uploadImageAction(file: File): Promise<string> {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const businessid = await getBusinessIdByUserId(client, userId);
  const busid = businessid.data?.linked_business_id;

  const url = await uploadImage(client, file, busid);
  return url;
}

export const generateUniqueSlugAction = async (baseSlug: string) => {
  let slug = baseSlug;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const client = getServiceRoleClient();

    const { data, error } = await uniqueSlugPlace(client, slug);

    if (error && error.code !== "PGRST116") { 
      throw new Error("Error checking slug uniqueness");
    }

    if (!data) {
      return slug; 
    }

    slug = `${baseSlug}-${generateRandomString(4)}`;
    attempts++;
  }

  throw new Error("Unable to generate unique slug after max attempts");
};

export async function createPlaceAction(
  name:string,
  slug:string,
  image:string
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const businessid = await getBusinessIdByUserId(client, userId);
  const busid = businessid.data?.linked_business_id;
  const invitationCode = generateRandomString(16);

  const newPk = Wallet.createRandom();
  const address = newPk.address;

  const community = new CommunityConfig(Config);

  const account = await getAccountAddress(community, address);
  if (!account) {
    return { error: 'Failed to get account address' };
  }

  const newplace = await createPlace(client,{
    business_id: busid,
    slug: slug,
    name: name,
    accounts:[account],
    invite_code:invitationCode,
    image:image
  })

  return newplace;
}

