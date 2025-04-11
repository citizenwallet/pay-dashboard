'use server';
import { getServiceRoleClient } from '@/db';
import { getAllBusiness } from '@/db/business';
import { getPlacesByBusinessId } from '@/db/places';
import { CommunityConfig, getAccountBalance } from '@citizenwallet/sdk';

export async function getAllBusinessAction() {
  const client = getServiceRoleClient();
  const businesses = await getAllBusiness(client);
  return businesses.data;
}

export async function getBusinessBalanceAction(
  businessId: number,
  community: CommunityConfig
) {
  const client = getServiceRoleClient();
  const places = await getPlacesByBusinessId(client, businessId);
  let totalBalance = 0;
  for (const place of places.data ?? []) {
    const placeAccount = place.accounts[0];

    const balance = await getAccountBalance(community, placeAccount);

    if (balance !== null) {
      totalBalance += Number(balance);
    }
  }
  return totalBalance;
}
