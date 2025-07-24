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
import { getTranslations } from 'next-intl/server';

export default async function itempage({
  params
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;
  const t = await getTranslations('checkout');

  return (
    <div>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading title={t('items')} description={t('itemOfThePlace')} />
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          >
            {ListItemLoader(placeId)}
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
      displayMode={placeDisplay.data?.display ?? 'amountAndMenu'}
    />
  );
}
