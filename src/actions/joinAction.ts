'use server';

import * as z from 'zod';

import { createBusiness } from '@/db/business';
import { createPlace, updatePlaceAccounts } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { id } from 'ethers';
import { CommunityConfig, getCardAddress } from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { createSlug, generateRandomString } from '@/lib/utils';
import { createUser } from '@/db/users';

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
  let slug = baseSlug;
  let attempts = 0;
  const maxAttempts = 5;

  // Keep trying until we find a unique slug or hit max attempts
  while (attempts < maxAttempts) {
    const { data: existingPlace } = await client
      .from('places')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!existingPlace) {
      break;
    }

    // If place exists, try a new random string
    slug = `${baseSlug}-${generateRandomString(4)}`;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    return { error: 'Unable to generate unique slug for place' };
  }

  const { data: place, error: placeError } = await createPlace(client, {
    name: 'My Place',
    slug,
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

  const community = new CommunityConfig(Config);

  const hashedSerial = id(`${business.id}:${place.id}`);

  const account = await getCardAddress(community, hashedSerial);
  if (!account) {
    return { error: 'Failed to get account address' };
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
