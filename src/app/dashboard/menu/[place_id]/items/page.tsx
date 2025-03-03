import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import React, { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { getItemsAction } from './action';
import ItemListing from './Item-listing';
import Config from '@/cw/community.json';
import { CommunityConfig } from '@citizenwallet/sdk';
import { getServiceRoleClient } from '@/db';
import { getPlaceDisplay } from '@/db/places';

export default async function itempage({
  params
}: {
  params: Promise<{ place_id: string }>;
}) {
  const { place_id } = await params;
  return (
    <div>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading title="Items" description="Item of the place" />
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          >
            {ListItemLoader(place_id)}
          </Suspense>
        </div>
      </PageContainer>
    </div>
  );
}

async function ListItemLoader(place_id: string) {
  const client = getServiceRoleClient();
  const placeDisplay = await getPlaceDisplay(client, parseInt(place_id));

  const items = await getItemsAction(parseInt(place_id));

  const community = new CommunityConfig(Config);

  return (
    <ItemListing
      placeId={parseInt(place_id)}
      currencyLogo={community.community.logo}
      items={items.data ?? []}
      displayMode={placeDisplay.data?.display ?? 'amount'}
    />
  );
}
