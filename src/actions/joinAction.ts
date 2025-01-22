'use server';

import * as z from 'zod';

import { createBusiness } from '@/db/business';
import { createPlace } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { Wallet } from 'ethers';
import { getAccountAddress, CommunityConfig } from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { createSlug, generateRandomString } from '@/lib/utils';

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
  //   image?: File
) {
  console.log('Join Action', inviteCode, data);

  const client = getServiceRoleClient();

  //   let imageUrl = null;
  //   if (image) {
  //     const { url, error: uploadError } = await uploadImage(image, "businesses");
  //     if (uploadError) {
  //       return { error: `Failed to upload image: ${uploadError.message}` };
  //     }
  //     imageUrl = url;
  //   }

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

  const slug = `${createSlug(data.name)}-${generateRandomString(4)}`;

  const { error: placeError } = await createPlace(client, {
    name: data.name,
    slug,
    business_id: business.id,
    accounts: [account],
    invite_code: inviteCode,
    image: null
  });

  if (placeError) {
    return { error: placeError.message };
  }

  return { success: true };
}
