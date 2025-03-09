import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';

import QrPage from './qr-page';

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
          <Suspense fallback={<div>Loading...</div>}>
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
  return <QrPage />;
}
