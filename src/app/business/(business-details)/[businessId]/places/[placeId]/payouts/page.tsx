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
import { checkUserPlaceAccess, getPlaceById } from '@/db/places';
import { getServiceRoleClient } from '@/db';
import { getPayoutsbyPaceIdAction } from './action';
import Config from '@/cw/community.json';
import { CommunityConfig, getAccountBalance } from '@citizenwallet/sdk';
import { getTranslations } from 'next-intl/server';
import { formatCurrencyNumber } from '@/lib/currency';
import CurrencyLogo from '@/components/currency-logo';
import { Skeleton } from '@/components/ui/skeleton';

export default async function PayoutsPage({
  params
}: {
  params: Promise<{ businessId: string; placeId: string }>;
}) {
  const resolvedParams = await params;
  const t = await getTranslations('payouts');

  const community = new CommunityConfig(Config);
  const currencyLogo = community.community.logo;

  return (
    <>
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Suspense
              fallback={
                <div className="flex flex-col gap-2">
                  <Heading
                    title={t('payouts')}
                    description={t('payoutsDescription')}
                  />
                  <div className="flex items-center gap-1 text-2xl font-bold">
                    <span className="text-gray-500">{t('accountBalance')}</span>
                    <CurrencyLogo logo={currencyLogo} size={32} />{' '}
                    <Skeleton className="h-6 w-40" />
                  </div>
                </div>
              }
            >
              <PayoutsHeader placeId={resolvedParams.placeId} />
            </Suspense>
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

async function PayoutsHeader({ placeId }: { placeId: string }) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const admin = await isUserAdminAction();
  const t = await getTranslations('payouts');

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
  if (!place.data) {
    throw new Error('Place not found');
  }

  const community = new CommunityConfig(Config);
  const currencyLogo = community.community.logo;
  const tokenDecimals = community.primaryToken.decimals;

  const balance = await getAccountBalance(
    community,
    place.data.accounts[0] ?? ''
  );

  return (
    <div className="flex flex-col gap-2">
      <Heading title={t('payouts')} description={t('payoutsDescription')} />
      <div className="flex items-center gap-1 text-2xl font-bold">
        <span className="text-gray-500">{t('accountBalance')}</span>
        <CurrencyLogo logo={currencyLogo} size={32} />
        {formatCurrencyNumber(Number(balance ?? 0), tokenDecimals)}
      </div>
    </div>
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

  const place = await getPlaceById(client, Number(placeId));
  if (!place.data) {
    throw new Error('Place not found');
  }

  const payouts = await getPayoutsbyPaceIdAction(Number(placeId));
  const community = new CommunityConfig(Config);

  const balance = await getAccountBalance(
    community,
    place.data.accounts[0] ?? ''
  );

  return (
    <PayoutDetailsPage
      payouts={payouts}
      placeId={placeId}
      businessId={businessId}
      currencyLogo={community.community.logo}
      balance={formatCurrencyNumber(
        Number(balance),
        community.primaryToken.decimals
      )}
    />
  );
}
