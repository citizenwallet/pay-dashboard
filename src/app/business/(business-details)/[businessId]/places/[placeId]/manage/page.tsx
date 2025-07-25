import { auth } from '@/auth';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { getServiceRoleClient } from '@/db';
import { isOwnerOfBusiness } from '@/db/businessUser';
import { isAdmin } from '@/db/users';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getPlaceDataAction, placeHasOrdersAction } from './action';
import ManagePage from './managePage';

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
            <AsyncPage placeId={resolvedParams.placeId} businessId={resolvedParams.businessId} />
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

async function AsyncPage({ placeId, businessId }: { placeId: string, businessId: string }) {

  let isOwner = false;
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const client = getServiceRoleClient();

  const admin = await isAdmin(client, parseInt(session.user.id));
  isOwner = admin;

  if (!admin) {
    isOwner = await isOwnerOfBusiness(
      client,
      parseInt(session.user.id),
      Number(businessId)
    );

  }

  const place = await getPlaceDataAction(parseInt(placeId));
  const hasOrders = await placeHasOrdersAction(parseInt(placeId));
  return <ManagePage
    place={place.data}
    hasOrders={hasOrders}
    isOwner={isOwner}
  />;
}
