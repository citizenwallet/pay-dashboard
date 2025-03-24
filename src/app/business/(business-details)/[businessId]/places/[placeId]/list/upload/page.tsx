import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import { getServiceRoleClient } from '@/db';
import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { checkUserPlaceAccess } from '@/db/places';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import UploadPlace from './upload-place';

interface Props {
  params: Promise<{
    businessId: string;
    placeId: string;
  }>;
}

export default async function ListPage({ params }: Props) {
  const resolvedParams = await params;
  return (
    <PageContainer scrollable>
      <div className="flex h-full min-h-svh flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="Upload" description="Upload your Place List" />
        </div>
        <Separator />
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
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

  return <UploadPlace />;
}
