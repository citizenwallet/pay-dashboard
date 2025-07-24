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
import { checkUserPlaceAccess } from '@/db/places';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import UploadPlace from './upload-place';

interface Props {
  params: Promise<{
    businessId: string;
    placeId: string;
  }>;
}

export default async function ListPage({ params }: Props) {
  const resolvedParams = await params;
  const t = await getTranslations('placeUpload');
  return (
    <div>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading title={t('upload')} description={t('uploadDescription')} />
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
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
    const isOwner = await isOwnerOfBusiness(client, userId, Number(businessId));

    if (!isOwner) {
      throw new Error('User does not have access to this Place');
    }
  }


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

  return <UploadPlace placeId={placeId} />;
}
