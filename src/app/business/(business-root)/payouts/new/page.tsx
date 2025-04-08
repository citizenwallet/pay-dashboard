import { isUserAdminAction } from '@/actions/session';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Config from '@/cw/community.json';
import { getServiceRoleClient } from '@/db';
import { getPayoutById } from '@/db/payouts';
import { getPlaceById } from '@/db/places';
import { CommunityConfig } from '@citizenwallet/sdk';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { getAllPlacesAction } from './action';
import SelectPlace from './select-place';

interface PageProps {
  searchParams: Promise<{
    placeId?: string;
    lastPayoutId?: string;
  }>;
}

export default async function PayoutNewPage({ searchParams }: PageProps) {
  const { placeId, lastPayoutId } = await searchParams;
  const t = await getTranslations('addingpayout');

  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={t('newPayout')}
              description={t('newPayoutDescription')}
            />
          </div>
          <Separator />
          <Suspense
            fallback={<Skeleton className="h-full w-full flex-1 rounded-xl" />}
          >
            {AsyncPayoutNewPage({ placeId, lastPayoutId })}
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

async function AsyncPayoutNewPage({
  placeId,
  lastPayoutId
}: {
  placeId?: string;
  lastPayoutId?: string;
}) {
  const admin = await isUserAdminAction();
  if (!admin) {
    return <div>You are not authorized to view this page</div>;
  }
  const places = await getAllPlacesAction();
  const community = new CommunityConfig(Config);
  const client = getServiceRoleClient();
  let setSelectedDate: Date | undefined;
  if (placeId) {
    if (lastPayoutId) {
      const { data } = await getPayoutById(client, lastPayoutId);
      setSelectedDate = data?.to ? new Date(data?.to) : undefined;
    } else {
      const { data } = await getPlaceById(client, Number(placeId));
      setSelectedDate = data?.created_at
        ? new Date(data?.created_at)
        : undefined;
    }
  }

  return (
    <SelectPlace
      places={places}
      currencyLogo={community.community.logo}
      selectedPlaceId={placeId}
      setSelectedDate={setSelectedDate}
    />
  );
}
