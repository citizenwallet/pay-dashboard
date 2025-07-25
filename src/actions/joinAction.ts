'use server';

import * as z from 'zod';

import { createBusiness } from '@/db/business';
import { createPlace, updatePlaceAccounts } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { id } from 'ethers';
import {
  CommunityConfig,
  getCardAddress,
  verifyAndSuggestUsername
} from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { createSlug } from '@/lib/utils';
import { createUser } from '@/db/users';
import { upsertProfile } from '@/cw/profiles';

const joinFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.'
  }),
  email: z
    .string()
    .min(1, {
      message: 'Email is required.'
    })
    .email({
      message: 'Please enter a valid email address.'
    }),
  phone: z.string().min(1, {
    message: 'Phone number is required.'
  }),
  description: z.string().min(1, {
    message: 'Description is required.'
  }),
  image: z.string().optional()
});

export async function joinAction(
  inviteCode: string,
  data: z.infer<typeof joinFormSchema>
) {
  const client = getServiceRoleClient();

  const { data: business, error: businessError } = await createBusiness(
    client,
    {
      name: data.name,
      status: null,
      vat_number: '',
      business_status: 'created',
      email: data.email,
      phone: data.phone,
      invite_code: inviteCode,
      iban_number: '',
      address_legal: '',
      legal_name: '',
      accepted_membership_agreement: null,
      accepted_terms_and_conditions: null
    }
  );

  if (businessError) {
    return { error: businessError.message };
  }

  // Try to create a unique slug
  const baseSlug = createSlug(data.name);

  const community = new CommunityConfig(Config);

  const username = await verifyAndSuggestUsername(community, baseSlug);
  if (!username) {
    return { error: 'Unable to generate unique slug for place' };
  }

  const { data: place, error: placeError } = await createPlace(client, {
    name: 'My Place',
    slug: username,
    business_id: business.id,
    accounts: [],
    invite_code: inviteCode,
    image: null,
    display: 'amount',
    hidden: true,
    description: '',
    archived: false
  });

  if (placeError) {
    return { error: placeError.message };
  }

  if (!place) {
    return { error: 'Failed to create place' };
  }

  const hashedSerial = id(`${business.id}:${place.id}`);

  const account = await getCardAddress(community, hashedSerial);
  if (!account) {
    return { error: 'Failed to get account address' };
  }

  try {
    await upsertProfile(
      community,
      username,
      data.name,
      account,
      data.description,
      data.image
    );
  } catch (error) {
    console.error('Failed to upsert profile', error);
  }

  await updatePlaceAccounts(client, place.id, [account]);

  //create the new user
  const user = await createUser(client, {
    name: data.name,
    email: data.email,
    phone: data.phone,
    linked_business_id: business.id
  });

  return { success: true };
}
