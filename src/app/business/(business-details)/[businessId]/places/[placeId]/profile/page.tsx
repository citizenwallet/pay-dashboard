import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import ProfileEdit from './profile-edit';
import { getPlaceDataAction } from './action';
import { getTranslations } from 'next-intl/server';

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
              <Heading title={t('Profile')} description={t('Placedetails')} />
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
  const response = await getPlaceDataAction(
    parseInt(placeId),
    parseInt(businessId)
  );
  const place = response.data;
  return <ProfileEdit place={place} />;
}
