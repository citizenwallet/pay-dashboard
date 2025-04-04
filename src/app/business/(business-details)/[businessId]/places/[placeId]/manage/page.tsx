import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import ManagePage from './managePage';
import { getPlaceDataAction, placeHasOrdersAction } from './action';
import { getTranslations } from 'next-intl/server';

export default async function page({
  params
}: {
  params: Promise<{ businessId: string; placeId: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations('manage');
  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading title={t('manage')} description={t('manageDescription')} />
          </div>
          <Separator />
          <Suspense fallback={<div>Loading...</div>}>
            <AsyncPage placeId={resolvedParams.placeId} />
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

async function AsyncPage({ placeId }: { placeId: string }) {
  const place = await getPlaceDataAction(parseInt(placeId));
  const hasOrders = await placeHasOrdersAction(parseInt(placeId));
  return <ManagePage place={place.data} hasOrders={hasOrders} />;
}
