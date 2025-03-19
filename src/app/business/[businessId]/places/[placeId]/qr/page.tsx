import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';

import QrPage from './qr-page';
import { getServiceRoleClient } from '@/db';
import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { checkUserPlaceAccess, getPlaceById } from '@/db/places';
import { Skeleton } from '@/components/ui/skeleton';

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
          <Suspense
            fallback={<Skeleton className="h-[500px] w-[100%] rounded-xl" />}
          >
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
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const admin = await isUserAdminAction();

  if (!admin) {
    const hasPlaceAccess = await checkUserPlaceAccess(
      client,
      userId,
      Number(placeId)
    );
    if (!hasPlaceAccess) {
      throw new Error('You do not have access to this place');
    }
  }

  const place = await getPlaceById(client, Number(placeId));
  if (!place) {
    throw new Error('Place not found');
  }
  return <QrPage place={place.data} />;
}
