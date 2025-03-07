import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import ManagePage from './managePage';
import { getPlaceDataAction, getPlaceOrderAction } from './action';

export default async function page({
  params
}: {
  params: Promise<{ businessId: string; placeId: string }>;
}) {
  const resolvedParams = await params;
  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading title="Manage" description="Manage your Place action" />
          </div>
          <Separator />
          <Suspense fallback={<div>Loading...</div>}>
            <AsyncPage
              businessId={resolvedParams.businessId}
              placeId={resolvedParams.placeId}
            />
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

async function AsyncPage({
  businessId,
  placeId
}: {
  businessId: string;
  placeId: string;
}) {
  const place = await getPlaceDataAction(parseInt(placeId));
  const order = await getPlaceOrderAction(parseInt(placeId));
  const count = order.data?.length;
  return <ManagePage place={place.data} orderPlace={count} />;
}
