import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Suspense } from 'react';
import PayoutDetailsPage from './payout-details';
import {
  getUserIdFromSessionAction,
  isUserAdminAction
} from '@/actions/session';
import { checkUserPlaceAccess } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { getPayoutsbyPaceIdAction } from './action';
import Config from '@/cw/community.json';
import { CommunityConfig } from '@citizenwallet/sdk';
import { getTranslations } from 'next-intl/server';

export default async function PayoutsPage({
  params
}: {
  params: Promise<{ businessId: string; placeId: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations('payouts');

  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={t('Payouts')}
              description={t('Payoutsdescription')}
            />
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
          >
            <PayoutsAsyncPage
              placeId={resolvedParams.placeId}
              businessId={resolvedParams.businessId}
            />
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}

async function PayoutsAsyncPage({
  placeId,
  businessId
}: {
  placeId: string;
  businessId: string;
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

  const payouts = await getPayoutsbyPaceIdAction(Number(placeId));
  const community = new CommunityConfig(Config);

  return (
    <PayoutDetailsPage
      payouts={payouts}
      placeId={placeId}
      businessId={businessId}
      currencyLogo={community.community.logo}
    />
  );
}
