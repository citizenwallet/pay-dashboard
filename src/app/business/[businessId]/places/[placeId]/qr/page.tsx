import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';

import QrPage from './qr-page';
import { getPlaceDataAction } from './action';

export default async function QRPage({
  params
}: {
  params: Promise<{ businessId: string; placeId: string }>;
}) {
  const resolvedParams = await params;
  return (
    <div>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title="QR Code  "
              description="Manage your Place QR Code"
            />
          </div>
          <Separator />
          <Suspense fallback={<></>}>
            <AsyncPage
              businessId={resolvedParams.businessId}
              placeId={resolvedParams.placeId}
            />
          </Suspense>
        </div>
      </PageContainer>
    </div>
  );
}

async function AsyncPage({
  businessId,
  placeId
}: {
  businessId: string;
  placeId: string;
}) {
  const place = await getPlaceDataAction(
    parseInt(placeId),
    parseInt(businessId)
  );
  if (!place) {
    throw new Error('Place not found');
  }
  return <QrPage place={place.data} />;
}
