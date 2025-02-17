import { getOrdersByPlace, getOrdersByPlaceCount } from '@/db/orders';
import { getPlaceById, checkUserPlaceAccess } from '@/db/places';
import { OrdersPage } from './_components/orders-page';
import { Suspense } from 'react';
import { getServiceRoleClient } from '@/db';
import Config from '@/cw/community.json';
import { CommunityConfig, getAccountBalance } from '@citizenwallet/sdk';
import { isAdmin } from '@/db/users';
import { getUserIdFromSession } from '@/actions/session';

export const metadata = {
  title: 'Place Orders'
};

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: {
    offset?: string;
    limit?: string;
  };
}

export default async function Page(props: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncPage {...props} />
    </Suspense>
  );
}

async function AsyncPage({ params, searchParams }: Props) {
  const client = getServiceRoleClient();
  const { id } = await params;
  const placeId = parseInt(id);

  const userId = await getUserIdFromSession();

  const admin = await isAdmin(client, userId);
  if (!admin) {
    const hasPlaceAccess = await checkUserPlaceAccess(client, userId, placeId);
    if (!hasPlaceAccess) {
      throw new Error('You do not have access to this place');
    }
  }

  // Get pagination params from search params
  const limit = parseInt(searchParams.limit || '20');
  const offset = parseInt(searchParams.offset || '0');

  const [place, ordersResponse, ordersCount] = await Promise.all([
    getPlaceById(client, placeId),
    getOrdersByPlace(client, placeId, limit, offset),
    getOrdersByPlaceCount(client, placeId)
  ]);

  if (!place.data) {
    throw new Error('Place not found');
  }

  const community = new CommunityConfig(Config);

  const balance = await getAccountBalance(
    community,
    place.data.accounts[0] ?? ''
  );

  const balanceWithDecimals = balance
    ? Number(balance) / 10 ** community.primaryToken.decimals
    : 0;

  return (
    <OrdersPage
      place={place.data}
      orders={ordersResponse.data || []}
      currencyLogo={community.community.logo}
      pagination={{
        limit,
        offset,
        totalItems: ordersCount.count || 0
      }}
      balance={balanceWithDecimals}
    />
  );
}
