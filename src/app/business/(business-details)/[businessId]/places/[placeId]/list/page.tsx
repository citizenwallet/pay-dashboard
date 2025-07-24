import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { getServiceRoleClient } from '@/db';
import { isOwnerOfBusiness } from '@/db/businessUser';
import {
  checkUserPlaceAccess,
  getPlacesByBusinessIdWithLimit,
  getPlacesCountByBusinessId
} from '@/db/places';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import PlacesPage from './places';

interface Props {
  params: Promise<{
    businessId: string;
    placeId: string;
  }>;
  searchParams: Promise<{
    offset?: string;
    limit?: string;
    search?: string;
  }>;
}

export default async function ListPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('placelist');
  return (
    <PageContainer scrollable>
      <div className="flex h-full min-h-svh flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title={t('list')} description={t('listDescription')} />
        </div>
        <Separator />
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
          <AsyncPage
            businessId={resolvedParams.businessId}
            placeId={resolvedParams.placeId}
            search={resolvedSearchParams.search}
            offset={
              resolvedSearchParams.offset
                ? Number(resolvedSearchParams.offset)
                : undefined
            }
            limit={
              resolvedSearchParams.limit
                ? Number(resolvedSearchParams.limit)
                : undefined
            }
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}

async function AsyncPage({
  businessId,
  placeId,
  search,
  offset,
  limit
}: {
  businessId: string;
  placeId: string;
  search?: string;
  offset?: number;
  limit?: number;
}) {
  let isOwner = false;
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
  if (!limit) {
    limit = 10;
  }
  if (!offset) {
    offset = 0;
  }
  const places = await getPlacesByBusinessIdWithLimit(
    client,
    Number(businessId),
    Number(limit),
    Number(offset),
    search
  );
  const placesCount = await getPlacesCountByBusinessId(
    client,
    Number(businessId)
  );

  isOwner = admin
  if (!admin) {
    isOwner = await isOwnerOfBusiness(
      client,
      userId,
      Number(businessId)
    );

  }

  return (
    <PlacesPage
      businessId={Number(businessId)}
      placeId={placeId}
      place={places.data ? places.data.flat() : []}
      offset={offset}
      limit={limit}
      search={search ?? null}
      count={placesCount.count}
      isOwner={isOwner}
    />
  );
}
