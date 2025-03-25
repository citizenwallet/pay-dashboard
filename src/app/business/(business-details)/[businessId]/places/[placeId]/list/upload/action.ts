'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { createSlug, generateRandomString } from '@/lib/utils';
import { generateUniqueSlugAction } from '../../action';
import { createPlace } from '@/db/places';
import { getLinkedBusinessByUserId } from '@/db/business';
import { Wallet } from 'ethers';
import { getAccountAddress, CommunityConfig } from '@citizenwallet/sdk';
import Config from '@/cw/community.json';

export async function downloadCsvTemplateAction() {
  const headers = ['Name', 'Description'];
  const exampleData = ['My place name', 'My place description'];

  const csvData = [headers.join(','), exampleData.join(',')].join('\n');

  return csvData;
}

export async function createPlaceWithoutSlugAction(
  name: string,
  description: string,
  placeId: number
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  try {
    const baseSlug = createSlug(name);
    const uniqueSlug = await generateUniqueSlugAction(baseSlug);

    const { data: business } = await getLinkedBusinessByUserId(client, userId);
    const { linked_business_id: linkedBusinessId } = business || {};
    const invitationCode = generateRandomString(16);

    const newPk = Wallet.createRandom();
    const address = newPk.address;

    const community = new CommunityConfig(Config);

    const account = await getAccountAddress(community, address);
    if (!account) {
      throw new Error('Failed to get account address');
    }

    const { data: place } = await createPlace(client, {
      business_id: linkedBusinessId,
      slug: uniqueSlug,
      name: name,
      description: description,
      accounts: [account],
      invite_code: invitationCode,
      image: null,
      hidden: true,
      archived: false,
      display: 'amount'
    });

    return place;
  } catch (error) {
    console.error('Error creating place:', error);
    return { error: 'Failed to create place', message: error };
  }
}
