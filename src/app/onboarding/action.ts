'use server';

import { getServiceRoleClient } from '@/db';
import { updateBusiness } from '@/db/business';
import { createBusinessUser } from '@/db/businessUser';

import {
  getFirstPlace,
  getUserIdbyBusinessId,
  updateLastplace
} from '@/db/users';

export async function updateBusinessVatAction(vat: string, businessId: number) {
  const client = getServiceRoleClient();
  const business = await updateBusiness(client, businessId, {
    vat_number: vat
  });
  return business;
}

export async function updateBusinessDetailsAction(
  businessId: number,
  legalName: string,
  address: string,
  iban: string
) {
  const client = getServiceRoleClient();

  const business = await updateBusiness(client, businessId, {
    legal_name: legalName,
    address_legal: address,
    iban_number: iban,
    status: 'Registered'
  });

  //get user id by business id
  const userId = await getUserIdbyBusinessId(client, businessId);

  //create business user
  const businessUser = await createBusinessUser(
    client,
    userId,
    businessId,
    'owner'
  );

  const places = await getFirstPlace(client, businessId);
  if (places.data) {
    await updateLastplace(client, userId, places.data.id);
  }

  return business;
}
