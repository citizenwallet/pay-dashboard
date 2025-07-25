'use server';

import { isUserOwnerOrAdminOfBusinessAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { Business, updateBusiness } from '@/db/business';
import { fetchCompanyForVatNumber } from '@/services/vat';
import { revalidatePath } from 'next/cache';

export const fetchBusinessDetailsAction = async (vat: string) => {
  try {
    const company = await fetchCompanyForVatNumber(vat);
    return company;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateBusinessDetailsAction = async (
  businessId: number,
  userId: number,
  placeId: number,
  business: Pick<
    Business,
    | 'name'
    | 'email'
    | 'phone'
    | 'vat_number'
    | 'address_legal'
    | 'legal_name'
    | 'iban_number'
    | 'business_status'
  >
) => {
  const client = getServiceRoleClient();

  const isOwner = await isUserOwnerOrAdminOfBusinessAction(
    client,
    userId,
    businessId
  );

  if (!isOwner) {
    throw new Error('User does not have access to this Activity');
  }

  revalidatePath(`/business/${businessId}/places/${placeId}/business`);
  return await updateBusiness(client, businessId, business);
};
