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
import { getTranslations } from 'next-intl/server';

export default async function QRPage({
  params
}: {
  params: Promise<{ businessId: string; placeId: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations('qr');
  return (
    <PageContainer scrollable>
      <div className="flex h-full min-h-svh flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title={t('QrCode')} description={t('qrDescription')} />
        </div>
        <Separator />
        <Suspense
          fallback={<Skeleton className="h-full w-full flex-1 rounded-xl" />}
        >
          <AsyncPage
            businessId={resolvedParams.businessId}
            placeId={resolvedParams.placeId}
          />
        </Suspense>
      </div>
    </PageContainer>
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
