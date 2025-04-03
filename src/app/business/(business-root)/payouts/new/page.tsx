import { isUserAdminAction } from '@/actions/session';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import SelectPlace from './select-place';
import { getAllPlacesAction } from './action';
import { CommunityConfig } from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { getTranslations } from 'next-intl/server';

export default async function PayoutNewPage() {
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
          <Suspense fallback={<>Loading...</>}>{AsyncPayoutNewPage()}</Suspense>
        </div>
      </PageContainer>
    </>
  );
}

async function AsyncPayoutNewPage() {
  const admin = await isUserAdminAction();
  if (!admin) {
    return <div>You are not authorized to view this page</div>;
  }
  const places = await getAllPlacesAction();
  const community = new CommunityConfig(Config);

  return (
    <SelectPlace places={places} currencyLogo={community.community.logo} />
  );
}
