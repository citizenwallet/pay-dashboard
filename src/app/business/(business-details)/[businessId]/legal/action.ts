'use server';

import { getServiceRoleClient } from '@/db';
import { updateBusiness } from '@/db/business';
import { checkUserAccessBusinessAction } from '../places/[placeId]/action';

export async function updateBusinessLegalAction(
  businessId: number,
  terms: boolean,
  membership: boolean
) {
  const client = getServiceRoleClient();

  const hasAccess = await checkUserAccessBusinessAction(Number(businessId));

  if (!hasAccess) {
    throw new Error('User does not have access to this business');
  }

  const business = await updateBusiness(client, businessId, {
    accepted_terms_and_conditions: terms ? new Date().toISOString() : null,
    accepted_membership_agreement: membership ? new Date().toISOString() : null
  });
  return business;
}
