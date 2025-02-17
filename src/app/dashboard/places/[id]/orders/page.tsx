import { getOrdersByPlace } from '@/db/orders';
import { getPlaceById } from '@/db/places';
import { OrdersPage } from './_components/orders-page';
import { Suspense } from 'react';
import { getServiceRoleClient } from '@/db';
import Config from '@/cw/community.json';
import { CommunityConfig } from '@citizenwallet/sdk';

export const metadata = {
  title: 'Place Orders'
};

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page(props: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncPage {...props} />
    </Suspense>
  );
}

async function AsyncPage({ params }: Props) {
  const client = getServiceRoleClient();
  const { id } = await params;
  const placeId = parseInt(id);

  const [place, ordersResponse] = await Promise.all([
    getPlaceById(client, placeId),
    getOrdersByPlace(client, placeId)
  ]);

  if (!place.data) {
    throw new Error('Place not found');
  }

  const community = new CommunityConfig(Config);

  return (
    <OrdersPage
      place={place.data}
      orders={ordersResponse.data || []}
      currencyLogo={community.community.logo}
    />
  );
}
