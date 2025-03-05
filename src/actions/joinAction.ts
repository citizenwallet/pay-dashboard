'use server';

import * as z from 'zod';

import { createBusiness } from '@/db/business';
import { createPlace } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { Wallet } from 'ethers';
import { getAccountAddress, CommunityConfig } from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { createSlug, generateRandomString } from '@/lib/utils';
import { createUser } from './createUser';

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

  const newPk = Wallet.createRandom();
  const address = newPk.address;

  const community = new CommunityConfig(Config);

  const account = await getAccountAddress(community, address);
  if (!account) {
    return { error: 'Failed to get account address' };
  }

  const { data: business, error: businessError } = await createBusiness(
    client,
    {
      name: data.name,
      status: null,
      vat_number: '',
      business_status: 'created',
      account,
      email: data.email,
      phone: data.phone,
      invite_code: inviteCode
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

  const { error: placeError } = await createPlace(client, {
    name: data.name,
    slug,
    business_id: business.id,
    accounts: [account],
    invite_code: inviteCode,
    image: null,
    display: 'amount',
    hidden: true,
    description: data.description,
    archived: false
  });

  if (placeError) {
    return { error: placeError.message };
  }

  return { success: true };
}
