import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { getServiceRoleClient } from '@/db';
import { getBusinessById } from '@/db/business';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { getPlaceDataAction } from './action';
import ProfileEdit from './profile-edit';

export default async function page({
  params
}: {
  params: Promise<{ businessId: string; placeId: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations('profile');
  return (
    <>
      <div>
        <PageContainer>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Heading title={t('profile')} description={t('placeDetails')} />
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
  const client = getServiceRoleClient();
  const response = await getPlaceDataAction(
    parseInt(placeId),
    parseInt(businessId)
  );
  if (!response.data) {
    throw new Error('Place not found');
  }
  const place = response.data;

  const business = await getBusinessById(client, Number(businessId));
  if (!business.data) {
    throw new Error('Business not found');
  }
  const businessData = business.data;

  return <ProfileEdit place={place} business={businessData} />;
}
