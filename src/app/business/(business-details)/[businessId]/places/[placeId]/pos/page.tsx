import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import React, { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import PosListing from './pos-listing';
import { getPosAction } from './action';
import { getTranslations } from 'next-intl/server';

export default async function PosPage({
  params
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;
  const t = await getTranslations('pos');

  return (
    <div>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading title={t('title')} description={t('description')} />
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          >
            {PosLoader(placeId)}
          </Suspense>
        </div>
      </PageContainer>
    </div>
  );
}

async function PosLoader(place_id: string) {
  const pos = await getPosAction(parseInt(place_id));

  return <PosListing placeId={parseInt(place_id)} items={pos.data ?? []} />;
}
