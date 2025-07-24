'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { createSlug, generateRandomString } from '@/lib/utils';
import { generateUniqueSlugAction } from '../../action';
import { createPlace, updatePlaceAccounts } from '@/db/places';
import { getLinkedBusinessByUserId } from '@/db/business';
import {
  CommunityConfig,
  getCardAddress,
  verifyAndSuggestUsername
} from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { id } from 'ethers';
import { upsertProfile } from '@/cw/profiles';

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

    const community = new CommunityConfig(Config);

    const username = await verifyAndSuggestUsername(community, baseSlug);
    if (!username) {
      return { error: 'Unable to generate unique slug for place' };
    }

    const { data: business } = await getLinkedBusinessByUserId(client, userId);
    const { linked_business_id: linkedBusinessId } = business || {};
    const invitationCode = generateRandomString(16);

    const { data: place, error: placeError } = await createPlace(client, {
      business_id: linkedBusinessId,
      slug: username,
      name: name,
      description: description,
      accounts: [],
      invite_code: invitationCode,
      image: null,
      hidden: true,
      archived: false,
      display: 'amount'
    });

    if (placeError) {
      return { error: placeError.message };
    }

    if (!place) {
      return null;
    }

    const hashedSerial = id(`${linkedBusinessId}:${place.id}`);

    const account = await getCardAddress(community, hashedSerial);
    if (!account) {
      return { error: 'Failed to get account address' };
    }

    try {
      await upsertProfile(community, username, name, account, description);
    } catch (error) {
      console.error('Failed to upsert profile', error);
    }

    await updatePlaceAccounts(client, place.id, [account]);

    return place;
  } catch (error) {
    console.error('Error creating place:', error);
    return { error: 'Failed to create place', message: error };
  }
}
