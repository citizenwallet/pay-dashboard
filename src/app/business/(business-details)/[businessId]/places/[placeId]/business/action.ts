'use server';

import { getServiceRoleClient } from '@/db';
import { Business, updateBusiness } from '@/db/business';
import { isOwnerOfBusiness } from '@/db/businessUser';
import { isAdmin } from '@/db/users';
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
  const admin = await isAdmin(client, userId);

  if (!admin) {
    const isOwner = await isOwnerOfBusiness(client, userId, businessId);

    if (!isOwner) {
      throw new Error('User does not have access to this Activity');
    }
  }
  revalidatePath(`/business/${businessId}/places/${placeId}/business`);
  return await updateBusiness(client, businessId, business);
};
