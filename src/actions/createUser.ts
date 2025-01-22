'use server';

import * as z from 'zod';

import { createBusiness } from '@/db/business';
import { createPlace } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { Wallet } from 'ethers';
import { getAccountAddress, CommunityConfig } from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { createSlug, generateRandomString } from '@/lib/utils';

export async function createUser(data: any) {
  const client = getServiceRoleClient();
  return client.from('users').insert(data);
}
